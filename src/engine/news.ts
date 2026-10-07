import { MAX_INDICATOR_NEWS } from '@/constants/balance';
import type { HeadlineTemplate, NewsCategory, NewsItem, NewsTone, Rng, SimulationState } from '@/types';
import { formatIndicator, formatIndicatorValue, interpolate } from '@/utils/format';
import { getIndicatorValue } from './conditions';

/** Cria uma manchete com ID determinístico (`turno:chave`). */
export const createNewsItem = (turn: number, headline: string, tone: NewsTone, category: NewsCategory, key: string): NewsItem => ({
  id: `${turn}:${key}`,
  turn,
  headline,
  tone,
  category,
});

interface Candidate {
  template: HeadlineTemplate;
  delta: number;
  value: number;
  /** |delta| / limiar: quanto maior, mais noticiável. */
  strength: number;
}

const findCandidates = (before: SimulationState, after: SimulationState, templates: readonly HeadlineTemplate[]): Candidate[] =>
  templates.flatMap((template) => {
    const value = getIndicatorValue(after, template.indicator);
    const delta = value - getIndicatorValue(before, template.indicator);
    const matches = template.direction === 'up' ? delta >= template.threshold : -delta >= template.threshold;
    return matches && template.templates.length > 0 ? [{ template, delta, value, strength: Math.abs(delta) / template.threshold }] : [];
  });

/** Manchetes dinâmicas para os indicadores que mais variaram no turno (no máximo uma por indicador). */
export const generateIndicatorNews = (
  before: SimulationState,
  after: SimulationState,
  templates: readonly HeadlineTemplate[],
  rng: Rng,
): NewsItem[] => {
  const seen = new Set<string>();
  return findCandidates(before, after, templates)
    .sort((a, b) => b.strength - a.strength)
    .filter((candidate) => {
      if (seen.has(candidate.template.indicator)) return false;
      seen.add(candidate.template.indicator);
      return true;
    })
    .slice(0, MAX_INDICATOR_NEWS)
    .map(({ template, delta, value }) => {
      const text = template.templates[Math.floor(rng.next() * template.templates.length)];
      const headline = interpolate(text, {
        value: formatIndicator(template.indicator, value),
        delta: formatIndicatorValue(template.indicator, Math.abs(delta)),
      });
      return createNewsItem(after.turn, headline, template.tone, template.category, `indicator:${template.id}`);
    });
};
