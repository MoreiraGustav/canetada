/**
 * Motor macro mensal (GDD §3 e §6.2): economia agregada, indicadores sociais
 * e aprovação por setor. Coeficientes em `constants/balance.ts`.
 */
import {
  ECONOMY,
  HONEYMOON_BONUS,
  HONEYMOON_TURNS,
  IDEOLOGY,
  MAX_SIGNAL,
  SECTOR_ADJUSTMENT_SPEED,
  SECTOR_IDEOLOGY,
  SECTOR_SENSITIVITIES,
  SIGNAL_SCALES,
  SOCIAL,
} from '@/constants/balance';
import { MONTHS_PER_YEAR } from '@/constants/game';
import { INITIAL_METRICS, METRIC_BOUNDS } from '@/constants/metrics';
import { INITIAL_SECTOR_APPROVAL, SECTOR_KEYS } from '@/constants/sectors';
import type {
  ApprovalSignals,
  Country,
  DifficultyConfig,
  GameMetrics,
  MetricKey,
  Rng,
  SectorApproval,
  SectorKey,
  SimulationState,
} from '@/types';
import { getTurnDate } from '@/utils/calendar';
import { clamp } from '@/utils/math';
import { calculateApproval } from './approval';
import { randomNormal } from './random';

export { calculateApproval } from './approval';

const REF = INITIAL_METRICS;
/** Flag canônica (dados): o governo rompeu a regra fiscal. */
const FLAG_FISCAL_RULE_BROKEN = 'arcabouco-fiscal-rompido';
const SCORE_MAX = 100;

const clampMetrics = (metrics: GameMetrics): GameMetrics =>
  Object.fromEntries(
    (Object.keys(metrics) as MetricKey[]).map((key) => [key, clamp(metrics[key], METRIC_BOUNDS[key].min, METRIC_BOUNDS[key].max)]),
  ) as unknown as GameMetrics;

/** Relação média ponderada por peso econômico (sem países: média simples). */
export const weightedRelation = (state: SimulationState, countries?: readonly Country[]): number => {
  const ids = Object.keys(state.relations) as Array<keyof SimulationState['relations']>;
  if (!countries || countries.length === 0) return ids.reduce((acc, id) => acc + state.relations[id], 0) / Math.max(1, ids.length);
  const totalWeight = countries.reduce((acc, country) => acc + country.economicWeight, 0);
  return countries.reduce((acc, country) => acc + state.relations[country.id] * country.economicWeight, 0) / totalWeight;
};

const confidence = (state: SimulationState): number => (state.sectors.market + state.sectors.business) / 2 - ECONOMY.confidenceReference;

// ─── Economia ──────────────────────────────────────────────────────────────

interface MacroContext {
  m: GameMetrics;
  realRate: number;
  gap: number;
  noise: (sd: number) => number;
}

/** Expectativas = meta + desancoragem por dívida alta e déficit acima do limiar. */
const expectedInflation = (m: GameMetrics): number =>
  ECONOMY.inflationTarget +
  ECONOMY.expectationsDebtPenalty * Math.max(0, m.debt - ECONOMY.debtRiskThreshold) +
  ECONOMY.expectationsDeficitPenalty * Math.max(0, -m.primaryBalance - ECONOMY.deficitRiskThreshold);

/** Variação cambial mensal (%): juro real, risco fiscal, confiança, reversão ao equilíbrio e ruído. */
const stepExchangeRate = (ctx: MacroContext, state: SimulationState): number => {
  const { m } = ctx;
  const fairValue = ECONOMY.fxFairValue * (1 + ECONOMY.fxFairDriftPerYear) ** (state.turn / MONTHS_PER_YEAR);
  const changePct =
    -ECONOMY.fxRealRateEffect * (ctx.realRate - ECONOMY.neutralRealRate) +
    ECONOMY.fxDebtRisk * Math.max(0, m.debt - ECONOMY.debtRiskThreshold) +
    ECONOMY.fxDeficitRisk * Math.max(0, -m.primaryBalance - ECONOMY.deficitRiskThreshold) -
    ECONOMY.fxConfidenceEffect * (state.sectors.market - ECONOMY.confidenceReference) +
    ECONOMY.fxReversion * ((fairValue - m.exchangeRate) / m.exchangeRate) * 100 +
    ctx.noise(ECONOMY.fxNoise);
  return changePct;
};

/** Inflação 12m: ancoragem às expectativas + juro real + repasse cambial + hiato + ruído. */
const stepInflation = (ctx: MacroContext, fxChangePct: number): number =>
  ctx.m.inflation +
  ECONOMY.inflationAnchorSpeed * (expectedInflation(ctx.m) - ctx.m.inflation) -
  ECONOMY.inflationRealRateEffect * (ctx.realRate - ECONOMY.neutralRealRate) +
  ECONOMY.inflationFxPassThrough * fxChangePct +
  ECONOMY.inflationGapEffect * ctx.gap +
  ctx.noise(ECONOMY.inflationNoise);

/** Crescimento: reverte ao potencial − juro real acima do neutro + confiança + IDE + ruído. */
const stepGrowth = (ctx: MacroContext, state: SimulationState): number =>
  ctx.m.gdpGrowth +
  ECONOMY.growthReversionSpeed * (ctx.m.potentialGrowth - ctx.m.gdpGrowth) -
  ECONOMY.growthRealRateEffect * (ctx.realRate - ECONOMY.neutralRealRate) +
  ECONOMY.growthConfidenceEffect * confidence(state) +
  ECONOMY.growthFdiEffect * (ctx.m.foreignInvestment - ECONOMY.fdiReference) +
  ctx.noise(ECONOMY.growthNoise);

/** Copom autônomo: só age (em passos de 0,25) se a Selic se afastar da regra de Taylor além da tolerância. */
const stepSelic = (m: GameMetrics, gap: number): number => {
  const taylor =
    ECONOMY.taylorNeutralRate +
    m.inflation +
    ECONOMY.taylorInflationWeight * (m.inflation - ECONOMY.inflationTarget) +
    ECONOMY.taylorGapWeight * gap;
  const distance = taylor - m.selic;
  if (Math.abs(distance) <= ECONOMY.copomTolerance) return m.selic;
  return m.selic + Math.sign(distance) * ECONOMY.copomStep;
};

/**
 * Juro efetivo da dívida = fração da Selic + spread + prêmio de risco (dívida acima do limiar)
 * − desconto de credibilidade (superávit primário: o mercado cobra menos para rolar a dívida).
 */
const effectiveDebtRate = (m: GameMetrics): number =>
  ECONOMY.debtRateSelicShare * m.selic +
  ECONOMY.debtRateSpread +
  ECONOMY.debtRiskPremium * Math.max(0, m.debt - ECONOMY.debtRiskThreshold) -
  ECONOMY.fiscalCredibilityDiscount * Math.max(0, m.primaryBalance);

/** Dívida: Δd mensal = [d × (i_ef − g_nominal)/100 − primário] / 12. */
const stepDebt = (m: GameMetrics): number => {
  const effectiveRate = effectiveDebtRate(m);
  const nominalGrowth = m.gdpGrowth + m.inflation;
  return m.debt + ((m.debt * (effectiveRate - nominalGrowth)) / 100 - m.primaryBalance) / MONTHS_PER_YEAR;
};

const stepExternal = (ctx: MacroContext, state: SimulationState, countries?: readonly Country[]): Pick<GameMetrics, 'foreignInvestment' | 'tradeBalance'> => {
  const { m } = ctx;
  const relationGap = weightedRelation(state, countries) - ECONOMY.relationReference;
  // IDE tende a f(relações, confiança do mercado, crescimento).
  const fdiTarget =
    ECONOMY.fdiReference +
    ECONOMY.fdiRelationEffect * relationGap +
    ECONOMY.fdiConfidenceEffect * (state.sectors.market - ECONOMY.confidenceReference) +
    ECONOMY.fdiGrowthEffect * (m.gdpGrowth - REF.gdpGrowth);
  // Balança tende a f(câmbio fraco exporta mais, relações, crescimento puxa importações).
  const tradeTarget =
    ECONOMY.tradeReference +
    ECONOMY.tradeFxEffect * (m.exchangeRate - REF.exchangeRate) +
    ECONOMY.tradeRelationEffect * relationGap -
    ECONOMY.tradeGrowthEffect * (m.gdpGrowth - REF.gdpGrowth);
  return {
    foreignInvestment: m.foreignInvestment + ECONOMY.fdiSpeed * (fdiTarget - m.foreignInvestment) + ctx.noise(ECONOMY.fdiNoise),
    tradeBalance: m.tradeBalance + ECONOMY.tradeSpeed * (tradeTarget - m.tradeBalance) + ctx.noise(ECONOMY.tradeNoise),
  };
};

/**
 * Primário: componente cíclico (hiato) + regra fiscal. Com a regra em vigor, gasto novo exige
 * compensação e o resultado converge à meta (fração anual da distância); rompida a regra,
 * não há convergência e os déficits se acumulam.
 */
const stepPrimaryBalance = (state: SimulationState, gap: number): number => {
  const m = state.metrics;
  const ruleActive = state.flags[FLAG_FISCAL_RULE_BROKEN] === undefined;
  // Só corrige déficits em relação à meta: superávits conquistados não são apagados.
  const shortfall = Math.max(0, ECONOMY.fiscalRuleTarget - m.primaryBalance);
  const convergence = ruleActive ? (ECONOMY.fiscalRuleConvergencePerYear / MONTHS_PER_YEAR) * shortfall : 0;
  return m.primaryBalance + ECONOMY.primaryCyclicality * gap + convergence;
};

/** Dinâmica macroeconômica mensal agregada (GDD §9, item 8: apenas agregado). */
export const stepEconomy = (state: SimulationState, rng: Rng, difficulty: DifficultyConfig, countries?: readonly Country[]): SimulationState => {
  const m = state.metrics;
  const ctx: MacroContext = {
    m,
    realRate: m.selic - m.inflation,
    gap: m.gdpGrowth - m.potentialGrowth,
    noise: (sd) => randomNormal(rng) * sd * difficulty.economicNoiseMultiplier,
  };
  const fxChangePct = stepExchangeRate(ctx, state);
  const gdpGrowth = stepGrowth(ctx, state);
  // Okun: Δu anual ≈ −coef × hiato; leve atração à taxa natural.
  const unemployment =
    m.unemployment -
    (ECONOMY.okunCoefficient * ctx.gap) / MONTHS_PER_YEAR +
    ECONOMY.unemploymentReversion * (ECONOMY.naturalUnemployment - m.unemployment) +
    ctx.noise(ECONOMY.unemploymentNoise);
  const next: GameMetrics = {
    ...m,
    ...stepExternal(ctx, state, countries),
    inflation: stepInflation(ctx, fxChangePct),
    gdpGrowth,
    gdp: m.gdp * (1 + gdpGrowth / 100) ** (1 / MONTHS_PER_YEAR),
    unemployment,
    exchangeRate: m.exchangeRate * (1 + fxChangePct / 100),
    selic: stepSelic(m, ctx.gap),
    debt: stepDebt(m),
    primaryBalance: stepPrimaryBalance(state, ctx.gap),
  };
  return { ...state, metrics: clampMetrics(next) };
};

// ─── Social, segurança e meio ambiente ────────────────────────────────────

/** Nível sazonal dos reservatórios: cheia em março, seca em setembro. */
const seasonalWater = (turn: number): number => {
  const { month } = getTurnDate(turn);
  const phase = (2 * Math.PI * (month - SOCIAL.waterPeakMonth)) / MONTHS_PER_YEAR;
  return SOCIAL.waterMean + SOCIAL.waterSeasonalAmplitude * Math.cos(phase);
};

const stepWelfare = (m: GameMetrics): Pick<GameMetrics, 'poverty' | 'gini' | 'hdi'> => {
  // Pobreza e Gini acumulam lentamente os efeitos do desemprego, inflação e crescimento.
  const povertyDelta =
    (SOCIAL.povertyUnemploymentEffect * (m.unemployment - REF.unemployment) +
      SOCIAL.povertyInflationEffect * (m.inflation - REF.inflation) -
      SOCIAL.povertyGrowthEffect * (m.gdpGrowth - REF.gdpGrowth)) /
    MONTHS_PER_YEAR;
  const giniDelta =
    (SOCIAL.giniUnemploymentEffect * (m.unemployment - REF.unemployment) + SOCIAL.giniInflationEffect * (m.inflation - REF.inflation)) /
    MONTHS_PER_YEAR;
  // IDH derivado de saúde, educação e renda (log do PIB), com inércia.
  const hdiTarget =
    REF.hdi +
    SOCIAL.hdiHealthEffect * (m.healthCoverage - REF.healthCoverage) +
    SOCIAL.hdiEducationEffect * (m.ideb - REF.ideb) +
    SOCIAL.hdiIncomeEffect * Math.log(m.gdp / REF.gdp);
  return { poverty: m.poverty + povertyDelta, gini: m.gini + giniDelta, hdi: m.hdi + SOCIAL.hdiSpeed * (hdiTarget - m.hdi) };
};

const stepSecurity = (m: GameMetrics, noise: (sd: number) => number): Pick<GameMetrics, 'homicideRate' | 'securityTrust'> => {
  // Homicídios: tendência secular de queda, pressionada por desemprego e pobreza.
  const homicideRate =
    m.homicideRate +
    SOCIAL.homicideTrend +
    SOCIAL.homicideUnemploymentEffect * (m.unemployment - REF.unemployment) +
    SOCIAL.homicidePovertyEffect * (m.poverty - REF.poverty) +
    noise(SOCIAL.homicideNoise);
  const trustTarget = REF.securityTrust + SOCIAL.securityTrustHomicideEffect * (REF.homicideRate - m.homicideRate);
  return {
    homicideRate,
    securityTrust: m.securityTrust + SOCIAL.securityTrustSpeed * (trustTarget - m.securityTrust) + noise(SOCIAL.securityTrustNoise),
  };
};

const stepEnvironment = (
  m: GameMetrics,
  turn: number,
  noise: (sd: number) => number,
): Pick<GameMetrics, 'deforestation' | 'co2Emissions' | 'waterReserves'> => {
  // Desmatamento: pressão do crescimento + retorno gradual à pressão de fronteira sem fiscalização contínua.
  const deforestation =
    m.deforestation +
    SOCIAL.deforestationReversion * (REF.deforestation - m.deforestation) +
    SOCIAL.deforestationGrowthPressure * (m.gdpGrowth - REF.gdpGrowth) +
    noise(SOCIAL.deforestationNoise);
  // Emissões acompanham desmatamento (mudança de uso do solo) e atividade econômica.
  const co2Target =
    REF.co2Emissions +
    SOCIAL.co2DeforestationFactor * (deforestation - REF.deforestation) +
    SOCIAL.co2GrowthFactor * (m.gdpGrowth - REF.gdpGrowth);
  return {
    deforestation,
    co2Emissions: m.co2Emissions + SOCIAL.co2Speed * (co2Target - m.co2Emissions),
    waterReserves: m.waterReserves + SOCIAL.waterSpeed * (seasonalWater(turn) - m.waterReserves) + noise(SOCIAL.waterNoise),
  };
};

/** Indicadores sociais, de segurança, infraestrutura e meio ambiente (com inércia e sazonalidade). */
export const stepSocial = (state: SimulationState, rng: Rng): SimulationState => {
  const m = state.metrics;
  const noise = (sd: number): number => randomNormal(rng) * sd;
  const next: GameMetrics = {
    ...m,
    ...stepWelfare(m),
    ...stepSecurity(m, noise),
    ...stepEnvironment(m, state.turn, noise),
    digitalConnectivity: m.digitalConnectivity + SOCIAL.digitalTrend * ((SCORE_MAX - m.digitalConnectivity) / SCORE_MAX) * 10,
    sanitation: m.sanitation + SOCIAL.sanitationTrend,
    housingDeficit: m.housingDeficit + SOCIAL.housingTrend,
  };
  return { ...state, metrics: clampMetrics(next) };
};

// ─── Aprovação por setor (GDD §3.3) ────────────────────────────────────────

const bounded = (value: number): number => clamp(value, -MAX_SIGNAL, MAX_SIGNAL);

/** Sinais normalizados (positivo = favorável ao governo) relativos aos valores iniciais. */
export const computeApprovalSignals = (m: GameMetrics): ApprovalSignals => ({
  inflation: bounded((REF.inflation - m.inflation) / SIGNAL_SCALES.inflation),
  unemployment: bounded((REF.unemployment - m.unemployment) / SIGNAL_SCALES.unemployment),
  growth: bounded((m.gdpGrowth - REF.gdpGrowth) / SIGNAL_SCALES.growth),
  strongCurrency: bounded((REF.exchangeRate - m.exchangeRate) / SIGNAL_SCALES.strongCurrency),
  debt: bounded((REF.debt - m.debt) / SIGNAL_SCALES.debt),
  fiscal: bounded((m.primaryBalance - REF.primaryBalance) / SIGNAL_SCALES.fiscal),
  lowRates: bounded((REF.selic - m.selic) / SIGNAL_SCALES.lowRates),
  security: bounded(
    ((REF.homicideRate - m.homicideRate) / SIGNAL_SCALES.homicide + (m.securityTrust - REF.securityTrust) / SIGNAL_SCALES.securityTrust) / 2,
  ),
  environment: bounded((REF.deforestation - m.deforestation) / SIGNAL_SCALES.environment),
  education: bounded((m.ideb - REF.ideb) / SIGNAL_SCALES.education),
  health: bounded((m.healthCoverage - REF.healthCoverage) / SIGNAL_SCALES.health),
  poverty: bounded((REF.poverty - m.poverty) / SIGNAL_SCALES.poverty),
  infrastructure: bounded(
    (m.infrastructureKm / SIGNAL_SCALES.infrastructureKm + (m.sanitation - REF.sanitation) / SIGNAL_SCALES.sanitation) / 2,
  ),
  prestige: bounded((m.prestige - REF.prestige) / SIGNAL_SCALES.prestige),
});

/** Bônus de lua de mel: some linearmente nos primeiros HONEYMOON_TURNS do mandato. */
const honeymoonBonus = (state: SimulationState): number => {
  const elapsed = state.turn - state.termStartTurn;
  return elapsed >= HONEYMOON_TURNS ? 0 : HONEYMOON_BONUS * (1 - elapsed / HONEYMOON_TURNS);
};

/**
 * Militância: governos ideologicamente intensos ganham uma base fiel nos setores próximos.
 * bônus = peso × intensidade do governo (0–1, só fora da zona moderada) × afinidade com o setor (0–1).
 */
export const militancyBonus = (m: GameMetrics, sector: SectorKey): number => {
  const position = SECTOR_IDEOLOGY[sector];
  const radius = Math.hypot(m.ideologyEconomic, m.ideologySocial);
  const intensity = clamp((radius - IDEOLOGY.intensityDeadZone) / (IDEOLOGY.fullIntensity - IDEOLOGY.intensityDeadZone), 0, 1);
  const distance = Math.hypot(m.ideologyEconomic - position.economic, m.ideologySocial - position.social);
  const affinity = Math.max(0, 1 - distance / IDEOLOGY.affinityRange);
  return IDEOLOGY.militancyWeight * intensity * affinity;
};

/**
 * Aprovação de equilíbrio de cada setor = base + Σ sensibilidade × sinal
 * + afinidade ideológica/memória política + bônus de confiança econômica (mercado/empresários).
 */
export const computeSectorEquilibrium = (state: SimulationState): SectorApproval => {
  const signals = computeApprovalSignals(state.metrics);
  return Object.fromEntries(
    SECTOR_KEYS.map((key) => {
      const sensitivities = SECTOR_SENSITIVITIES[key];
      const fromMetrics = (Object.keys(sensitivities) as Array<keyof ApprovalSignals>).reduce(
        (acc, signal) => acc + (sensitivities[signal] ?? 0) * signals[signal],
        0,
      );
      const confidenceBonus = key === 'market' || key === 'business' ? state.modifiers.economicConfidenceBonus : 0;
      const militancy = militancyBonus(state.metrics, key);
      const value = INITIAL_SECTOR_APPROVAL[key] + fromMetrics + (state.sectorAffinity[key] ?? 0) + confidenceBonus + militancy;
      return [key, clamp(value, 0, SCORE_MAX)];
    }),
  ) as SectorApproval;
};

/**
 * Setores se movem uma fração rumo ao equilíbrio, que inclui lua de mel e o
 * desgaste acumulado do mandato (decay × multiplicador × meses de governo).
 */
export const stepSectors = (state: SimulationState, difficulty: DifficultyConfig): SimulationState => {
  const equilibrium = computeSectorEquilibrium(state);
  const monthsInTerm = state.turn - state.termStartTurn;
  const wear = difficulty.approvalDecayPerTurn * state.modifiers.approvalDecayMultiplier * monthsInTerm;
  const shift = honeymoonBonus(state) - wear;
  const sectors = Object.fromEntries(
    SECTOR_KEYS.map((key) => {
      const target = clamp(equilibrium[key] + shift, 0, SCORE_MAX);
      return [key, clamp(state.sectors[key] + SECTOR_ADJUSTMENT_SPEED * (target - state.sectors[key]), 0, SCORE_MAX)];
    }),
  ) as SectorApproval;
  return { ...state, sectors, approval: calculateApproval(sectors) };
};
