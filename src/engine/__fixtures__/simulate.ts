/**
 * Helpers de teste: roda uma partida completa com escolhas aleatórias
 * (semeadas) e verifica invariantes numéricos do estado.
 */
import { METRIC_BOUNDS, METRIC_KEYS } from '@/constants/metrics';
import { SECTOR_KEYS } from '@/constants/sectors';
import type { DecisionChoice, GameContent, Rng, SimulationState, TurnEventChoice, TurnOutcome } from '@/types';
import { createRng, randomInt } from '../random';
import { advanceTurn, drawEvent, prepareTurn, processTurn } from '../turn';

export interface TurnTrace {
  turn: number;
  decisionIds: string[];
  eventId: string | null;
  outcome: TurnOutcome;
}

export interface SimulationRun {
  final: SimulationState;
  outcome: TurnOutcome;
  /** Estado ao fim de cada turno processado. */
  states: SimulationState[];
  turns: TurnTrace[];
}

const NEGOTIATION_SHARE = 0.3;
/** Trava de segurança: nenhuma partida de teste passa disso. */
const MAX_TEST_TURNS = 200;

const pickIndex = (rng: Rng, length: number): number => randomInt(rng, 0, length - 1);

const chooseDecisions = (decisionIds: readonly string[], content: GameContent, rng: Rng): DecisionChoice[] =>
  decisionIds.flatMap((decisionId) => {
    const decision = content.decisions.find((entry) => entry.id === decisionId);
    if (!decision) return [];
    const option = decision.options[pickIndex(rng, decision.options.length)];
    const negotiate = option.legislative !== undefined && rng.next() < NEGOTIATION_SHARE;
    return [{ decisionId, optionId: option.id, negotiate }];
  });

const chooseEvent = (eventId: string | null, content: GameContent, rng: Rng): TurnEventChoice | null => {
  const event = eventId ? content.events.find((entry) => entry.id === eventId) : undefined;
  if (!event) return null;
  return { eventId: event.id, optionId: event.options[pickIndex(rng, event.options.length)].id };
};

/**
 * Joga o mandato inteiro: sorteia decisões e evento, escolhe opções ao acaso
 * (RNG próprio, separado da semente do jogo) e processa até o desfecho.
 */
export const runRandomGame = (initial: SimulationState, content: GameContent, choiceSeed: number): SimulationRun => {
  const choiceRng = createRng(choiceSeed);
  const states: SimulationState[] = [];
  const turns: TurnTrace[] = [];
  let state = initial;
  for (let i = 0; i < MAX_TEST_TURNS; i += 1) {
    const prepared = prepareTurn(state, content);
    const drawn = drawEvent(prepared.state, content);
    const decisions = chooseDecisions(prepared.decisionIds, content, choiceRng);
    const event = chooseEvent(drawn.eventId, content, choiceRng);
    const result = processTurn({ state: drawn.state, decisions, event, content });
    states.push(result.state);
    turns.push({ turn: result.state.turn, decisionIds: prepared.decisionIds, eventId: drawn.eventId, outcome: result.report.outcome });
    if (result.report.outcome !== 'continue') return { final: result.state, outcome: result.report.outcome, states, turns };
    state = advanceTurn(result.state);
  }
  throw new Error(`Partida não terminou em ${MAX_TEST_TURNS} turnos`);
};

/** Caminhos (ex.: "metrics.inflation") de todo número não finito encontrado no valor. */
export const findNonFiniteNumbers = (value: unknown, path = 'state'): string[] => {
  if (typeof value === 'number') return Number.isFinite(value) ? [] : [path];
  if (Array.isArray(value)) return value.flatMap((entry, index) => findNonFiniteNumbers(entry, `${path}[${index}]`));
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, entry]) => findNonFiniteNumbers(entry, `${path}.${key}`));
  }
  return [];
};

const SCORE_MIN = 0;
const SCORE_MAX = 100;

/** Descrição de cada valor fora dos limites (métricas, setores, aprovação, base, relações). */
export const findOutOfBounds = (state: SimulationState): string[] => {
  const metrics = METRIC_KEYS.filter((key) => {
    const { min, max } = METRIC_BOUNDS[key];
    return state.metrics[key] < min || state.metrics[key] > max;
  }).map((key) => `metrics.${key}=${state.metrics[key]}`);
  const sectors = SECTOR_KEYS.filter((key) => state.sectors[key] < SCORE_MIN || state.sectors[key] > SCORE_MAX).map(
    (key) => `sectors.${key}=${state.sectors[key]}`,
  );
  const relations = Object.entries(state.relations)
    .filter(([, value]) => value < SCORE_MIN || value > SCORE_MAX)
    .map(([key, value]) => `relations.${key}=${value}`);
  const scalars: Array<[string, number]> = [
    ['approval', state.approval],
    ['congress.support', state.congress.support],
  ];
  const outOfRange = scalars.filter(([, value]) => value < SCORE_MIN || value > SCORE_MAX).map(([key, value]) => `${key}=${value}`);
  return [...metrics, ...sectors, ...relations, ...outOfRange];
};
