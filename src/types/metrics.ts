/**
 * Métricas numéricas do país simuladas pelo engine.
 * Aprovação e base aliada NÃO estão aqui: aprovação é derivada dos setores
 * e a base aliada pertence ao estado do Congresso. Ambas são acessíveis
 * via `IndicatorKey`.
 */
export interface GameMetrics {
  // ── Economia (principais) ────────────────────────────────────────────
  /** PIB real anual em R$ trilhões (preços constantes de 2026). */
  gdp: number;
  /** Crescimento real do PIB anualizado, em % a.a. */
  gdpGrowth: number;
  /** Crescimento potencial (estrutural) da economia, em % a.a. */
  potentialGrowth: number;
  /** Inflação IPCA acumulada em 12 meses, em %. */
  inflation: number;
  /** Taxa de desocupação (PNAD Contínua), em %. */
  unemployment: number;
  /** Câmbio, em R$ por US$. */
  exchangeRate: number;
  /** Dívida Bruta do Governo Geral, em % do PIB. */
  debt: number;
  /** Taxa Selic meta, em % a.a. */
  selic: number;
  /** Resultado primário anualizado, em % do PIB (negativo = déficit). */
  primaryBalance: number;
  /** Investimento Direto Estrangeiro anual, em US$ bilhões. */
  foreignInvestment: number;

  // ── Social ───────────────────────────────────────────────────────────
  /** Índice de Desenvolvimento Humano (0–1). Derivado pelo engine. */
  hdi: number;
  /** Índice de Gini (0–1). */
  gini: number;
  /** População abaixo da linha de pobreza, em %. */
  poverty: number;
  /** Cobertura da atenção primária do SUS, em %. */
  healthCoverage: number;
  /** IDEB composto (0–10). */
  ideb: number;
  /** Déficit habitacional, em milhões de domicílios. */
  housingDeficit: number;

  // ── Segurança ────────────────────────────────────────────────────────
  /** Homicídios por 100 mil habitantes. */
  homicideRate: number;
  /** Confiança nas forças de segurança (0–100). */
  securityTrust: number;

  // ── Infraestrutura ───────────────────────────────────────────────────
  /** Domicílios com coleta de esgoto, em %. */
  sanitation: number;
  /** Participação renovável na matriz elétrica, em %. */
  renewableEnergy: number;
  /** Domicílios com acesso à internet, em %. */
  digitalConnectivity: number;
  /** Km de rodovias/ferrovias entregues no mandato (acumulado). */
  infrastructureKm: number;

  // ── Meio ambiente ────────────────────────────────────────────────────
  /** Desmatamento anual na Amazônia Legal (PRODES), em km²/ano. */
  deforestation: number;
  /** Emissões brutas de gases de efeito estufa, em Mt CO₂e/ano. */
  co2Emissions: number;
  /** Índice de reservas hídricas (0–100). */
  waterReserves: number;

  // ── Relações exteriores ──────────────────────────────────────────────
  /** Prestígio internacional (0–100). */
  prestige: number;
  /** Saldo da balança comercial anual, em US$ bilhões. */
  tradeBalance: number;

  // ── Espectro político do governo ─────────────────────────────────────
  /** Posição econômica do governo: -100 (extrema esquerda) … 100 (extrema direita). */
  ideologyEconomic: number;
  /** Posição nos costumes: -100 (progressista) … 100 (conservador). */
  ideologySocial: number;
}

export type MetricKey = keyof GameMetrics;

/** Qualquer indicador legível do estado: métricas + aprovação + base aliada. */
export type IndicatorKey = MetricKey | 'approval' | 'congressSupport';

/** Setores da sociedade que compõem a aprovação (GDD §3.3). */
export type SectorKey =
  | 'lowerClass'
  | 'middleClass'
  | 'business'
  | 'market'
  | 'agribusiness'
  | 'military'
  | 'environmentalists';

/** Aprovação (0–100) de cada setor. */
export type SectorApproval = Record<SectorKey, number>;

/** Deslocamento persistente da aprovação de equilíbrio de cada setor (afinidade ideológica). */
export type SectorAffinity = Partial<Record<SectorKey, number>>;

/**
 * Polaridade de um indicador: 1 = quanto maior melhor, -1 = quanto menor melhor,
 * 0 = neutro/ambíguo.
 */
export type MetricPolarity = 1 | -1 | 0;

export type MetricGroup = 'economy' | 'social' | 'security' | 'infrastructure' | 'environment' | 'foreign' | 'politics';

/** Metadados de exibição de um indicador (rótulos PT-BR, unidade, tooltip). */
export interface IndicatorInfo {
  label: string;
  shortLabel: string;
  icon: string;
  /** Prefixo de unidade (ex.: "R$ "). */
  prefix: string;
  /** Sufixo de unidade (ex.: "%", " tri"). */
  suffix: string;
  decimals: number;
  polarity: MetricPolarity;
  group: MetricGroup;
  /** Texto explicativo para tooltip (jogador casual). */
  description: string;
  /** Fonte de dados real que inspira o valor inicial. */
  source: string;
}

export interface MetricBounds {
  min: number;
  max: number;
}

/** Variações de indicadores entre dois momentos. */
export type IndicatorDeltas = Partial<Record<IndicatorKey, number>>;

/** Fotografia das métricas ao fim de um turno (histórico para gráficos). */
export interface MetricsSnapshot {
  turn: number;
  approval: number;
  congressSupport: number;
  metrics: GameMetrics;
  sectors: SectorApproval;
}
