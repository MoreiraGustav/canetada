import type { VoteRecord } from './congress';
import type { SimulationState } from './game';
import type { NewsItem } from './news';

/** Resultado padrão de uma etapa do engine que também gera manchetes. */
export interface StateWithNews {
  state: SimulationState;
  news: NewsItem[];
}

/** Resultado da aplicação de uma escolha de decisão (com votação, se houver). */
export interface DecisionResult {
  state: SimulationState;
  news: NewsItem[];
  vote: VoteRecord | null;
}

/** Decisões sorteadas para o turno. */
export interface DecisionSelection {
  state: SimulationState;
  decisionIds: string[];
}

/** Evento sorteado para o turno (null se nenhum elegível). */
export interface EventSelection {
  state: SimulationState;
  eventId: string | null;
}

/** Resultado de uma ação diplomática. */
export interface DiplomaticActionResult {
  state: SimulationState;
  news: NewsItem;
}

/** Perguntas de campanha sorteadas e semente avançada. */
export interface CampaignQuestionSelection {
  questionIds: string[];
  seed: number;
}

/**
 * Sinais normalizados (positivo = favorável) usados para calcular a
 * aprovação de equilíbrio de cada setor da sociedade.
 */
export type ApprovalSignal =
  | 'inflation'
  | 'unemployment'
  | 'growth'
  | 'strongCurrency'
  | 'debt'
  | 'fiscal'
  | 'lowRates'
  | 'security'
  | 'environment'
  | 'education'
  | 'health'
  | 'poverty'
  | 'infrastructure'
  | 'prestige';

export type ApprovalSignals = Record<ApprovalSignal, number>;

/** O que puxa a aprovação: um sinal dos indicadores ou um fator político. */
export type ApprovalDriverKey = ApprovalSignal | 'affinity' | 'militancy' | 'confidence' | 'honeymoon' | 'wear';

export interface ApprovalDriver {
  key: ApprovalDriverKey;
  /** Pontos de aprovação geral (ponderados pelos setores) em relação ao início do governo. */
  points: number;
}

/** Para onde a aprovação caminha e por quê. */
export interface ApprovalOutlook {
  current: number;
  /** Aprovação de equilíbrio: onde ela chega se nada mudar. */
  target: number;
  /** Fatores ordenados por impacto (maior |pontos| primeiro). */
  drivers: ApprovalDriver[];
}
