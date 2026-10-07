import { PROMISE_REMINDER_INTERVAL } from '@/constants/balance';
import type { NewsItem, PlayerPromise, PromiseDefinition, SimulationState, StateWithNews } from '@/types';
import { evaluateConditions } from './conditions';
import { applyImpact } from './impacts';
import { createNewsItem } from './news';
import { scalePromise } from './promiseScaling';
import type { PromiseScaling } from './promiseScaling';

/**
 * Promessas de campanha viram metas implícitas com prazo = início + fração × duração do mandato.
 * Com `scaling`, os alvos numéricos também acompanham a duração do modo.
 */
export const createPromises = (
  definitions: readonly PromiseDefinition[],
  termStartTurn: number,
  termLength: number,
  scaling?: PromiseScaling,
): PlayerPromise[] =>
  definitions.map((definition) => ({
    id: definition.id,
    ...scalePromise(definition.text, definition.conditions, scaling),
    deadlineTurn: termStartTurn + Math.max(1, Math.round(definition.deadlineFraction * termLength)) - 1,
    overduePenalty: definition.overduePenalty,
    fulfillmentBonus: definition.fulfillmentBonus,
    status: 'pending',
    resolvedTurn: null,
  }));

const fulfill = (state: SimulationState, promise: PlayerPromise): StateWithNews => {
  const next = applyImpact(state, promise.fulfillmentBonus);
  const news = createNewsItem(state.turn, `Governo cumpre promessa de campanha: ${promise.text.toLowerCase()}`, 'positive', 'promise', `promise:${promise.id}`);
  return { state: updatePromise(next, { ...promise, status: 'fulfilled', resolvedTurn: state.turn }), news: [news] };
};

const updatePromise = (state: SimulationState, promise: PlayerPromise): SimulationState => ({
  ...state,
  promises: state.promises.map((entry) => (entry.id === promise.id ? promise : entry)),
});

/** Vencida: penalidade a cada turno; manchete ao vencer e lembretes esparsos. */
const chargeOverdue = (state: SimulationState, promise: PlayerPromise): StateWithNews => {
  const penalized = applyImpact(state, promise.overduePenalty);
  const turnsLate = state.turn - promise.deadlineTurn;
  const justExpired = promise.status === 'pending';
  const next = justExpired ? updatePromise(penalized, { ...promise, status: 'overdue' }) : penalized;
  if (!justExpired && turnsLate % PROMISE_REMINDER_INTERVAL !== 0) return { state: next, news: [] };
  const headline = justExpired
    ? `Cadê a promessa de campanha? Prazo para "${promise.text}" vence sem entrega`
    : `Oposição cobra promessa não cumprida: "${promise.text}"`;
  return { state: next, news: [createNewsItem(state.turn, headline, 'negative', 'promise', `promise:${promise.id}`)] };
};

/** Cumpre promessas cujas condições são verdadeiras e penaliza as vencidas. */
export const stepPromises = (state: SimulationState): { state: SimulationState; news: NewsItem[] } =>
  state.promises.reduce<StateWithNews>(
    (acc, promise) => {
      if (promise.status === 'fulfilled') return acc;
      if (evaluateConditions(acc.state, promise.conditions)) {
        const result = fulfill(acc.state, promise);
        return { state: result.state, news: [...acc.news, ...result.news] };
      }
      if (acc.state.turn <= promise.deadlineTurn) return acc;
      const result = chargeOverdue(acc.state, promise);
      return { state: result.state, news: [...acc.news, ...result.news] };
    },
    { state, news: [] },
  );
