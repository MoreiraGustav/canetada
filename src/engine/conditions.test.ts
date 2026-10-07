import { describe, expect, it } from 'vitest';
import type { Condition, SimulationState } from '@/types';
import { createFixtureState, withApproval, withSupport } from './__fixtures__/content';
import { evaluateCondition, evaluateConditions, getIndicatorValue } from './conditions';

const base = (): SimulationState => withSupport(withApproval(createFixtureState(), 40), 55);

describe('getIndicatorValue', () => {
  it('lê aprovação, base aliada e métricas', () => {
    const state = base();
    expect(getIndicatorValue(state, 'approval')).toBe(40);
    expect(getIndicatorValue(state, 'congressSupport')).toBe(55);
    expect(getIndicatorValue(state, 'inflation')).toBe(state.metrics.inflation);
  });
});

describe('evaluateCondition', () => {
  it('avalia indicadores com todos os comparadores', () => {
    const state = base();
    const at = (comparator: 'lt' | 'lte' | 'gt' | 'gte', value: number): boolean =>
      evaluateCondition(state, { kind: 'indicator', indicator: 'approval', comparator, value });
    expect(at('lt', 41)).toBe(true);
    expect(at('lt', 40)).toBe(false);
    expect(at('lte', 40)).toBe(true);
    expect(at('gt', 40)).toBe(false);
    expect(at('gt', 39)).toBe(true);
    expect(at('gte', 40)).toBe(true);
    expect(evaluateCondition(state, { kind: 'indicator', indicator: 'congressSupport', comparator: 'gte', value: 55 })).toBe(true);
  });

  it('avalia setores e relações', () => {
    const state: SimulationState = { ...base(), relations: { ...base().relations, china: 80 } };
    expect(evaluateCondition(state, { kind: 'sector', sector: 'market', comparator: 'gte', value: 40 })).toBe(true);
    expect(evaluateCondition(state, { kind: 'sector', sector: 'market', comparator: 'gt', value: 40 })).toBe(false);
    expect(evaluateCondition(state, { kind: 'relation', country: 'china', comparator: 'gt', value: 75 })).toBe(true);
    expect(evaluateCondition(state, { kind: 'relation', country: 'china', comparator: 'lt', value: 75 })).toBe(false);
  });

  it('avalia o turno absoluto', () => {
    const state: SimulationState = { ...base(), turn: 12 };
    expect(evaluateCondition(state, { kind: 'turn', comparator: 'gte', value: 12 })).toBe(true);
    expect(evaluateCondition(state, { kind: 'turn', comparator: 'lt', value: 12 })).toBe(false);
  });

  describe('flags', () => {
    // Flag "x" definida no turno 5; agora é o turno 8 (há 3 turnos).
    const state: SimulationState = { ...base(), turn: 8, flags: { x: 5 } };
    const flag = (present: boolean, withinTurns?: number, name = 'x'): boolean =>
      evaluateCondition(state, { kind: 'flag', flag: name, present, withinTurns });

    it('present sem janela: basta existir', () => {
      expect(flag(true)).toBe(true);
      expect(flag(true, undefined, 'y')).toBe(false);
    });

    it('present com withinTurns: só conta se definida há no máximo N turnos', () => {
      expect(flag(true, 3)).toBe(true);
      expect(flag(true, 2)).toBe(false);
    });

    it('present:false = ausente OU definida há mais de N turnos', () => {
      expect(flag(false, undefined, 'y')).toBe(true);
      expect(flag(false)).toBe(false);
      expect(flag(false, 2)).toBe(true);
      expect(flag(false, 3)).toBe(false);
      expect(flag(false, 2, 'y')).toBe(true);
    });
  });
});

describe('evaluateConditions', () => {
  it('lista vazia ou ausente é verdadeira', () => {
    expect(evaluateConditions(base(), undefined)).toBe(true);
    expect(evaluateConditions(base(), [])).toBe(true);
  });

  it('exige que todas as condições sejam verdadeiras', () => {
    const yes: Condition = { kind: 'indicator', indicator: 'approval', comparator: 'gte', value: 10 };
    const no: Condition = { kind: 'indicator', indicator: 'approval', comparator: 'gte', value: 90 };
    expect(evaluateConditions(base(), [yes, yes])).toBe(true);
    expect(evaluateConditions(base(), [yes, no])).toBe(false);
  });
});
