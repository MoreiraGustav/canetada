import type { EventCategory, EventCategoryInfo, GameMode, GameModeConfig, MinistryId, MinistryInfo } from '@/types';

/** Primeiro turno = Janeiro de 2027 (posse em 1º de janeiro). */
export const GAME_START_YEAR = 2027;
export const GAME_START_MONTH = 1;
export const MONTHS_PER_YEAR = 12;

export const MONTH_NAMES: readonly string[] = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MONTH_SHORT_NAMES: readonly string[] = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Modos de duração (GDD §2.2). */
export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  blitz: {
    id: 'blitz',
    label: 'Blitz',
    icon: '⚡',
    turns: 12,
    description: 'Um ano de governo. Ideal para conhecer o jogo.',
    duration: '~20–30 min',
    goalScale: 0.33,
  },
  standard: {
    id: 'standard',
    label: 'Padrão',
    icon: '🎯',
    turns: 24,
    description: 'Dois anos de governo. Experiência equilibrada.',
    duration: '~45–60 min',
    goalScale: 0.6,
  },
  full: {
    id: 'full',
    label: 'Mandato Completo',
    icon: '🏛️',
    turns: 48,
    description: 'Quatro anos de governo. Experiência completa e imersiva.',
    duration: '~90–120 min',
    goalScale: 1,
  },
};

export const GAME_MODE_ORDER: readonly GameMode[] = ['blitz', 'standard', 'full'];

/** Máximo de mandatos (Constituição: uma reeleição). */
export const MAX_TERMS = 2;

/** Quantidade de metas escolhidas no início do mandato (GDD §4.5). */
export const GOALS_TO_SELECT = 3;

/** Perguntas de campanha por partida (GDD §2.4: 2 a 3). */
export const CAMPAIGN_QUESTION_COUNT = 3;

/** Decisões por turno (GDD §2.3 sugere 3 a 5; playtest pediu menos leitura por mês). */
export const MIN_DECISIONS_PER_TURN = 3;
export const MAX_DECISIONS_PER_TURN = 4;

/** Ações diplomáticas permitidas por turno. */
export const DIPLOMATIC_ACTIONS_PER_TURN = 1;

/** Pontos máximos em gráficos históricos (CLAUDE.md › Performance). */
export const MAX_HISTORY_POINTS = 48;

/** Notícias mantidas no arquivo do jornal. */
export const MAX_NEWS_ARCHIVE = 40;

/** Votações mantidas no histórico do Congresso. */
export const MAX_VOTE_RECORDS = 30;

export const SAVE_STORAGE_KEY = 'presidente-simulator:save:v1';
export const SETTINGS_STORAGE_KEY = 'presidente-simulator:settings:v1';
export const SAVE_VERSION = 1;

export const MINISTRY_INFO: Record<MinistryId, MinistryInfo> = {
  fazenda: { id: 'fazenda', name: 'Ministério da Fazenda', shortName: 'Fazenda', icon: '💰' },
  saude: { id: 'saude', name: 'Ministério da Saúde', shortName: 'Saúde', icon: '🏥' },
  educacao: { id: 'educacao', name: 'Ministério da Educação', shortName: 'Educação', icon: '📚' },
  defesa: { id: 'defesa', name: 'Ministério da Defesa', shortName: 'Defesa', icon: '🎖️' },
  'meio-ambiente': { id: 'meio-ambiente', name: 'Ministério do Meio Ambiente', shortName: 'Meio Ambiente', icon: '🌳' },
  infraestrutura: { id: 'infraestrutura', name: 'Ministério da Infraestrutura', shortName: 'Infraestrutura', icon: '🛤️' },
  'relacoes-exteriores': {
    id: 'relacoes-exteriores',
    name: 'Ministério das Relações Exteriores',
    shortName: 'Itamaraty',
    icon: '🌍',
  },
  'desenvolvimento-social': {
    id: 'desenvolvimento-social',
    name: 'Ministério do Desenvolvimento Social',
    shortName: 'Desenv. Social',
    icon: '🤝',
  },
  justica: { id: 'justica', name: 'Ministério da Justiça', shortName: 'Justiça', icon: '⚖️' },
};

export const EVENT_CATEGORY_INFO: Record<EventCategory, EventCategoryInfo> = {
  'economic-crisis': { id: 'economic-crisis', label: 'Crise Econômica', icon: '📉', isCrisis: true },
  'natural-disaster': { id: 'natural-disaster', label: 'Desastre Natural', icon: '🌪️', isCrisis: true },
  'political-scandal': { id: 'political-scandal', label: 'Escândalo Político', icon: '🕵️', isCrisis: true },
  opportunity: { id: 'opportunity', label: 'Oportunidade', icon: '✨', isCrisis: false },
  international: { id: 'international', label: 'Internacional', icon: '🌐', isCrisis: false },
  social: { id: 'social', label: 'Social', icon: '📣', isCrisis: false },
  corruption: { id: 'corruption', label: 'Proposta Reservada', icon: '🤫', isCrisis: false },
};
