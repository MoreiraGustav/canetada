import { DIPLOMACY } from '@/constants/balance';
import { INITIAL_METRICS, METRIC_BOUNDS } from '@/constants/metrics';
import type { Country, CountryId, DiplomaticAction, DiplomaticActionResult, Relations, SimulationState } from '@/types';
import { formatTurnShort } from '@/utils/calendar';
import { interpolate } from '@/utils/format';
import { clamp } from '@/utils/math';
import { applyImpact, scheduleDelayedImpacts } from './impacts';
import { createNewsItem } from './news';

const average = (relations: Relations, ids: readonly CountryId[]): number =>
  ids.reduce((acc, id) => acc + relations[id], 0) / Math.max(1, ids.length);

/** Relações derivam levemente às iniciais; prestígio tende a f(relações médias, desmatamento). */
export const stepDiplomacy = (state: SimulationState, countries: readonly Country[]): SimulationState => {
  const relations = { ...state.relations };
  countries.forEach((country) => {
    relations[country.id] = clamp(
      relations[country.id] + DIPLOMACY.relationDriftSpeed * (country.initialRelation - relations[country.id]),
      0,
      100,
    );
  });
  const ids = countries.map((country) => country.id);
  const initialAverage = countries.reduce((acc, country) => acc + country.initialRelation, 0) / Math.max(1, countries.length);
  const prestigeTarget =
    DIPLOMACY.prestigeReference +
    DIPLOMACY.prestigeRelationEffect * (average(relations, ids) - initialAverage) -
    DIPLOMACY.prestigeDeforestationEffect * (state.metrics.deforestation - INITIAL_METRICS.deforestation);
  const prestige = clamp(
    state.metrics.prestige + DIPLOMACY.prestigeSpeed * (prestigeTarget - state.metrics.prestige),
    METRIC_BOUNDS.prestige.min,
    METRIC_BOUNDS.prestige.max,
  );
  return { ...state, relations, metrics: { ...state.metrics, prestige } };
};

export const canPerformDiplomaticAction = (state: SimulationState): boolean => state.lastDiplomaticActionTurn !== state.turn;

/**
 * Ação diplomática: ganho de relação × multiplicador de diplomacia; a parte
 * temporária (`targetRelationDecay`) se dissipa via efeito gradual.
 */
export const applyDiplomaticAction = (
  state: SimulationState,
  action: DiplomaticAction,
  countryId: CountryId,
  countryName: string,
): DiplomaticActionResult => {
  const multiplier = state.modifiers.diplomacyMultiplier;
  const withRelation = applyImpact(state, { ...action.impact, relations: { ...action.impact.relations, [countryId]: action.relationDelta * multiplier } });
  const decay = [{ impact: { relations: { [countryId]: -action.targetRelationDecay * multiplier } }, delay: 0, duration: action.decayDuration }];
  const sourceId = `${action.id}:${countryId}`;
  const label = `${action.name} — ${countryName} (${formatTurnShort(state.turn)})`;
  const withDecay = scheduleDelayedImpacts(withRelation, sourceId, label, decay);
  const withDelayed = scheduleDelayedImpacts(withDecay, `${sourceId}:extra`, label, action.delayed);
  const next: SimulationState = {
    ...withDelayed,
    lastDiplomaticActionTurn: state.turn,
    stats: { ...withDelayed.stats, diplomaticActions: withDelayed.stats.diplomaticActions + 1 },
  };
  const headline = interpolate(action.headline, { country: countryName });
  return { state: next, news: createNewsItem(state.turn, headline, 'positive', 'diplomacy', `diplomacy:${action.id}`) };
};
