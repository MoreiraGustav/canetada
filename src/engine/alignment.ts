/**
 * Alinhamento de uma escolha (opção de decisão/evento, programa ou ação da
 * agenda) com o que o jogador quer governar: as metas do mandato e as
 * promessas de campanha ainda pendentes.
 */
import type { ChoiceAlignment, ChoiceEffects, Comparator, Condition, GoalDefinition, GoalProgress, Impact, ImpactKey, PlayerPromise } from '@/types';
import { indexById } from '@/utils/math';

/** Variações menores que isso são ruído de arredondamento. */
const EPSILON = 1e-9;

/** Sentido em que a condição fica mais perto de ser verdadeira (+1 sobe, −1 cai). */
const COMPARATOR_SIGN: Record<Comparator, 1 | -1> = { gt: 1, gte: 1, lt: -1, lte: -1 };

const sumDelayed = (effects: ChoiceEffects, read: (impact: Impact) => number | undefined): number =>
  (effects.delayed ?? []).reduce((total, entry) => total + (read(entry.impact) ?? 0), read(effects.impact) ?? 0);

/** Variação total (imediata + graduais) de uma chave plana do impacto. */
export const totalImpactDelta = (effects: ChoiceEffects, key: ImpactKey): number => sumDelayed(effects, (impact) => impact[key]);

const signOf = (value: number): -1 | 0 | 1 => (Math.abs(value) < EPSILON ? 0 : value > 0 ? 1 : -1);

/** +1 se a escolha aproxima a condição de ser verdadeira, −1 se afasta, 0 se não mexe nela. */
const conditionPull = (condition: Condition, effects: ChoiceEffects): -1 | 0 | 1 => {
  if (condition.kind === 'flag') {
    if (!(effects.flags ?? []).includes(condition.flag)) return 0;
    return condition.present ? 1 : -1;
  }
  if (condition.kind === 'turn' || condition.kind === 'term') return 0;
  const delta =
    condition.kind === 'indicator'
      ? totalImpactDelta(effects, condition.indicator)
      : condition.kind === 'sector'
        ? sumDelayed(effects, (impact) => impact.sectors?.[condition.sector])
        : sumDelayed(effects, (impact) => impact.relations?.[condition.country]);
  return signOf(delta * COMPARATOR_SIGN[condition.comparator]) as -1 | 0 | 1;
};

/** +1 se a escolha move a métrica da meta no sentido do alvo, −1 se no sentido oposto. */
const goalPull = (goal: GoalDefinition, effects: ChoiceEffects): -1 | 0 | 1 =>
  signOf(totalImpactDelta(effects, goal.metric) * (goal.direction === 'increase' ? 1 : -1));

/** Metas e promessas pendentes que a escolha ajuda ou atrapalha. */
export const getChoiceAlignment = (
  state: { goals: readonly GoalProgress[]; promises: readonly PlayerPromise[] },
  goalDefinitions: readonly GoalDefinition[],
  effects: ChoiceEffects,
): ChoiceAlignment => {
  const byId = indexById(goalDefinitions);
  const goals = state.goals.flatMap((progress) => {
    const definition = byId[progress.goalId];
    return definition ? [{ id: definition.id, pull: goalPull(definition, effects) }] : [];
  });
  const promises = state.promises
    .filter((promise) => promise.status !== 'fulfilled')
    .map((promise) => {
      const pulls = promise.conditions.map((condition) => conditionPull(condition, effects));
      return { id: promise.id, pull: pulls.includes(-1) ? -1 : pulls.includes(1) ? 1 : 0 };
    });
  return {
    helpsGoals: goals.filter((goal) => goal.pull > 0).map((goal) => goal.id),
    hurtsGoals: goals.filter((goal) => goal.pull < 0).map((goal) => goal.id),
    helpsPromises: promises.filter((promise) => promise.pull > 0).map((promise) => promise.id),
    hurtsPromises: promises.filter((promise) => promise.pull < 0).map((promise) => promise.id),
  };
};

/** A escolha ajuda alguma meta ou promessa pendente. */
export const isAlignedChoice = (alignment: ChoiceAlignment): boolean =>
  alignment.helpsGoals.length > 0 || alignment.helpsPromises.length > 0;
