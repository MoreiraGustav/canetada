import type { Comparator, Condition, FlagCondition, IndicatorKey, SimulationState } from '@/types';

export const getIndicatorValue = (state: SimulationState, key: IndicatorKey): number => {
  if (key === 'approval') return state.approval;
  if (key === 'congressSupport') return state.congress.support;
  return state.metrics[key];
};

const compare = (value: number, comparator: Comparator, target: number): boolean => {
  switch (comparator) {
    case 'lt':
      return value < target;
    case 'lte':
      return value <= target;
    case 'gt':
      return value > target;
    case 'gte':
      return value >= target;
  }
};

/** Flag ativa: existe e, com `withinTurns`, foi definida há no máximo N turnos. */
export const isFlagActive = (state: SimulationState, flag: string, withinTurns?: number): boolean => {
  const setTurn = state.flags[flag];
  if (setTurn === undefined) return false;
  return withinTurns === undefined || state.turn - setTurn <= withinTurns;
};

/** `present: false` = flag ausente OU definida há mais de `withinTurns` turnos. */
const evaluateFlag = (state: SimulationState, condition: FlagCondition): boolean =>
  isFlagActive(state, condition.flag, condition.withinTurns) === condition.present;

export const evaluateCondition = (state: SimulationState, condition: Condition): boolean => {
  switch (condition.kind) {
    case 'indicator':
      return compare(getIndicatorValue(state, condition.indicator), condition.comparator, condition.value);
    case 'sector':
      return compare(state.sectors[condition.sector], condition.comparator, condition.value);
    case 'relation':
      return compare(state.relations[condition.country], condition.comparator, condition.value);
    case 'flag':
      return evaluateFlag(state, condition);
    case 'turn':
      return compare(state.turn, condition.comparator, condition.value);
    case 'term':
      return compare(state.termNumber, condition.comparator, condition.value);
  }
};

/** Lista vazia ou ausente = verdadeiro. */
export const evaluateConditions = (state: SimulationState, conditions: readonly Condition[] | undefined): boolean =>
  (conditions ?? []).every((condition) => evaluateCondition(state, condition));
