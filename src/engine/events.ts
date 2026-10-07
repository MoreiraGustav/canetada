/**
 * Sistema de eventos (GDD §4.4 e §9, item 9): programados têm prioridade;
 * no resto, 40% sorteio aleatório puro e 60% condicional (consequência do mandato).
 */
import {
  CORRUPTION_OFFER_CHANCE,
  CORRUPTION_OFFER_MIN_TURN,
  DEFAULT_EVENT_COOLDOWN,
  EVENT_FREQUENCY_WEIGHTS,
  RANDOM_EVENT_SHARE,
  SEEN_EVENT_WEIGHT,
} from '@/constants/balance';
import { EVENT_CATEGORY_INFO } from '@/constants/game';
import type { DifficultyConfig, EventOption, EventSelection, GameEvent, NewsItem, Rng, SimulationState } from '@/types';
import { getTurnDate } from '@/utils/calendar';
import { evaluateCondition, evaluateConditions } from './conditions';
import { applyImpact, imprintPolicyMemory, scaleImpactByPolarity, scheduleDelayedImpacts, setFlags, toneFromImpact } from './impacts';
import { createNewsItem } from './news';
import { rollOutcomeRisk } from './outcomes';
import { pickWeighted, withStateRng } from './random';

const isScheduledNow = (state: SimulationState, event: GameEvent): boolean => {
  if (!event.scheduled) return false;
  const { year, month } = getTurnDate(state.turn);
  return event.scheduled.year === year && event.scheduled.month === month;
};

const isHistoryEligible = (state: SimulationState, event: GameEvent): boolean => {
  const last = state.eventHistory[event.id];
  if (last === undefined) return true;
  if (event.oneTime) return false;
  return state.turn - last >= (event.cooldown ?? DEFAULT_EVENT_COOLDOWN);
};

/** Eventos não programados elegíveis no turno (requires, meses, turno mínimo, oneTime e cooldown). */
export const getEligibleEvents = (state: SimulationState, events: readonly GameEvent[]): GameEvent[] => {
  const { month } = getTurnDate(state.turn);
  return events.filter(
    (event) =>
      !event.scheduled &&
      (event.minTurn === undefined || state.turn >= event.minTurn) &&
      (event.months === undefined || event.months.includes(month)) &&
      isHistoryEligible(state, event) &&
      evaluateConditions(state, event.requires),
  );
};

/** Peso base: frequência × agressividade de crises (dificuldade) × propensão a escândalos (habilidade) × novidade. */
const baseWeight = (state: SimulationState, event: GameEvent, difficulty: DifficultyConfig): number => {
  const crisis = EVENT_CATEGORY_INFO[event.category].isCrisis ? difficulty.crisisWeightMultiplier : 1;
  const scandal = event.category === 'political-scandal' ? state.modifiers.scandalWeightMultiplier : 1;
  const novelty = state.eventHistory[event.id] === undefined ? 1 : SEEN_EVENT_WEIGHT;
  return EVENT_FREQUENCY_WEIGHTS[event.frequency] * crisis * scandal * novelty;
};

/** Peso condicional: base × produto dos multiplicadores dos gatilhos satisfeitos (0 se nenhum). */
const conditionalWeight = (state: SimulationState, event: GameEvent, difficulty: DifficultyConfig): number => {
  const satisfied = (event.triggers ?? []).filter((trigger) => evaluateCondition(state, trigger.condition));
  if (satisfied.length === 0) return 0;
  return satisfied.reduce((acc, trigger) => acc * trigger.multiplier, baseWeight(state, event, difficulty));
};

/** Peso de uma proposta reservada: base × gatilhos satisfeitos (sem exigir gatilho). */
const offerWeight = (state: SimulationState, event: GameEvent, difficulty: DifficultyConfig): number =>
  (event.triggers ?? [])
    .filter((trigger) => evaluateCondition(state, trigger.condition))
    .reduce((acc, trigger) => acc * trigger.multiplier, baseWeight(state, event, difficulty));

/**
 * Propostas reservadas (categoria "corruption") têm canal próprio: a cada mês,
 * com chance CORRUPTION_OFFER_CHANCE, uma delas chega no lugar do evento sorteado.
 */
const drawOffer = (rng: Rng, state: SimulationState, offers: readonly GameEvent[], difficulty: DifficultyConfig): GameEvent | null => {
  if (offers.length === 0 || state.turn < CORRUPTION_OFFER_MIN_TURN || rng.next() >= CORRUPTION_OFFER_CHANCE) return null;
  return pickWeighted(rng, offers.map((event) => ({ item: event, weight: offerWeight(state, event, difficulty) })));
};

const drawEvent = (rng: Rng, state: SimulationState, eligible: readonly GameEvent[], difficulty: DifficultyConfig): GameEvent | null => {
  const offer = drawOffer(rng, state, eligible.filter((event) => event.category === 'corruption'), difficulty);
  if (offer) return offer;
  const regular = eligible.filter((event) => event.category !== 'corruption');
  const random = (): GameEvent | null =>
    pickWeighted(rng, regular.map((event) => ({ item: event, weight: baseWeight(state, event, difficulty) })));
  if (rng.next() < RANDOM_EVENT_SHARE) return random();
  const conditional = pickWeighted(rng, regular.map((event) => ({ item: event, weight: conditionalWeight(state, event, difficulty) })));
  return conditional ?? random();
};

export const selectEvent = (state: SimulationState, events: readonly GameEvent[], difficulty: DifficultyConfig): EventSelection => {
  const scheduled = events.find((event) => isScheduledNow(state, event) && state.eventHistory[event.id] === undefined);
  if (scheduled) return { state, eventId: scheduled.id };
  const eligible = getEligibleEvents(state, events);
  // Desdobramentos obrigatórios (ex.: esquema que veio à tona) saem antes do sorteio.
  const urgent = eligible.find((event) => event.priority);
  if (urgent) return { state, eventId: urgent.id };
  const { result, seed } = withStateRng(state, (rng) => drawEvent(rng, state, eligible, difficulty));
  return { state: { ...state, seed }, eventId: result?.id ?? null };
};

/**
 * Resolve a opção do evento; crises têm os negativos escalados também por `crisisImpactMultiplier`.
 * Com `rng`, rola o desfecho incerto (`option.risk`).
 */
export const resolveEventOption = (
  state: SimulationState,
  event: GameEvent,
  option: EventOption,
  difficulty: DifficultyConfig,
  rng?: Rng,
): { state: SimulationState; news: NewsItem[] } => {
  const isCrisis = EVENT_CATEGORY_INFO[event.category].isCrisis;
  const scaling = {
    positive: difficulty.positiveImpactMultiplier,
    negative: difficulty.negativeImpactMultiplier * (isCrisis ? state.modifiers.crisisImpactMultiplier : 1),
  };
  const delayed = option.delayed?.map((entry) => ({ ...entry, impact: scaleImpactByPolarity(entry.impact, scaling) }));
  const applied = applyImpact(state, option.impact, scaling);
  const scheduled = scheduleDelayedImpacts(applied, event.id, event.title, delayed);
  const flagged = imprintPolicyMemory(setFlags(scheduled, option.flags), option.impact);
  const next: SimulationState = {
    ...flagged,
    eventHistory: { ...flagged.eventHistory, [event.id]: state.turn },
    stats: {
      ...flagged.stats,
      eventsFaced: flagged.stats.eventsFaced + 1,
      crisesFaced: flagged.stats.crisesFaced + (isCrisis ? 1 : 0),
    },
  };
  const headline = createNewsItem(state.turn, option.headline, toneFromImpact(option.impact), 'event', `event:${event.id}`);
  const risk = rng ? rollOutcomeRisk(next, option.risk, event.id, event.title, rng, scaling) : { state: next, news: [] };
  return { state: risk.state, news: [headline, ...risk.news] };
};
