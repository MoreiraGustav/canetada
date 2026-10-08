/**
 * Alinhamento das escolhas com o que o jogador quer governar (metas do
 * mandato e promessas pendentes), pronto para dicas e selos da UI.
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getChoiceAlignment } from '@/engine';
import type { AlignmentTag, ChoiceAlignmentView, ChoiceEffects, GoalProgress, ImpactKey, PlayerPromise } from '@/types';
import { getGoalDefinition, getGoalDefinitions } from './content';
import { usePlayerStore } from './usePlayerStore';

const PROMISE_ICON = '📜';

export interface AlignmentContext {
  /** Métricas das metas escolhidas (destacadas nas dicas de impacto). */
  goalKeys: ImpactKey[];
  describe: (effects: ChoiceEffects) => ChoiceAlignmentView;
}

const goalTag = (goalId: string): AlignmentTag[] => {
  const definition = getGoalDefinition(goalId);
  return definition ? [{ id: definition.id, label: definition.title, icon: definition.icon }] : [];
};

const promiseTag =
  (promises: readonly PlayerPromise[]) =>
  (promiseId: string): AlignmentTag[] => {
    const promise = promises.find((entry) => entry.id === promiseId);
    return promise ? [{ id: promise.id, label: promise.text, icon: PROMISE_ICON }] : [];
  };

/** Função pura usada pelos selectors: alinhamento → selos com título e ícone. */
export const buildAlignmentContext = (goals: readonly GoalProgress[], promises: readonly PlayerPromise[]): AlignmentContext => {
  const toPromiseTag = promiseTag(promises);
  return {
    goalKeys: goals.flatMap((progress) => getGoalDefinition(progress.goalId)?.metric ?? []),
    describe: (effects) => {
      const alignment = getChoiceAlignment({ goals, promises }, getGoalDefinitions(), effects);
      return {
        helps: alignment.helpsGoals.flatMap(goalTag),
        hurts: alignment.hurtsGoals.flatMap(goalTag),
        promisesHelped: alignment.helpsPromises.flatMap(toPromiseTag),
        promisesHurt: alignment.hurtsPromises.flatMap(toPromiseTag),
      };
    },
  };
};

/** Contexto de alinhamento do jogador atual (memoizado por metas e promessas). */
export const useAlignmentContext = (): AlignmentContext => {
  const { goals, promises } = usePlayerStore(useShallow((state) => ({ goals: state.goals, promises: state.promises })));
  return useMemo(() => buildAlignmentContext(goals, promises), [goals, promises]);
};
