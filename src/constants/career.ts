import type { AdminIndicatorKey, CareerCharacterRole, CareerLevel, CareerMetricKey, CareerMetrics } from '@/types';

/** 1º semestre da carreira = janeiro de 2027 (logo depois das eleições gerais de 2026). */
export const CAREER_START_YEAR = 2027;
export const SEMESTERS_PER_YEAR = 2;
/** Eleições acontecem em outubro: no 2º semestre dos anos pares. */
export const ELECTION_SEMESTER = 2;
/** Ano de referência das eleições municipais (2028, 2032...); as gerais caem dois anos depois (2030, 2034...). */
export const MUNICIPAL_ELECTION_REFERENCE_YEAR = 2028;
export const ELECTION_INTERVAL_YEARS = 2;

/** Idade inicial do personagem (pode se filiar a partir dos 16, mas a carreira começa aos 18). */
export const CAREER_MIN_START_AGE = 18;
export const CAREER_MAX_START_AGE = 60;
export const CAREER_DEFAULT_START_AGE = 25;
/** A carreira se encerra sozinha nesta idade (aposentadoria). */
export const CAREER_RETIREMENT_AGE = 85;

/** Ações de agenda por semestre. */
export const CAREER_ACTIONS_PER_TURN = 2;

/** Filiação: pelo menos 6 meses antes da eleição (um semestre antes do semestre da eleição). */
export const AFFILIATION_MIN_SEMESTERS = 1;

export const CAREER_NAME_MAX_LENGTH = 40;
export const CAREER_POLITICAL_NAME_MAX_LENGTH = 24;

/** Nome do jornal das telas da carreira. */
export const CAREER_NEWSPAPER_TITLE = 'Diário Político';

/** Notícias mantidas no jornal da carreira. */
export const MAX_CAREER_NEWS = 30;

export const CAREER_METRIC_KEYS: readonly CareerMetricKey[] = [
  'partyInfluence',
  'localPopularity',
  'nationalRecognition',
  'electoralBase',
  'reputation',
];

export const CAREER_METRIC_INFO: Record<CareerMetricKey, { label: string; shortLabel: string; icon: string; description: string }> = {
  partyInfluence: {
    label: 'Influência partidária',
    shortLabel: 'Influência',
    icon: '🤝',
    description: 'Peso dentro do partido: decide quem ganha legenda, cargos e convites.',
  },
  localPopularity: {
    label: 'Popularidade local',
    shortLabel: 'Pop. local',
    icon: '🏘️',
    description: 'Quanto a sua cidade conhece e gosta de você.',
  },
  nationalRecognition: {
    label: 'Reconhecimento nacional',
    shortLabel: 'Rec. nacional',
    icon: '📺',
    description: 'Quanto o Brasil sabe quem você é. Pesa nas eleições estaduais e federais.',
  },
  electoralBase: {
    label: 'Base eleitoral',
    shortLabel: 'Base',
    icon: '🗳️',
    description: 'Rede de lideranças, cabos eleitorais e apoiadores fiéis que viram votos.',
  },
  reputation: {
    label: 'Reputação',
    shortLabel: 'Reputação',
    icon: '⚖️',
    description: 'Imagem de honestidade e competência. Escândalos derrubam; trabalho sério constrói.',
  },
};

/** Ponto de partida de qualquer personagem (a profissão soma por cima). */
export const CAREER_BASE_METRICS: CareerMetrics = {
  partyInfluence: 5,
  localPopularity: 10,
  nationalRecognition: 2,
  electoralBase: 8,
  reputation: 55,
};

export const ADMIN_INDICATOR_KEYS: readonly AdminIndicatorKey[] = ['saude', 'educacao', 'infraestrutura', 'seguranca', 'contas'];

export const ADMIN_INDICATOR_INFO: Record<AdminIndicatorKey, { label: string; icon: string }> = {
  saude: { label: 'Saúde', icon: '🏥' },
  educacao: { label: 'Educação', icon: '📚' },
  infraestrutura: { label: 'Obras', icon: '🚧' },
  seguranca: { label: 'Segurança', icon: '🚓' },
  contas: { label: 'Contas', icon: '💰' },
};

export const CAREER_LEVEL_LABELS: Record<CareerLevel, string> = {
  municipal: 'Prefeitura',
  estadual: 'Governo do estado',
  federal: 'Governo federal',
};

/**
 * Posição no partido conforme a influência (do mais alto ao mais baixo).
 * Só um rótulo: o efeito real está nas exigências de legenda de cada cargo.
 */
export const PARTY_RANKS: ReadonlyArray<{ minInfluence: number; label: string }> = [
  { minInfluence: 90, label: 'Cacique do partido' },
  { minInfluence: 75, label: 'Liderança nacional' },
  { minInfluence: 55, label: 'Dirigente estadual' },
  { minInfluence: 35, label: 'Dirigente municipal' },
  { minInfluence: 15, label: 'Militante ativo(a)' },
  { minInfluence: 0, label: 'Filiado(a)' },
];

/**
 * Deputados estaduais (Constituição, art. 27): o triplo da bancada federal até 36;
 * acima disso, mais um para cada deputado federal além de 12.
 */
export const STATE_ASSEMBLY_RULE = { multiplier: 3, cap: 36, federalThreshold: 12 } as const;

/**
 * Votos válidos por eleitor apto: 72,1% no 1º turno de 2026 para deputado federal
 * (113,7 milhões de válidos sobre 157,6 milhões de aptos; TSE).
 */
export const VALID_VOTES_PER_VOTER = 0.721;

/**
 * Dígitos do número de urna por cargo (Lei 9.504/97, art. 15): prefeito, governador e
 * presidente usam o número do partido (2); senador, 3; deputado federal, 4; deputado
 * estadual/distrital e vereador, 5.
 */
export const BALLOT_DIGITS: Readonly<Record<string, number>> = {
  vereador: 5,
  'deputado-estadual': 5,
  'deputado-federal': 4,
  senador: 3,
};
export const PARTY_NUMBER_DIGITS = 2;

/** Prefeito tem 2º turno só em municípios com mais de 200 mil eleitores (Constituição, art. 29, II). */
export const RUNOFF_MIN_VOTERS = 200_000;

/** Chave da estratégia (tom da campanha) nas escolhas da campanha. */
export const CAMPAIGN_TONE_KEY = 'tom';

export const CAREER_CHARACTER_INFO: Record<CareerCharacterRole, { label: string; shortLabel: string; icon: string; description: string }> = {
  padrinho: { label: 'Padrinho político', shortLabel: 'Padrinho', icon: '🎩', description: 'Cacique do seu partido: abre portas, ajuda nas prévias e cobra lealdade.' },
  rival: { label: 'Rival no partido', shortLabel: 'Rival', icon: '⚔️', description: 'Disputa as mesmas vagas que você dentro do partido.' },
  adversario: { label: 'Adversário', shortLabel: 'Adversário', icon: '🥊', description: 'A principal oposição a você: volta a cada eleição.' },
};

/** Rótulo da relação (do mais alto ao mais baixo). */
export const RELATION_LABELS: ReadonlyArray<{ min: number; label: string }> = [
  { min: 60, label: 'Aliado fiel' },
  { min: 25, label: 'Próximo' },
  { min: -10, label: 'Neutro' },
  { min: -45, label: 'Desconfiado' },
  { min: -100, label: 'Inimigo' },
];
