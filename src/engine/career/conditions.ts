/** Condições do conteúdo da carreira (ações, programas e eventos). */
import type { CareerCondition, CareerContent, CareerState, Comparator } from '@/types';
import { getElectionAt } from '@/utils/careerCalendar';
import { ageAt, currentOffice, getCareerLevel, getCareerRole, getCharacter, getGovernmentRelation } from './helpers';

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

type ConditionOf<K extends CareerCondition['kind']> = Extract<CareerCondition, { kind: K }>;
type Evaluator<K extends CareerCondition['kind']> = (state: CareerState, content: CareerContent, condition: ConditionOf<K>) => boolean;

const flagActive = (state: CareerState, condition: ConditionOf<'flag'>): boolean => {
  const setAt = state.flags[condition.flag];
  if (setAt === undefined) return false;
  return condition.withinTurns === undefined || state.turn - setAt <= condition.withinTurns;
};

const adminValue = (state: CareerState, indicator: ConditionOf<'admin'>['indicator']): number | null => {
  if (!state.administration) return null;
  return indicator === 'approval' ? state.administration.approval : state.administration.indicators[indicator];
};

const EVALUATORS: { [K in CareerCondition['kind']]: Evaluator<K> } = {
  metric: (state, _content, condition) => compare(state.metrics[condition.metric], condition.comparator, condition.value),
  role: (state, content, condition) => condition.roles.includes(getCareerRole(state, content)),
  office: (state, content, condition) => {
    const office = currentOffice(state, content);
    return office !== undefined && condition.offices.includes(office.id);
  },
  appointment: (state, _content, condition) => state.position?.kind === 'appointment' && condition.appointments.includes(state.position.id),
  level: (state, content, condition) => getCareerLevel(state, content) === condition.level,
  flag: (state, _content, condition) => flagActive(state, condition) === condition.present,
  profession: (state, _content, condition) => condition.professions.includes(state.profile.professionId),
  age: (state, _content, condition) => compare(ageAt(state), condition.comparator, condition.value),
  'election-semester': (state, _content, condition) => {
    const cycle = getElectionAt(state.turn);
    const matches = cycle !== null && (condition.cycle === undefined || condition.cycle === cycle);
    return matches === condition.present;
  },
  government: (state, content, condition) => condition.relation.includes(getGovernmentRelation(state, content, condition.level)),
  admin: (state, _content, condition) => {
    const value = adminValue(state, condition.indicator);
    return value !== null && compare(value, condition.comparator, condition.value);
  },
  filiado: (state, _content, condition) => (state.partyId !== null) === condition.present,
  relation: (state, _content, condition) => {
    const character = getCharacter(state, condition.role);
    return character !== undefined && compare(character.relation, condition.comparator, condition.value);
  },
  character: (state, _content, condition) => {
    const character = getCharacter(state, condition.role);
    const matches = character !== undefined && (condition.inOffice === undefined || (character.officeId !== null) === condition.inOffice);
    return matches === condition.present;
  },
  any: (state, content, condition) => condition.conditions.some((entry) => evaluateCareerCondition(state, content, entry)),
};

export const evaluateCareerCondition = (state: CareerState, content: CareerContent, condition: CareerCondition): boolean =>
  (EVALUATORS[condition.kind] as Evaluator<typeof condition.kind>)(state, content, condition);

/** Todas as condições (vazio/undefined = verdadeiro). */
export const evaluateCareerConditions = (
  state: CareerState,
  content: CareerContent,
  conditions: readonly CareerCondition[] | undefined,
): boolean => (conditions ?? []).every((condition) => evaluateCareerCondition(state, content, condition));
