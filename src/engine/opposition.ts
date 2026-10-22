/**
 * Oposição: o adversário derrotado reage ao mês do governo nas manchetes.
 * Pessoas reais nunca têm falas atribuídas — a manchete fala da oposição
 * liderada pelo partido delas; líderes fictícios aparecem pelo nome.
 */
import { CABINET } from '@/constants/balance';
import { INDICATOR_INFO } from '@/constants/metrics';
import type { NewsItem, OppositionLeader, OppositionLine, Party, Rng, SimulationState } from '@/types';
import { getIndicatorValue } from './conditions';
import { createNewsItem } from './news';

/** Como a oposição aparece na manchete: "Fulano (ALD)" ou "Oposição liderada pelo PL". */
export const oppositionLabel = (leader: OppositionLeader, parties: readonly Party[]): string => {
  const acronym = parties.find((party) => party.id === leader.partyId)?.acronym ?? '';
  return leader.real ? `Oposição liderada pelo ${acronym}` : `${leader.name} (${acronym})`;
};

/** Quanto o indicador andou no sentido da reação, em múltiplos do limiar (0 se não reage). */
const strength = (before: SimulationState, after: SimulationState, line: OppositionLine): number => {
  const delta = getIndicatorValue(after, line.indicator) - getIndicatorValue(before, line.indicator);
  const moved = line.direction === 'up' ? delta : -delta;
  return moved >= line.threshold ? moved / line.threshold : 0;
};

/**
 * No máximo uma reação por mês: ao indicador que mais se moveu além do limiar,
 * com chance CABINET.oppositionReactionChance. Crítica a um mês ruim sai negativa.
 */
export const generateOppositionNews = (
  before: SimulationState,
  after: SimulationState,
  lines: readonly OppositionLine[],
  parties: readonly Party[],
  rng: Rng,
): NewsItem[] => {
  const leader = after.cast.opposition;
  if (!leader) return [];
  const [top] = lines
    .map((line) => ({ line, strength: strength(before, after, line) }))
    .filter((entry) => entry.strength > 0)
    .sort((a, b) => b.strength - a.strength);
  if (!top || rng.next() >= CABINET.oppositionReactionChance) return [];
  const template = top.line.templates[Math.floor(rng.next() * top.line.templates.length)];
  const headline = template.replaceAll('{oposicao}', oppositionLabel(leader, parties));
  const polarity = INDICATOR_INFO[top.line.indicator].polarity;
  const badForGovernment = (top.line.direction === 'up' ? 1 : -1) * polarity < 0;
  return [createNewsItem(after.turn, headline, badForGovernment ? 'negative' : 'neutral', 'politics', `oposicao:${top.line.indicator}`)];
};
