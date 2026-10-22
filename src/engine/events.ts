/**
 * Sistema de eventos (GDD §4.4 e §9, item 9): programados têm prioridade;
 * no resto, 40% sorteio aleatório puro e 60% condicional (consequência do mandato).
 */
import {
  CORRUPTION_OFFER_CHANCE,
  CORRUPTION_OFFER_MIN_TURN,
  CRISIS_RESPITE,
  DEFAULT_EVENT_COOLDOWN,
  EVENT_FREQUENCY_WEIGHTS,
  MAX_TRIGGER_MULTIPLIER,
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

const isCrisisEvent = (event: GameEvent): boolean => EVENT_CATEGORY_INFO[event.category].isCrisis;

/** Último turno em que houve uma crise (ou null), a partir do histórico de eventos. */
const lastCrisisTurn = (state: SimulationState, events: readonly GameEvent[]): number | null =>
  events.reduce<number | null>((latest, event) => {
    const turn = state.eventHistory[event.id];
    if (turn === undefined || !isCrisisEvent(event)) return latest;
    return latest === null ? turn : Math.max(latest, turn);
  }, null);

/** Trégua: logo depois de uma crise, outras crises pesam menos no sorteio. */
const inCrisisRespite = (state: SimulationState, events: readonly GameEvent[]): boolean => {
  const last = lastCrisisTurn(state, events);
  return last !== null && state.turn - last <= CRISIS_RESPITE.turns;
};

/** Contexto do sorteio do mês (calculado uma vez por turno). */
interface DrawContext {
  state: SimulationState;
  difficulty: DifficultyConfig;
  respite: boolean;
}

/** Peso base: frequência × agressividade de crises (dificuldade, trégua) × propensão a escândalos (habilidade) × novidade. */
const baseWeight = ({ state, difficulty, respite }: DrawContext, event: GameEvent): number => {
  const crisis = isCrisisEvent(event) ? difficulty.crisisWeightMultiplier * (respite ? CRISIS_RESPITE.weightMultiplier : 1) : 1;
  const scandal = event.category === 'political-scandal' ? state.modifiers.scandalWeightMultiplier : 1;
  const novelty = state.eventHistory[event.id] === undefined ? 1 : SEEN_EVENT_WEIGHT;
  return EVENT_FREQUENCY_WEIGHTS[event.frequency] * crisis * scandal * novelty;
};

/** Produto dos multiplicadores dos gatilhos satisfeitos, com teto (null se nenhum gatilho vale). */
const triggerMultiplier = (state: SimulationState, event: GameEvent): number | null => {
  const satisfied = (event.triggers ?? []).filter((trigger) => evaluateCondition(state, trigger.condition));
  if (satisfied.length === 0) return null;
  return Math.min(MAX_TRIGGER_MULTIPLIER, satisfied.reduce((acc, trigger) => acc * trigger.multiplier, 1));
};

/**
 * Peso condicional: base × gatilhos satisfeitos (1 se nenhum). Indicadores ruins
 * inclinam o sorteio para as crises ligadas a eles, sem excluir o resto do noticiário
 * (antes, só entravam eventos com gatilho — e com o país mal, só sobravam crises).
 */
const conditionalWeight = (ctx: DrawContext, event: GameEvent): number => baseWeight(ctx, event) * (triggerMultiplier(ctx.state, event) ?? 1);

/**
 * Propostas reservadas (categoria "corruption") têm canal próprio: a cada mês,
 * com chance CORRUPTION_OFFER_CHANCE, uma delas chega no lugar do evento sorteado.
 */
const drawOffer = (rng: Rng, ctx: DrawContext, offers: readonly GameEvent[]): GameEvent | null => {
  if (offers.length === 0 || ctx.state.turn < CORRUPTION_OFFER_MIN_TURN || rng.next() >= CORRUPTION_OFFER_CHANCE) return null;
  return pickWeighted(rng, offers.map((event) => ({ item: event, weight: conditionalWeight(ctx, event) })));
};

const drawEvent = (rng: Rng, ctx: DrawContext, eligible: readonly GameEvent[]): GameEvent | null => {
  const offer = drawOffer(rng, ctx, eligible.filter((event) => event.category === 'corruption'));
  if (offer) return offer;
  const regular = eligible.filter((event) => event.category !== 'corruption');
  const weightOf = rng.next() < RANDOM_EVENT_SHARE ? baseWeight : conditionalWeight;
  return pickWeighted(rng, regular.map((event) => ({ item: event, weight: weightOf(ctx, event) })));
};

export const selectEvent = (state: SimulationState, events: readonly GameEvent[], difficulty: DifficultyConfig): EventSelection => {
  const scheduled = events.find((event) => isScheduledNow(state, event) && state.eventHistory[event.id] === undefined);
  if (scheduled) return { state, eventId: scheduled.id };
  const eligible = getEligibleEvents(state, events);
  // Desdobramentos obrigatórios (ex.: esquema que veio à tona) saem antes do sorteio.
  const urgent = eligible.find((event) => event.priority);
  if (urgent) return { state, eventId: urgent.id };
  const ctx: DrawContext = { state, difficulty, respite: inCrisisRespite(state, events) };
  const { result, seed } = withStateRng(state, (rng) => drawEvent(rng, ctx, eligible));
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
  const isCrisis = isCrisisEvent(event);
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
