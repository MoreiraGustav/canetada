/**
 * Contas públicas: política fiscal escolhida pelo presidente (ou a regra fiscal),
 * conversão de % do PIB em reais, composição da dívida e projeções determinísticas.
 * Coeficientes em `constants/balance.ts` (ECONOMY, FISCAL).
 */
import { DEBT_IMPACT_SCALE, ECONOMY, FISCAL } from '@/constants/balance';
import { MONTHS_PER_YEAR } from '@/constants/game';
import { METRIC_BOUNDS } from '@/constants/metrics';
import type {
  DebtDrivers,
  DebtProjectionPoint,
  FiscalCost,
  FiscalStance,
  GameMetrics,
  Impact,
  PublicAccounts,
  SimulationState,
  StateWithNews,
} from '@/types';
import { clamp } from '@/utils/math';
import { applyImpact, clearFlag, setFlags } from './impacts';
import { createNewsItem } from './news';
import { effectiveDebtRate, expectedInflation, stepDebt, stepSelic } from './simulation';

/** Flag canônica (dados): o governo rompeu a regra fiscal. */
export const FLAG_FISCAL_RULE_BROKEN = 'arcabouco-fiscal-rompido';
/** Chave do histórico com o turno da última mudança de política fiscal. */
const STANCE_HISTORY_KEY = 'politica-fiscal:ultima';
const BILLIONS_PER_TRILLION = 1000;
const PERCENT = 100;

/** % do PIB → R$ bilhões (PIB real em R$ tri, preços de 2026): 0,1% de R$ 11 tri ≈ R$ 11 bi. */
export const gdpShareToBillions = (share: number, gdpTrillions: number): number => (share / PERCENT) * gdpTrillions * BILLIONS_PER_TRILLION;

/** Política fiscal em vigor: a que tem a flag ativa; sem nenhuma, a neutra (regra fiscal) — ou undefined se não houver dados. */
export const getFiscalStance = (state: SimulationState, stances: readonly FiscalStance[]): FiscalStance | undefined =>
  stances.find((stance) => stance.flag !== null && state.flags[stance.flag] !== undefined) ??
  stances.find((stance) => stance.primaryTarget === null);

/** Meses até poder mudar a política fiscal de novo (0 = livre). */
export const getStanceCooldownLeft = (state: SimulationState): number => {
  const last = state.decisionHistory[STANCE_HISTORY_KEY];
  return last === undefined ? 0 : Math.max(0, FISCAL.stanceCooldown - (state.turn - last));
};

/** Adota a política fiscal: troca a flag da anterior pela nova e registra o mês da mudança. */
export const applyFiscalStance = (state: SimulationState, stance: FiscalStance, stances: readonly FiscalStance[]): StateWithNews => {
  const cleared = stances.reduce((acc, entry) => (entry.flag ? clearFlag(acc, entry.flag) : acc), state);
  const flagged = setFlags(cleared, stance.flag ? [stance.flag] : []);
  const next: SimulationState = { ...flagged, decisionHistory: { ...flagged.decisionHistory, [STANCE_HISTORY_KEY]: state.turn } };
  return { state: next, news: [createNewsItem(state.turn, stance.headline, 'neutral', 'economy', `fiscal:${stance.id}`)] };
};

// ─── Dinâmica mensal do primário ──────────────────────────────────────────

/**
 * Regra fiscal (padrão): com ela em vigor, gasto novo exige compensação e déficits
 * convergem à meta (fração anual da distância). Superávits conquistados não são apagados.
 * Rompida a regra (flag), não há convergência e os déficits se acumulam.
 */
const rulePull = (metrics: GameMetrics, flags: Record<string, number>): number => {
  if (flags[FLAG_FISCAL_RULE_BROKEN] !== undefined) return 0;
  const shortfall = Math.max(0, ECONOMY.fiscalRuleTarget - metrics.primaryBalance);
  return (ECONOMY.fiscalRuleConvergencePerYear / MONTHS_PER_YEAR) * shortfall;
};

/** Movimento mensal do primário: postura com meta própria (nos dois sentidos) ou a regra fiscal. */
const primaryPull = (metrics: GameMetrics, flags: Record<string, number>, stance: FiscalStance | undefined): number =>
  stance && stance.primaryTarget !== null
    ? (stance.convergencePerYear / MONTHS_PER_YEAR) * (stance.primaryTarget - metrics.primaryBalance)
    : rulePull(metrics, flags);

/**
 * Aplica a política fiscal no primário. Só o aperto (ou afrouxamento) além do que a
 * regra faria pesa no crescimento: crescimento −= multiplicador × Δprimário extra.
 */
const pullMetrics = (metrics: GameMetrics, flags: Record<string, number>, stance: FiscalStance | undefined): GameMetrics => {
  const pull = primaryPull(metrics, flags, stance);
  const extra = pull - rulePull(metrics, flags);
  const { primaryBalance, gdpGrowth } = METRIC_BOUNDS;
  return {
    ...metrics,
    primaryBalance: clamp(metrics.primaryBalance + pull, primaryBalance.min, primaryBalance.max),
    gdpGrowth: clamp(metrics.gdpGrowth - FISCAL.multiplier * extra, gdpGrowth.min, gdpGrowth.max),
  };
};

/** Etapa mensal da política fiscal: primário, efeito no crescimento e o custo contínuo (setores, ideologia). */
export const stepFiscalPolicy = (state: SimulationState, stances: readonly FiscalStance[]): SimulationState => {
  const stance = getFiscalStance(state, stances);
  const pulled: SimulationState = { ...state, metrics: pullMetrics(state.metrics, state.flags, stance) };
  return stance && Object.keys(stance.monthly).length > 0 ? applyImpact(pulled, stance.monthly) : pulled;
};

// ─── Contas públicas em reais ─────────────────────────────────────────────

/** Variação anual da dívida (p.p. do PIB) no ritmo atual: juros − crescimento nominal − primário. */
export const computeDebtDrivers = (m: GameMetrics): DebtDrivers => {
  const interest = (m.debt * effectiveDebtRate(m)) / PERCENT;
  const growth = -(m.debt * (m.gdpGrowth + m.inflation)) / PERCENT;
  const primary = -m.primaryBalance;
  return { interest, growth, primary, total: interest + growth + primary };
};

export const getPublicAccounts = (m: GameMetrics): PublicAccounts => {
  const effectiveRate = effectiveDebtRate(m);
  const interestBillions = gdpShareToBillions((m.debt * effectiveRate) / PERCENT, m.gdp);
  const primaryBillions = gdpShareToBillions(m.primaryBalance, m.gdp);
  return {
    debtTrillions: (m.debt / PERCENT) * m.gdp,
    primaryBillions,
    interestBillions,
    effectiveRate,
    nominalBillions: primaryBillions - interestBillions,
    drivers: computeDebtDrivers(m),
  };
};

// ─── Projeções (sem choques, sem ruído) ───────────────────────────────────

/** Um mês da economia "de livro": inflação ancorando, Copom pela regra, crescimento voltando ao potencial. */
const projectMonth = (m: GameMetrics, flags: Record<string, number>, stance: FiscalStance | undefined): GameMetrics => {
  const gap = m.gdpGrowth - m.potentialGrowth;
  const realRate = m.selic - m.inflation;
  const next: GameMetrics = {
    ...m,
    inflation:
      m.inflation +
      ECONOMY.inflationAnchorSpeed * (expectedInflation(m) - m.inflation) -
      ECONOMY.inflationRealRateEffect * (realRate - ECONOMY.neutralRealRate) +
      ECONOMY.inflationGapEffect * gap,
    gdpGrowth:
      m.gdpGrowth +
      ECONOMY.growthReversionSpeed * (m.potentialGrowth - m.gdpGrowth) -
      ECONOMY.growthRealRateEffect * (realRate - ECONOMY.neutralRealRate),
    selic: stepSelic(m, gap),
    debt: clamp(stepDebt(m), METRIC_BOUNDS.debt.min, METRIC_BOUNDS.debt.max),
    primaryBalance: m.primaryBalance + ECONOMY.primaryCyclicality * gap,
  };
  return pullMetrics(next, flags, stance);
};

/** Trajetória da dívida mês a mês sob uma política fiscal (projeção simplificada, sem choques). */
export const projectDebt = (
  state: SimulationState,
  stance: FiscalStance | undefined,
  months: number = FISCAL.projectionMonths,
): DebtProjectionPoint[] => {
  const points: DebtProjectionPoint[] = [{ monthsAhead: 0, debt: state.metrics.debt, primaryBalance: state.metrics.primaryBalance }];
  let metrics = state.metrics;
  for (let month = 1; month <= months; month += 1) {
    metrics = projectMonth(metrics, state.flags, stance);
    points.push({ monthsAhead: month, debt: metrics.debt, primaryBalance: metrics.primaryBalance });
  }
  return points;
};

const projectedDebtAt = (state: SimulationState, stance: FiscalStance | undefined, months: number): number =>
  projectDebt(state, stance, months)[months].debt;

/**
 * Estimador do custo fiscal de escolhas em reais: primário (R$/ano), gasto pontual (R$)
 * e a diferença que cada uma faz na dívida projetada em 4 anos, já com a política
 * fiscal em vigor. A trajetória-base é calculada uma vez. `impact` soma imediato + graduais.
 */
export const createFiscalCostEstimator = (state: SimulationState, stance: FiscalStance | undefined): ((impact: Impact) => FiscalCost) => {
  const months = FISCAL.projectionMonths;
  const baseline = projectedDebtAt(state, stance, months);
  const { gdp } = state.metrics;
  return (impact) => ({
    annual: gdpShareToBillions(impact.primaryBalance ?? 0, gdp),
    oneOff: gdpShareToBillions((impact.debt ?? 0) * DEBT_IMPACT_SCALE, gdp),
    debtIn4Years: projectedDebtAt(applyImpact(state, impact), stance, months) - baseline,
  });
};
