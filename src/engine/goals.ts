import { GAME_MODES } from '@/constants/game';
import type { GameMetrics, GameMode, GoalDefinition, GoalProgress } from '@/types';
import { clamp, indexById } from '@/utils/math';

const FULL_PROGRESS = 100;

/**
 * Alvo efetivo: a variação exigida (até o alvo absoluto, % relativo ou delta)
 * é escalada pelo modo de jogo. Se o baseline já supera um alvo absoluto, vale o alvo.
 */
const computeTargetValue = (definition: GoalDefinition, baseline: number, scale: number): number => {
  const sign = definition.direction === 'increase' ? 1 : -1;
  switch (definition.targetType) {
    case 'absolute': {
      const alreadyThere = (definition.target - baseline) * sign <= 0;
      return alreadyThere ? definition.target : baseline + (definition.target - baseline) * scale;
    }
    case 'relative':
      return baseline + sign * baseline * (definition.target / 100) * scale;
    case 'delta':
      return baseline + sign * definition.target * scale;
  }
};

const evaluate = (goal: GoalProgress, definition: GoalDefinition, current: number): GoalProgress => {
  const sign = definition.direction === 'increase' ? 1 : -1;
  const achieved = (current - goal.targetValue) * sign >= 0;
  const span = goal.targetValue - goal.baseline;
  const progress = achieved ? FULL_PROGRESS : span === 0 ? 0 : clamp(((current - goal.baseline) / span) * FULL_PROGRESS, 0, FULL_PROGRESS);
  return { ...goal, progress, achieved };
};

export const createGoalProgress = (
  goalIds: readonly string[],
  definitions: readonly GoalDefinition[],
  metrics: GameMetrics,
  mode: GameMode,
): GoalProgress[] => {
  const byId = indexById(definitions);
  const scale = GAME_MODES[mode].goalScale;
  return goalIds.flatMap((goalId) => {
    const definition = byId[goalId];
    if (!definition) return [];
    const baseline = metrics[definition.metric];
    const goal: GoalProgress = { goalId, baseline, targetValue: computeTargetValue(definition, baseline, scale), progress: 0, achieved: false };
    return [evaluate(goal, definition, baseline)];
  });
};

export const updateGoalProgress = (
  goals: readonly GoalProgress[],
  definitions: readonly GoalDefinition[],
  metrics: GameMetrics,
): GoalProgress[] => {
  const byId = indexById(definitions);
  return goals.map((goal) => {
    const definition = byId[goal.goalId];
    return definition ? evaluate(goal, definition, metrics[definition.metric]) : goal;
  });
};
