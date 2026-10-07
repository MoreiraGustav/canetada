import type { ImpactScaling, OutcomeRisk, Rng, SimulationState, StateWithNews } from '@/types';
import { applyImpact, scaleImpactByPolarity, scheduleDelayedImpacts, setFlags, toneFromImpact } from './impacts';
import { createNewsItem } from './news';

/**
 * Rola o desfecho incerto de uma opção: com probabilidade `risk.chance`,
 * aplica o impacto extra (escalado pela dificuldade), agenda efeitos e gera manchete.
 */
export const rollOutcomeRisk = (
  state: SimulationState,
  risk: OutcomeRisk | undefined,
  sourceId: string,
  label: string,
  rng: Rng,
  scaling: ImpactScaling,
): StateWithNews => {
  if (!risk || rng.next() >= risk.chance) return { state, news: [] };
  const delayed = risk.delayed?.map((entry) => ({ ...entry, impact: scaleImpactByPolarity(entry.impact, scaling) }));
  const applied = applyImpact(state, risk.impact, scaling);
  const scheduled = scheduleDelayedImpacts(applied, `${sourceId}:risco`, label, delayed);
  const news = createNewsItem(state.turn, risk.headline, toneFromImpact(risk.impact), 'politics', `risk:${sourceId}`);
  return { state: setFlags(scheduled, risk.flags), news: [news] };
};
