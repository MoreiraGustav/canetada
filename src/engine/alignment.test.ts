import { describe, expect, it } from 'vitest';
import type { ChoiceEffects, PlayerPromise } from '@/types';
import { createFixtureState, FIXTURE_CONTENT } from './__fixtures__/content';
import { getChoiceAlignment, isAlignedChoice, totalImpactDelta } from './alignment';

const GOALS = FIXTURE_CONTENT.goals;
const state = createFixtureState({ goalIds: ['fx-meta-desemprego', 'fx-meta-ideb'] });
const noPromises = { goals: state.goals, promises: [] };

const promise = (overrides: Partial<PlayerPromise>): PlayerPromise => ({
  id: 'fx-promessa',
  text: 'Promessa de teste',
  conditions: [],
  deadlineTurn: 24,
  overduePenalty: {},
  fulfillmentBonus: {},
  status: 'pending',
  resolvedTurn: null,
  ...overrides,
});

describe('totalImpactDelta', () => {
  it('soma o impacto imediato e os graduais', () => {
    const effects: ChoiceEffects = { impact: { ideb: 0.1 }, delayed: [{ impact: { ideb: 0.2 }, delay: 0, duration: 2 }] };
    expect(totalImpactDelta(effects, 'ideb')).toBeCloseTo(0.3);
    expect(totalImpactDelta(effects, 'gini')).toBe(0);
  });
});

describe('getChoiceAlignment — metas', () => {
  it('ajuda a meta quando move a métrica no sentido do alvo (inclusive por efeito gradual)', () => {
    const effects: ChoiceEffects = { impact: {}, delayed: [{ impact: { unemployment: -0.3, ideb: 0.1 }, delay: 1, duration: 4 }] };
    const alignment = getChoiceAlignment(noPromises, GOALS, effects);
    expect(alignment.helpsGoals).toEqual(['fx-meta-desemprego', 'fx-meta-ideb']);
    expect(alignment.hurtsGoals).toEqual([]);
    expect(isAlignedChoice(alignment)).toBe(true);
  });

  it('atrapalha a meta quando move a métrica no sentido oposto', () => {
    const alignment = getChoiceAlignment(noPromises, GOALS, { impact: { unemployment: 0.2 } });
    expect(alignment.hurtsGoals).toEqual(['fx-meta-desemprego']);
    expect(isAlignedChoice(alignment)).toBe(false);
  });

  it('ignora métricas de metas que o jogador não escolheu', () => {
    expect(getChoiceAlignment(noPromises, GOALS, { impact: { gini: -0.01 } }).helpsGoals).toEqual([]);
  });
});

describe('getChoiceAlignment — promessas', () => {
  it('ajuda a cumprir promessa de flag quando a escolha define a flag', () => {
    const promises = [promise({ conditions: [{ kind: 'flag', flag: 'reforma-feita', present: true }] })];
    const alignment = getChoiceAlignment({ goals: [], promises }, GOALS, { impact: {}, flags: ['reforma-feita'] });
    expect(alignment.helpsPromises).toEqual(['fx-promessa']);
  });

  it('contraria promessa que exige a ausência da flag', () => {
    const promises = [promise({ conditions: [{ kind: 'flag', flag: 'negociacao-recente', present: false }] })];
    const alignment = getChoiceAlignment({ goals: [], promises }, GOALS, { impact: {}, flags: ['negociacao-recente'] });
    expect(alignment.hurtsPromises).toEqual(['fx-promessa']);
  });

  it('lê o sentido do comparador em promessas de indicador e relação', () => {
    const promises = [
      promise({ id: 'inflacao', conditions: [{ kind: 'indicator', indicator: 'inflation', comparator: 'lte', value: 4 }] }),
      promise({ id: 'china', conditions: [{ kind: 'relation', country: 'china', comparator: 'gte', value: 70 }] }),
    ];
    const alignment = getChoiceAlignment({ goals: [], promises }, GOALS, { impact: { inflation: -0.2, relations: { china: -3 } } });
    expect(alignment.helpsPromises).toEqual(['inflacao']);
    expect(alignment.hurtsPromises).toEqual(['china']);
  });

  it('ignora promessas já cumpridas', () => {
    const promises = [promise({ status: 'fulfilled', conditions: [{ kind: 'flag', flag: 'reforma-feita', present: true }] })];
    expect(getChoiceAlignment({ goals: [], promises }, GOALS, { impact: {}, flags: ['reforma-feita'] }).helpsPromises).toEqual([]);
  });
});
