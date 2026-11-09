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

/**
 * Trégua entre crises (anti-bola de neve): nos meses seguintes a uma crise, o
 * peso de outras crises no sorteio cai, para o governo ter tempo de reagir.
 */
export const CRISIS_RESPITE = {
  turns: 2,
  weightMultiplier: 0.35,
} as const;

/**
 * Teto do produto dos gatilhos de um evento no sorteio condicional: indicadores
 * ruins tornam crises mais prováveis, mas sem empilhar multiplicadores até
 * que só reste crise no sorteio.
 */
export const MAX_TRIGGER_MULTIPLIER = 4;

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

/**
 * Pauta guiada pelo jogador: decisões com alguma opção que ajuda uma meta do
 * mandato ou promessa pendente pesam mais no sorteio, e a primeira decisão do
 * mês sai desse grupo sempre que houver uma elegível.
 */
export const ALIGNED_DECISION_WEIGHT = 2.5;

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

// ─── Engine: política fiscal e contas públicas ────────────────────────────

export const FISCAL = {
  /**
   * Multiplicador fiscal: p.p. de crescimento (choque mensal) por p.p. do PIB de
   * aperto no primário além do que a regra fiscal já faria. Sustentado, um ajuste
   * de 0,4 p.p./ano tira ≈ 0,3 p.p. do crescimento; a expansão dá o inverso.
   */
  multiplier: 0.8,
  /** Meses entre mudanças de política fiscal (o orçamento não muda todo mês). */
  stanceCooldown: 6,
  /** Horizonte das projeções de dívida (meses). */
  projectionMonths: 48,
} as const;

// ─── Engine: ministros, oposição e governadores ───────────────────────────

export const CABINET = {
  /** Ganhos das decisões e programas da pasta com ministro técnico (fração extra). */
  technicalBonus: 0.15,
  /** Pontos de base aliada de equilíbrio por ministro político (partido aliado no governo). */
  politicalSupport: 1.25,
  /**
   * Composição padrão do gabinete (ministros políticos): a base aliada e o risco de
   * escândalo são calibrados para ela; cada político a mais/menos desloca os dois.
   */
  baselinePolitical: 4,
  /** Peso extra de escândalos políticos no sorteio por ministro político além do padrão. */
  scandalPerPolitical: 0.12,
  /** Meses até poder trocar de novo o ministro de uma pasta. */
  replaceCooldown: 6,
  /** Desgaste de trocar um ministro (pontos de aprovação). */
  replaceApprovalCost: -0.5,
  /** Quantos partidos aliados (os mais próximos no espectro) dividem as pastas políticas. */
  alliedParties: 4,
  /** Chance de a oposição reagir quando um indicador se move além do limiar. */
  oppositionReactionChance: 0.6,
  /** Governadores: distância no espectro até a qual o partido é aliado / a partir da qual é oposição. */
  governorAllyDistance: 50,
  governorOppositionDistance: 105,
  /** Viagem a estado de governador aliado: menos risco e mais base; de oposição: mais risco. */
  allyVisitRisk: -0.05,
  allyVisitSupport: 0.5,
  oppositionVisitRisk: 0.1,
} as const;

/** Pastas que começam com ministro político (as demais começam com técnicos). */
export const POLITICAL_MINISTRIES = ['infraestrutura', 'desenvolvimento-social', 'defesa', 'justica'] as const;

// ─── Engine: noite da eleição (apuração por estado) ───────────────────────

export const ELECTION_MAP = {
  /** Pontos de votos válidos por unidade de afinidade do eleitorado com o candidato (relativa à média). */
  leanWeight: 28,
  /** Pontos de votos por ponto de bônus de visita recente ao estado (reeleição). */
  visitWeight: 0.4,
  minShare: 8,
  maxShare: 92,
  /** Atraso máximo (fração da apuração) até um estado começar a divulgar votos. */
  maxReportDelay: 0.55,
} as const;

// ─── Engine: viagens pelo Brasil ──────────────────────────────────────────

export const TRAVEL = {
  /** Meses até poder voltar ao mesmo estado. */
  stateCooldown: 6,
  /** Pontos de base aliada por deputado da bancada do estado visitado (SP, 70 deputados ≈ +1,75). */
  supportPerSeat: 0.025,
  /** Escala dos efeitos nos setores: estado menos populoso → fator mínimo; o mais populoso → 1. */
  minPopulationFactor: 0.6,
  /** Chance extra de vaias e protestos num eleitorado sem nenhuma afinidade com o governo. */
  hostileRiskBonus: 0.25,
  /** Popularidade estimada no estado: pontos por afinidade ideológica (relativa à média nacional). */
  leanWeight: 30,
  /** Bônus local de uma visita (pontos na popularidade do estado) e decaimento mensal. */
  localVisitBonus: 10,
  localBonusDecay: 0.85,
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
  waterSpeed: 0.5,
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
/**
 * Núcleo fiel (anti-bola de neve): perdas de aprovação de um setor encolhem
 * quando ele já está muito insatisfeito — fator = 1 − (início − aprovação) / faixa,
 * com piso mínimo. Quem ainda apoia o governo no fundo do poço é a base fiel.
 */
export const APPROVAL_FLOOR = {
  start: 30,
  span: 25,
  minFactor: 0.35,
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

/** Configuração de cada Casa para o placar exibido (derivado da chance e do sorteio). */
export interface ChamberConfig {
  seats: number;
  /** Votos "sim" para aprovar PEC (3/5 da Casa). */
  pecVotes: number;
  /** Votos "sim" para o impeachment (2/3 da Casa). */
  impeachmentVotes: number;
  /** Ausentes: mínimo + até `absentRange` a mais. */
  absentMin: number;
  absentRange: number;
  /** Abstenções: mínimo + até `abstentionRange` a mais. */
  abstentionMin: number;
  abstentionRange: number;
  /** Votos de folga por unidade de (chance − sorteio): votações apertadas saem por poucos votos. */
  marginVotes: number;
  /** Votos de folga no impeachment por ponto de aprovação/base além (ou aquém) do limite. */
  impeachmentVotesPerPoint: number;
  /** Folga máxima do impeachment (o partido do presidente não vota em massa contra ele). */
  impeachmentMaxMargin: number;
}

export const PLENARY = {
  chambers: {
    camara: {
      seats: 513,
      pecVotes: 308,
      impeachmentVotes: 342,
      absentMin: 15,
      absentRange: 30,
      abstentionMin: 2,
      abstentionRange: 10,
      marginVotes: 140,
      impeachmentVotesPerPoint: 4,
      impeachmentMaxMargin: 60,
    },
    senado: {
      seats: 81,
      pecVotes: 49,
      impeachmentVotes: 54,
      absentMin: 1,
      absentRange: 6,
      abstentionMin: 0,
      abstentionRange: 3,
      marginVotes: 22,
      impeachmentVotesPerPoint: 0.6,
      impeachmentMaxMargin: 10,
    },
  } satisfies Record<'camara' | 'senado', ChamberConfig>,
  /** PEC rejeitada: chance de ter caído já na Câmara (o resto cai no Senado). */
  pecChamberRejectionShare: 0.6,
  /** PEC que passa na Câmara e cai no Senado: folga máxima (votos) na Câmara. */
  pecChamberNarrowMargin: 20,
  /** Inclinação da adesão das bancadas (logística sobre a afinidade com o governo). */
  partySteepness: 9,
  /** Distância no espectro em que um partido não tem afinidade nenhuma com o governo. */
  partyAffinityRange: 180,
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

// ─── Modo carreira ────────────────────────────────────────────────────────

export const CAREER = {
  /** Deriva por semestre: sem trabalho, o eleitor esquece e o partido olha para outros. */
  drift: {
    localPopularity: -1.5,
    nationalRecognition: -0.5,
    electoralBase: -1,
    partyInfluence: -0.5,
  },
  /** Reputação abaixo de `reputationRecoveryCap` se recupera devagar (pontos por semestre). */
  reputationRecovery: 1,
  reputationRecoveryCap: 50,
  /**
   * Retornos decrescentes: ganhos de um indicador acima de `start` encolhem
   * linearmente até `minFactor` em 100 (perdas valem integralmente).
   */
  saturation: { start: 40, minFactor: 0.25 },
  /**
   * Manutenção: acima de `threshold`, cada ponto custa `rate` por semestre (fama,
   * rede e prestígio no partido exigem trabalho contínuo). Não vale para a reputação.
   */
  maintenance: { threshold: 40, rate: 0.04 },
  party: {
    /**
     * Partido pequeno: a influência cresce mais rápido ("cabeça de sardinha"); grande, mais devagar.
     * O tamanho é medido contra a bancada média dos partidos com deputados (fictícios ≈ 57; reais ≈ 26).
     */
    influenceSizeExponent: 0.35,
    influenceSizeMin: 0.75,
    influenceSizeMax: 1.35,
    /** Distância no espectro até a qual o partido é "casa" (ganho pleno de influência)... */
    fitDistance: 60,
    /** ...e a partir da qual o ganho cai ao mínimo `misfitFactor`. */
    misfitDistance: 160,
    misfitFactor: 0.6,
    /** Distância no espectro até a qual dois partidos são aliados. */
    allyDistance: 70,
    /** Troca de partido: fração da influência que sobra e o custo de imagem. */
    switchInfluenceKept: 0.4,
    switchReputationCost: -4,
    /** Quem troca de partido com convite chega com legenda garantida (influência mínima). */
    switchInvitedInfluence: 30,
  },
  election: {
    /** Força acima da dificuldade → chance (logística): +10 pontos ≈ 81%, −10 ≈ 19%. */
    spread: 7,
    minChance: 0.02,
    maxChance: 0.93,
    /** Pontos de força por 100% de bancada acima da média (votos de legenda, tempo de TV, fundo eleitoral). */
    partySizeProportional: 5,
    partySizeMajoritarian: 3,
    partySizeCap: 1.5,
    /** Afinidade ideológica com o eleitorado do estado: até ± `electorateFitPoints`. */
    electorateFitPoints: 4,
    electorateRange: 200,
    /** Reeleição: parlamentar ganha bônus fixo; chefe do Executivo depende da aprovação da gestão. */
    incumbentLegislative: 4,
    incumbentExecutiveBase: 2,
    incumbentApprovalWeight: 0.35,
    /** Rejeição: reputação abaixo de `threshold` tira `perPoint` de força por ponto. */
    rejection: { threshold: 30, perPoint: 0.35 },
    /** Partido que governa o nível em disputa: máquina e vitrine. */
    governingPartyBonus: 2,
    difficultyOffset: { easy: -5, normal: 0, hard: 5 },
    /** Prefeitura de cidade grande é mais disputada: pontos por unidade de log10(mil eleitores) acima da referência (≈ 150 mil). */
    cityDifficultyPerLog: 4,
    cityDifficultyReferenceLog: 2.18,
    /** Vice: a força da chapa mistura o titular (fictício) e o jogador. */
    runningMateWeight: 0.35,
    headStrengthNoise: 6,
    /** Votos válidos: pontos por unidade de (chance − sorteio), centrados em 50%. */
    shareSpread: 34,
    minShare: 6,
    maxShare: 88,
    /** Proporcional: quem perde com chance acima disto fica como suplente. */
    substituteMinChance: 0.25,
    /** Proporcional: votos do eleito em relação ao quociente (mín. e máx.). */
    electedQuotientMin: 0.45,
    electedQuotientMax: 1.6,
    /** Proporcional: candidatos fictícios exibidos na lista do partido. */
    listSize: 5,
    /** Proporcional: fração dos votos válidos que vai para o partido, por bancada relativa. */
    partyVoteShare: 0.11,
  },
  /** Gestão de prefeitos e governadores. */
  admin: {
    initialIndicator: 50,
    initialApproval: 52,
    /** Fração da distância ao equilíbrio percorrida por semestre. */
    approvalSpeed: 0.35,
    /** Bônus de equilíbrio no 1º ano de gestão (lua de mel). */
    honeymoon: 6,
    honeymoonTurns: 2,
    /** Desgaste natural dos serviços e pressão de gastos por semestre. */
    indicatorDrift: -1,
    contasDrift: -1.5,
    /** Contas abaixo disto atrasam salários e obras: cada ponto abaixo tira `debtPenalty` do equilíbrio. */
    contasCrisis: 30,
    debtPenalty: 0.5,
    /** Popularidade local converge para a aprovação da gestão (fração por semestre). */
    popularityPull: 0.25,
    /** Governador: reconhecimento nacional por ponto de aprovação acima de 50 (por semestre). */
    governorNationalPerApproval: 0.06,
  },
  events: {
    /** Chance de haver um acontecimento no semestre. */
    chancePerTurn: 0.75,
    defaultCooldown: 6,
    /** Escala dos efeitos negativos por dificuldade. */
    negativeScale: { easy: 0.8, normal: 1, hard: 1.2 },
  },
  /** Chegada à Presidência: o capital da carreira vira base aliada e aprovação iniciais. */
  presidency: {
    /** Base aliada por ponto de influência acima de 50. */
    influenceToSupport: 0.2,
    /** Aprovação por ponto de reputação acima de 50. */
    reputationToApproval: 0.1,
    /** Força eleitoral → votos no 2º turno: pontos por ponto de força acima da dificuldade. */
    strengthToShare: 0.6,
    /** Peso das respostas da campanha presidencial (debate) nos votos. */
    campaignWeight: 0.6,
    noise: 3,
    minShare: 30,
    maxShare: 68,
  },
  /** Elenco: padrinho, rival e adversário recorrente. */
  cast: {
    initialRelation: { padrinho: 25, rival: -5, adversario: -25 },
    /** Força inicial: padrinho veterano; rival um pouco à frente da sua influência; adversário local. */
    padrinhoStrength: { min: 66, max: 80 },
    rivalLead: { min: 2, max: 10 },
    adversaryStrength: { min: 38, max: 50 },
    /** Adversário que já governa a cidade começa com esta força. */
    incumbentAdversaryStrength: 55,
    /** Fração da relação que volta ao neutro por semestre (a memória esfria). */
    relationDecay: 0.04,
    /** Força por semestre com mandato e sem mandato. */
    strengthInOffice: 1.5,
    strengthOutOfOffice: -0.5,
    minStrength: 10,
    maxStrength: 95,
    /** Força ganha ao vencer e perdida ao perder uma eleição. */
    winStrength: 8,
    lossStrength: -4,
    /** O personagem disputa o maior cargo cuja dificuldade não passe da sua força + margem. */
    targetMargin: 4,
    /** Chance de um personagem vencer a eleição dele (logística, como a do jogador). */
    electionSpread: 7,
    memorySize: 6,
    /** Variação mínima de relação para virar lembrança. */
    memoryMinDelta: 4,
    retirementAge: 74,
    retirementChance: 0.15,
    /** Padrinho amigo acelera a influência; hostil, freia. */
    padrinhoFriendly: 40,
    padrinhoHostile: -30,
    padrinhoInfluenceBonus: 0.2,
    /** Pontos na prévia por ponto de relação com o padrinho. */
    padrinhoPrimaryWeight: 0.15,
    /** Prévia: (influência + padrinho − força do rival + relação × peso) / espalhamento → chance. */
    primarySpread: 8,
    rivalRelationWeight: 0.1,
    primaryMinChance: 0.05,
    primaryMaxChance: 0.95,
    /** Trégua com o rival: ele não disputa a prévia por N semestres. */
    truceTurns: 2,
    /** Adversário no mesmo cargo: pontos de força perdidos por ponto acima da referência. */
    adversaryReference: 50,
    adversaryWeight: 0.2,
    /** Quem fica no partido que você deixa: relação perdida. */
    switchRelationCost: -25,
  },
  /** Campanha: teto de gastos, fundo do partido, doações e o efeito do dinheiro. */
  campaign: {
    /**
     * Teto de gastos estimado (R$), aproximado dos limites do TSE de 2022 e 2024 (que variam por
     * município e estado): prefeito ≈ R$ 7,30 por eleitor (São Paulo ≈ R$ 67 mi), com piso; vereador ≈ R$ 0,50.
     */
    caps: {
      prefeitoPerVoter: 7.3,
      prefeitoFloor: 160_000,
      vereadorPerVoter: 0.5,
      vereadorFloor: 16_000,
      deputadoEstadual: 1_300_000,
      deputadoFederal: 3_200_000,
      governadorPerVoter: 0.8,
      senadorPerVoter: 0.25,
      statewideFloor: 2_800_000,
      presidente: 90_000_000,
    },
    /** Pontos de força por gastar o teto inteiro. */
    moneyPoints: 5,
    /** Fundo do partido (fração do teto): base + tamanho da bancada + influência + padrinho. */
    fund: { base: 0.15, perSize: 0.2, perInfluence: 0.005, perPadrinho: 0.0025, min: 0.05, max: 0.85 },
    /** Doações (fração do teto) por ponto de base eleitoral + popularidade local. */
    donationsPerPoint: 0.002,
    donationsMax: 0.5,
    /** Gastar mais do que arrecadou: chance de contas rejeitadas por fração do teto que faltou. */
    debtRiskPerShare: 0.8,
    debtImpact: { reputation: -8 },
  },
  /** Dois turnos (prefeito acima de 200 mil eleitores, governador e presidente). */
  runoff: {
    /**
     * 1º turno: desempenho d = chance − sorteio (o mesmo de um turno único); a vantagem sobre o
     * principal adversário é d × leadSpread pontos. Sem 2º turno, vence quem tem d > 0.
     */
    leadSpread: 60,
    /** Votos dos demais candidatos: base ± ruído, entre o mínimo e o máximo. */
    othersBase: 24,
    othersNoise: 8,
    minOthers: 6,
    maxOthers: 40,
    otherCandidates: 2,
    /**
     * 2º turno: a chance parte da vantagem do 1º turno (d) mais o efeito da escolha, com um
     * ruído uniforme de ± runoffNoise: chance = (runoffNoise + d + efeito) / (2 × runoffNoise).
     */
    runoffNoise: 0.3,
    minChance: 0.02,
    maxChance: 0.98,
  },
  /** Pesquisas da pré-candidatura. */
  polls: {
    noise: 3,
    history: 6,
    /** Semestres antes da eleição em que as pesquisas saem. */
    horizon: 2,
  },
  legacy: {
    /** Pontos de legado por ano no cargo, multiplicados pelo `rank`. */
    pointsPerRankYear: 10,
    electionWonPoints: 20,
    /** Pontos por ponto de reputação final acima (ou abaixo) de 50. */
    reputationPoints: 2,
    presidencyBonus: 1000,
  },
} as const;
