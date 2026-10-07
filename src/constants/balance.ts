/**
 * Constantes de balanceamento centralizadas (CLAUDE.md › Engine).
 * Nenhum número de calibração deve ficar hardcoded no engine.
 */
import type {
  ApprovalSignal,
  Difficulty,
  DifficultyConfig,
  EndingType,
  EventFrequency,
  ModifierSet,
  SectorKey,
} from '@/types';

// ─── Dificuldade (GDD §9, item 4) ─────────────────────────────────────────

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Fácil',
    description: 'Crises mais brandas e maior margem de erro. Bom para aprender.',
    crisisWeightMultiplier: 0.7,
    negativeImpactMultiplier: 0.85,
    positiveImpactMultiplier: 1.1,
    economicNoiseMultiplier: 0.5,
    approvalDecayPerTurn: 0.1,
    impeachmentApprovalThreshold: 12,
    impeachmentSupportThreshold: 25,
    reelectionThreshold: 45,
    scoreMultiplier: 0.85,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    description: 'A experiência pensada para o jogo: equilíbrio difícil, como na vida real.',
    crisisWeightMultiplier: 1,
    negativeImpactMultiplier: 1,
    positiveImpactMultiplier: 1,
    economicNoiseMultiplier: 1,
    approvalDecayPerTurn: 0.2,
    impeachmentApprovalThreshold: 15,
    impeachmentSupportThreshold: 30,
    reelectionThreshold: 50,
    scoreMultiplier: 1,
  },
  hard: {
    id: 'hard',
    label: 'Difícil',
    description: 'Crises frequentes e agressivas, mercado impaciente e Congresso hostil.',
    crisisWeightMultiplier: 1.4,
    negativeImpactMultiplier: 1.25,
    positiveImpactMultiplier: 0.9,
    economicNoiseMultiplier: 1.5,
    approvalDecayPerTurn: 0.3,
    impeachmentApprovalThreshold: 18,
    impeachmentSupportThreshold: 33,
    reelectionThreshold: 52,
    scoreMultiplier: 1.25,
  },
};

export const DIFFICULTY_ORDER: readonly Difficulty[] = ['easy', 'normal', 'hard'];

// ─── Modificadores do jogador ─────────────────────────────────────────────

/** Valores neutros; habilidades e backgrounds sobrescrevem parcialmente. */
export const DEFAULT_MODIFIERS: ModifierSet = {
  voteChanceBonus: 0,
  negotiationCostMultiplier: 1,
  approvalDecayMultiplier: 1,
  scandalWeightMultiplier: 1,
  diplomacyMultiplier: 1,
  economicConfidenceBonus: 0,
  crisisImpactMultiplier: 1,
};

// ─── Congresso (GDD §4.2) ─────────────────────────────────────────────────

/** Base aliada de referência para aprovar lei ordinária. */
export const ORDINARY_LAW_THRESHOLD = 50;
/** Base aliada de referência para aprovar PEC. */
export const PEC_THRESHOLD = 60;
/** Pontos de base aliada "emprestados" por uma negociação de cargos/emendas. */
export const NEGOTIATION_SUPPORT_BONUS = 10;
export const MIN_VOTE_CHANCE = 0.05;
export const MAX_VOTE_CHANCE = 0.95;
/** Base aliada abaixo da qual pode ser aberta uma CPI. */
export const CPI_SUPPORT_THRESHOLD = 40;
/** Aprovação acima da qual o governo é considerado estável (diagrama GDD §4.2). */
export const STABLE_APPROVAL_THRESHOLD = 30;

// ─── Eventos (GDD §4.4 e §9, item 9) ──────────────────────────────────────

/** Fração de turnos com sorteio puramente aleatório (o resto é condicional). */
export const RANDOM_EVENT_SHARE = 0.4;

export const EVENT_FREQUENCY_WEIGHTS: Record<EventFrequency, number> = {
  rare: 1,
  moderate: 2.5,
  frequent: 4,
};

/**
 * Propostas reservadas (corrupção): canal próprio, fora do sorteio geral de eventos.
 * Chance mensal de uma proposta chegar (no lugar do evento) a partir do turno mínimo.
 */
export const CORRUPTION_OFFER_CHANCE = 0.3;
export const CORRUPTION_OFFER_MIN_TURN = 2;

/** Turnos de espera padrão antes de um evento repetível voltar. */
export const DEFAULT_EVENT_COOLDOWN = 12;

/** Turnos de espera padrão antes de uma decisão repetível voltar. */
export const DEFAULT_DECISION_COOLDOWN = 8;

/**
 * Decisões não-repetíveis voltam à pauta após este intervalo se nenhuma das
 * flags das suas opções estiver ativa (ex.: reforma rejeitada ou adiada).
 */
export const DECISION_RECYCLE_TURNS = 20;

/**
 * Novidade: peso de sorteio de conteúdo já visto na partida (decisões
 * não-repetíveis recicladas e eventos já ocorridos), para priorizar o inédito.
 */
export const SEEN_DECISION_WEIGHT = 0.3;
export const SEEN_EVENT_WEIGHT = 0.4;

/** Fatos do mês: probabilidade de sair exatamente 1 ou 2 notícias avulsas (o resto: nenhuma). */
export const BLIPS = {
  oneChance: 0.5,
  twoChance: 0.2,
} as const;

/** Turnos de espera padrão antes de um fato do mês se repetir. */
export const DEFAULT_BLIP_COOLDOWN = 12;

/**
 * Impactos pontuais na dívida (gastos one-off de decisões/eventos) são multiplicados por este
 * fator: parte do gasto é compensada dentro do orçamento pela regra fiscal.
 */
export const DEBT_IMPACT_SCALE = 0.5;

/** Queda máxima de aprovação no turno para uma crise contar como "bem conduzida". */
export const CRISIS_HANDLED_MAX_APPROVAL_DROP = 3;

/** Máximo de manchetes geradas por variação de indicadores em um turno. */
export const MAX_INDICATOR_NEWS = 3;

/** Lembrete de promessa vencida a cada N turnos. */
export const PROMISE_REMINDER_INTERVAL = 6;

// ─── Engine: macroeconomia mensal (GDD §3 e §6.2) ─────────────────────────

/** Coeficientes do motor macroeconômico (unidades indicadas em cada linha). */
export const ECONOMY = {
  /** Juro real neutro, em % a.a. */
  neutralRealRate: 5,
  /** Meta de inflação do CMN, em %. */
  inflationTarget: 3,
  /** Fração mensal da distância às expectativas que a inflação percorre. */
  inflationAnchorSpeed: 0.04,
  /** p.p. de inflação por p.p. de juro real acima do neutro, por mês. */
  inflationRealRateEffect: 0.03,
  /** p.p. de inflação por 1% de desvalorização cambial no mês (repasse). */
  inflationFxPassThrough: 0.08,
  /** p.p. de inflação por p.p. de hiato do produto, por mês. */
  inflationGapEffect: 0.02,
  /** Desancoragem das expectativas por p.p. de dívida acima de `debtRiskThreshold`. */
  expectationsDebtPenalty: 0.03,
  /** Desancoragem das expectativas por p.p. de déficit primário além de `deficitRiskThreshold`. */
  expectationsDeficitPenalty: 0.5,
  inflationNoise: 0.06,

  /** Regra de Taylor do Copom: neutro real + inflação + peso × desvio da meta + peso × hiato. */
  taylorNeutralRate: 5,
  taylorInflationWeight: 1.5,
  taylorGapWeight: 0.5,
  /** O Copom só reage sozinho quando a Selic se afasta da regra por mais que isso. */
  copomTolerance: 0.75,
  /** Passo de cada movimento autônomo do Copom, em p.p. */
  copomStep: 0.5,

  /** Fração mensal da distância ao potencial que o crescimento percorre. */
  growthReversionSpeed: 0.08,
  /** p.p. de crescimento perdidos por p.p. de juro real acima do neutro, por mês. */
  growthRealRateEffect: 0.025,
  /** p.p. de crescimento por ponto de confiança (média mercado/empresários − 45), por mês. */
  growthConfidenceEffect: 0.003,
  /** p.p. de crescimento por US$ bi de IDE acima da referência, por mês. */
  growthFdiEffect: 0.001,
  growthNoise: 0.12,

  /** Coeficiente de Okun: Δ desemprego anual por p.p. de hiato. */
  okunCoefficient: 0.4,
  /** Taxa de desemprego "natural" para onde o mercado de trabalho é atraído. */
  naturalUnemployment: 8,
  unemploymentReversion: 0.005,
  unemploymentNoise: 0.03,

  /** % de apreciação mensal por p.p. de juro real acima do neutro. */
  fxRealRateEffect: 0.06,
  /** % de depreciação mensal por p.p. de dívida acima do limiar de risco. */
  fxDebtRisk: 0.015,
  /** % de depreciação mensal por p.p. de déficit além do limiar de risco. */
  fxDeficitRisk: 0.3,
  /** % de apreciação mensal por ponto de aprovação do mercado acima de 45. */
  fxConfidenceEffect: 0.008,
  /** Fração mensal do desalinhamento ao câmbio de equilíbrio corrigida. */
  fxReversion: 0.05,
  /** Câmbio de equilíbrio inicial (R$/US$) e sua deriva anual (diferencial de inflação). */
  fxFairValue: 5.4,
  fxFairDriftPerYear: 0.02,
  /** Desvio-padrão do ruído cambial mensal, em %. */
  fxNoise: 1,

  /** Juro efetivo da dívida = fração × Selic + spread (custo médio: parte prefixada/indexada à inflação). */
  debtRateSelicShare: 0.6,
  debtRateSpread: 0.8,
  /** p.p. de juro efetivo por p.p. de dívida acima de `debtRiskThreshold` (prêmio de risco). */
  debtRiskPremium: 0.04,
  /** p.p. de juro efetivo a menos por p.p. de superávit primário (credibilidade fiscal). */
  fiscalCredibilityDiscount: 0.4,
  /** Dívida (% PIB) a partir da qual há prêmio de risco. */
  debtRiskThreshold: 80,
  /** Déficit primário (% PIB) a partir do qual há prêmio de risco. */
  deficitRiskThreshold: 0.5,
  /** Sensibilidade cíclica do primário: p.p. por p.p. de hiato, por mês. */
  primaryCyclicality: 0.01,
  /** Regra fiscal: meta de primário (% do PIB) e fração anual da distância corrigida enquanto vigora. */
  fiscalRuleTarget: 0.5,
  fiscalRuleConvergencePerYear: 0.35,

  /** IDE de referência (US$ bi) e sensibilidades do alvo. */
  fdiReference: 71,
  fdiRelationEffect: 1.2,
  fdiConfidenceEffect: 0.4,
  fdiGrowthEffect: 3,
  fdiSpeed: 0.1,
  fdiNoise: 1,

  /** Balança comercial de referência (US$ bi) e sensibilidades do alvo. */
  tradeReference: 74.6,
  tradeFxEffect: 6,
  tradeRelationEffect: 0.8,
  tradeGrowthEffect: 2,
  tradeSpeed: 0.08,
  tradeNoise: 1,
  /** Relação média ponderada de referência (relações iniciais do GDD §4.3). */
  relationReference: 64,
  /** Confiança neutra (aprovação de mercado/empresários). */
  confidenceReference: 45,
} as const;

// ─── Engine: dinâmica social, ambiental e de segurança ────────────────────

export const SOCIAL = {
  /** Δ pobreza anual por p.p. de desemprego acima da referência. */
  povertyUnemploymentEffect: 0.25,
  povertyInflationEffect: 0.08,
  povertyGrowthEffect: 0.1,
  /** Δ Gini anual por p.p. de desemprego/inflação acima da referência. */
  giniUnemploymentEffect: 0.002,
  giniInflationEffect: 0.0005,
  /** IDH-alvo: sensibilidades a cobertura de saúde, IDEB e log do PIB. */
  hdiHealthEffect: 0.0015,
  hdiEducationEffect: 0.02,
  hdiIncomeEffect: 0.06,
  hdiSpeed: 0.1,
  /** Tendência secular de homicídios (por 100 mil, por mês). */
  homicideTrend: -0.015,
  homicideUnemploymentEffect: 0.03,
  homicidePovertyEffect: 0.01,
  homicideNoise: 0.05,
  /** Confiança-alvo nas forças de segurança: pontos por homicídio/100 mil abaixo da referência. */
  securityTrustHomicideEffect: 2,
  securityTrustSpeed: 0.05,
  securityTrustNoise: 0.4,
  /** Pressão do crescimento sobre o desmatamento (km²/ano por p.p. acima de 2%, por mês). */
  deforestationGrowthPressure: 5,
  deforestationNoise: 30,
  /** Fração mensal da distância à pressão de fronteira (desmatamento inicial) recuperada sem fiscalização contínua. */
  deforestationReversion: 0.01,
  /** Mt CO₂e por km² de desmatamento anual e por p.p. de crescimento. */
  co2DeforestationFactor: 0.12,
  co2GrowthFactor: 15,
  co2Speed: 0.05,
  /** Reservatórios: média, amplitude sazonal (cheia em março, seca em setembro), velocidade. */
  waterMean: 65,
  waterSeasonalAmplitude: 15,
  waterPeakMonth: 3,
  waterSpeed: 0.15,
  waterNoise: 1.5,
  /** Tendências mensais estruturais. */
  digitalTrend: 0.03,
  sanitationTrend: 0.02,
  housingTrend: 0.004,
} as const;

// ─── Engine: aprovação por setor (GDD §3.3) ───────────────────────────────

/**
 * Escalas de normalização dos sinais de aprovação: cada sinal é o desvio em
 * relação ao valor inicial dividido pela escala (±1 = desvio relevante).
 */
export const SIGNAL_SCALES = {
  inflation: 2,
  unemployment: 2.5,
  growth: 2,
  strongCurrency: 1,
  debt: 10,
  fiscal: 1,
  lowRates: 3,
  homicide: 5,
  securityTrust: 20,
  environment: 3000,
  education: 0.4,
  health: 8,
  poverty: 4,
  infrastructureKm: 4000,
  sanitation: 8,
  prestige: 15,
} as const;

/** Limite absoluto de cada sinal normalizado (evita explosões em cenários extremos). */
export const MAX_SIGNAL = 3;

/** Pontos de aprovação de equilíbrio por unidade de sinal, por setor (GDD §3.3). */
export const SECTOR_SENSITIVITIES: Record<SectorKey, Partial<Record<ApprovalSignal, number>>> = {
  lowerClass: { inflation: 9, unemployment: 8, poverty: 5, health: 3, growth: 2 },
  middleClass: { inflation: 6, security: 5, education: 3, health: 3, growth: 3, unemployment: 2, debt: 2 },
  business: { growth: 6, lowRates: 5, infrastructure: 3, strongCurrency: 2, fiscal: 2, debt: 2 },
  market: { fiscal: 7, debt: 6, inflation: 4, strongCurrency: 3, growth: 2 },
  agribusiness: { strongCurrency: -2.5, infrastructure: 5, environment: -1.5, growth: 2, lowRates: 2 },
  military: { security: 7, prestige: 3, growth: 1 },
  environmentalists: { environment: 8, education: 4, prestige: 2, health: 1 },
};

/** Espectro político: militância (base fiel) e ferramentas para driblar o Congresso. */
export const IDEOLOGY = {
  /** Pontos de aprovação de equilíbrio para um setor colado à posição de um governo intenso. */
  militancyWeight: 12,
  /** Distância ao centro (0,0) abaixo da qual não há militância (governos moderados). */
  intensityDeadZone: 50,
  /** Distância ao centro a partir da qual o governo é 100% intenso. */
  fullIntensity: 100,
  /** Distância no espectro a partir da qual o setor não sente afinidade nenhuma. */
  affinityRange: 110,
  /** Bônus na chance de aprovação das leis do mês em que o governo editou medida provisória. */
  provisionalMeasureVoteBonus: 0.15,
  /** Chance mínima de aprovar lei ordinária no mês da medida provisória (força de lei imediata). */
  provisionalMeasureFloor: 0.6,
  /** Bônus na chance de aprovação com a militância nas ruas (no mês). */
  streetPressureVoteBonus: 0.15,
} as const;

/** Posição ideológica típica de cada setor (econômica: -100 esquerda…100 direita; costumes: -100 progressista…100 conservador). */
export const SECTOR_IDEOLOGY: Record<SectorKey, { economic: number; social: number }> = {
  lowerClass: { economic: -45, social: 25 },
  middleClass: { economic: 15, social: 20 },
  business: { economic: 55, social: 10 },
  market: { economic: 75, social: 0 },
  agribusiness: { economic: 50, social: 55 },
  military: { economic: 20, social: 70 },
  environmentalists: { economic: -50, social: -60 },
};

/** Fração mensal da distância ao equilíbrio que cada setor percorre. */
export const SECTOR_ADJUSTMENT_SPEED = 0.2;
/** Lua de mel: bônus inicial de equilíbrio que some linearmente em N turnos de mandato. */
export const HONEYMOON_TURNS = 6;
export const HONEYMOON_BONUS = 6;
/**
 * Memória política: fração dos deltas setoriais de decisões/eventos que vira
 * afinidade persistente (o resto se dissipa rumo ao equilíbrio).
 */
export const POLICY_MEMORY_SHARE = 0.05;
/**
 * Retornos decrescentes: ganhos de aprovação de um setor encolhem conforme ele
 * já está alto — fator = 1 − (aprovação − início) / faixa, com piso mínimo.
 * Popularidade sustentada precisa vir dos indicadores (equilíbrio), não de agrados.
 */
export const APPROVAL_SATURATION = {
  start: 45,
  span: 40,
  minFactor: 0.1,
} as const;
export const MAX_SECTOR_AFFINITY = 30;

// ─── Engine: Congresso ────────────────────────────────────────────────────

export const CONGRESS = {
  /** Escala da logística de votação (pontos de base por unidade de log-odds). */
  voteLogisticScale: 6,
  /** Log-odds por ponto de aprovação acima da referência. */
  voteApprovalWeight: 0.03,
  voteApprovalReference: 45,
  /** Base aliada de equilíbrio = intercepto + peso × aprovação. */
  supportIntercept: 30,
  supportApprovalWeight: 0.6,
  supportSpeed: 0.08,
  /** Custo base de uma negociação de cargos/emendas. */
  negotiationDebt: 0.15,
  negotiationApproval: -0.5,
  negotiationMiddleClass: -1,
  /** Chance mensal de CPI: base, piso abaixo do limiar, acréscimo por ponto abaixo, bônus por escândalo recente. */
  cpiBaseChance: 0.005,
  cpiLowSupportChance: 0.04,
  cpiChancePerPoint: 0.01,
  cpiScandalBonus: 0.1,
  cpiScandalWindow: 3,
  cpiMinDuration: 3,
  cpiMaxDuration: 5,
  /** Desgaste mensal enquanto a CPI dura. */
  cpiApprovalDrain: -0.6,
  cpiSupportDrain: -0.5,
  /** Prazo do processo de impeachment (turnos) e margem para arquivamento antecipado. */
  impeachmentDuration: 3,
  impeachmentRecoveryMargin: 5,
  /**
   * Com crime de responsabilidade comprovado (flag `crime-de-responsabilidade`),
   * o impeachment fica mais fácil: limiares de aprovação e base sobem estes pontos.
   */
  crimeApprovalBonus: 15,
  crimeSupportBonus: 15,
} as const;

// ─── Engine: diplomacia ───────────────────────────────────────────────────

export const DIPLOMACY = {
  /** Fração mensal da distância à relação inicial que cada relação percorre. */
  relationDriftSpeed: 0.02,
  /** Prestígio-alvo: pontos por ponto de relação média acima da inicial. */
  prestigeRelationEffect: 0.8,
  /** Pontos de prestígio perdidos por km²/ano de desmatamento acima do inicial. */
  prestigeDeforestationEffect: 1 / 800,
  prestigeReference: 60,
  prestigeSpeed: 0.05,
} as const;

// ─── Engine: eleição, reeleição e score (GDD §2.4 e §4.5) ─────────────────

export const ELECTION = {
  baseVoteShare: 52,
  minVoteShare: 50.3,
  maxVoteShare: 62,
  /** Bônus máximo (±) de coerência ideológica por resposta de campanha. */
  coherenceBonus: 1,
  noise: 1.5,
  firstRoundGapMin: 8,
  firstRoundGapMax: 14,
  /** Base aliada inicial = referência + peso × (margem − margem de referência) + bancada. */
  supportMarginWeight: 0.5,
  referenceMargin: 10,
  minInitialSupport: 30,
  maxInitialSupport: 75,
  highCapitalMargin: 14,
  mediumCapitalMargin: 6,
  /** Reeleição: votos = 50 + peso × (aprovação − limiar). */
  reelectionVoteWeight: 0.7,
  reelectionMinShare: 30,
  reelectionMaxShare: 72,
  /** Distância mínima abaixo de 50% para o candidato derrotado. */
  reelectionLoserGap: 0.5,
  secondTermApprovalBonus: 3,
  secondTermSupportBonus: 5,
} as const;

/** Afinidade setorial por 1 ponto de ideologia (eixo econômico e social). */
export const IDEOLOGY_AFFINITY: Record<'economic' | 'social', Partial<Record<SectorKey, number>>> = {
  economic: { market: 0.15, business: 0.12, agribusiness: 0.08, middleClass: 0.03, lowerClass: -0.12, environmentalists: -0.06 },
  social: { military: 0.12, agribusiness: 0.06, middleClass: 0.04, lowerClass: 0.02, environmentalists: -0.12 },
};

export const SCORE = {
  goalsMax: 400,
  approvalMax: 250,
  economyMax: 200,
  eventsMax: 150,
  /** Fração do peso de uma meta não cumprida concedida pelo progresso parcial. */
  partialGoalShare: 0.6,
  /** Aprovação mapeada linearmente de `approvalFloor` (0 pts) a `approvalCeiling` (máx.). */
  approvalFloor: 20,
  approvalCeiling: 75,
  /** Economia (4 quesitos iguais): faixas de 0 pts (floor) a pontuação máxima (ceiling). */
  growthFloor: -1,
  growthCeiling: 3,
  inflationTolerance: 5,
  unemploymentFloor: 12,
  unemploymentCeiling: 5,
  debtFloor: 100,
  debtCeiling: 65,
  /** Eventos: peso das crises bem conduzidas, valor sem crises, bônus por CPI/impeachment superados. */
  crisesWeight: 90,
  noCrisisScore: 45,
  cpiSurvivedBonus: 20,
  impeachmentSurvivedBonus: 40,
} as const;

export const ENDING_MULTIPLIERS: Record<EndingType, number> = {
  impeached: 0.5,
  defeated: 0.9,
  retired: 1,
  'completed-two-terms': 1.15,
};
