import type { IndicatorKey } from './metrics';

export type NewsTone = 'positive' | 'negative' | 'neutral';

export type NewsCategory =
  | 'decision'
  | 'event'
  | 'economy'
  | 'congress'
  | 'diplomacy'
  | 'promise'
  | 'social'
  | 'politics';

export interface NewsItem {
  id: string;
  turn: number;
  headline: string;
  tone: NewsTone;
  category: NewsCategory;
}

/**
 * Template de manchete gerada dinamicamente quando um indicador varia no turno.
 * Placeholders: `{value}` (valor atual formatado) e `{delta}` (variação absoluta formatada).
 */
export interface HeadlineTemplate {
  id: string;
  indicator: IndicatorKey;
  direction: 'up' | 'down';
  /** Variação absoluta mínima no turno para disparar. */
  threshold: number;
  tone: NewsTone;
  category: NewsCategory;
  templates: string[];
}
