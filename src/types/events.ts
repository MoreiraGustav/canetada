import type { Condition } from './conditions';
import type { DelayedImpact, Impact, OutcomeRisk } from './impact';

export type EventCategory =
  | 'economic-crisis'
  | 'natural-disaster'
  | 'political-scandal'
  | 'opportunity'
  | 'international'
  | 'social'
  | 'corruption';

/** Frequência base (GDD §4.4); convertida em peso pelo engine. */
export type EventFrequency = 'rare' | 'moderate' | 'frequent';

/**
 * Gatilho condicional: se `condition` for verdadeira, o peso do evento
 * na rolagem condicional (60%) é multiplicado por `multiplier`.
 */
export interface EventTrigger {
  condition: Condition;
  multiplier: number;
}

export interface EventOption {
  /** Único dentro do evento (kebab-case). */
  id: string;
  label: string;
  /** Explicação qualitativa das consequências. */
  description: string;
  impact: Impact;
  delayed?: DelayedImpact[];
  headline: string;
  flags?: string[];
  /** Chance de um desfecho diferente do planejado. */
  risk?: OutcomeRisk;
}

export interface GameEvent {
  /** Único global (kebab-case), ex.: "enchente-rs". */
  id: string;
  category: EventCategory;
  title: string;
  /** Emoji ilustrativo. */
  icon: string;
  /** Narrativa do acontecimento (tom sério e institucional). */
  description: string;
  frequency: EventFrequency;
  /** Condições que aumentam a chance (sistema condicional). */
  triggers?: EventTrigger[];
  /** Condições obrigatórias para o evento ser elegível. */
  requires?: Condition[];
  /** Meses do calendário (1–12) em que pode ocorrer. */
  months?: number[];
  /** Evento programado: ocorre obrigatoriamente nesta data (se o jogo chegar lá). */
  scheduled?: { year: number; month: number };
  minTurn?: number;
  /** Se true, ocorre no máximo uma vez por partida. */
  oneTime?: boolean;
  /** Turnos mínimos entre ocorrências (padrão em balance.ts). */
  cooldown?: number;
  /**
   * Se elegível, ocorre antes do sorteio (logo após os programados). Usado para
   * desdobramentos obrigatórios, como um esquema de corrupção que veio à tona.
   */
  priority?: boolean;
  options: EventOption[];
}

export interface EventCategoryInfo {
  id: EventCategory;
  label: string;
  icon: string;
  /** Se a categoria representa uma crise (conta como "evento sobrevivido"). */
  isCrisis: boolean;
}
