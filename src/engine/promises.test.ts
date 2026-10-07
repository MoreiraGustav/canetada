import { describe, expect, it } from 'vitest';
import type { PromiseDefinition, SimulationState } from '@/types';
import { createFixtureState, PROMISE_ID, PROMISE_INFLATION_TARGET, withApproval } from './__fixtures__/content';
import { createPromises, stepPromises } from './promises';

const DEFINITION: PromiseDefinition = {
  id: 'p-teste',
  text: 'Inflação controlada',
  conditions: [{ kind: 'indicator', indicator: 'inflation', comparator: 'lte', value: 4 }],
  deadlineFraction: 0.5,
  overduePenalty: { approval: -0.5 },
  fulfillmentBonus: { approval: 2 },
};

/** Estado com a promessa da fixture (prazo no turno 24 do modo completo). */
const withInflation = (inflation: number, turn: number): SimulationState => {
  const state = withApproval(createFixtureState(), 40);
  return { ...state, turn, metrics: { ...state.metrics, inflation } };
};

describe('createPromises', () => {
  it('calcula o prazo como início + fração × duração − 1', () => {
    expect(createPromises([DEFINITION], 1, 48)[0]).toMatchObject({ id: 'p-teste', deadlineTurn: 24, status: 'pending', resolvedTurn: null });
    expect(createPromises([{ ...DEFINITION, deadlineFraction: 1 }], 49, 48)[0].deadlineTurn).toBe(96);
    expect(createPromises([{ ...DEFINITION, deadlineFraction: 0 }], 1, 12)[0].deadlineTurn).toBe(1);
  });

  it('escala alvos numéricos pelo modo e anota o alvo ajustado no texto', () => {
    const baseline = withInflation(5, 1);
    const scaling = { baseline, scale: 0.4, countryNames: {} };
    const [scaled] = createPromises([DEFINITION], 1, 12, scaling);
    // 5 + (4 − 5) × 0,4 = 4,6
    expect(scaled.conditions[0]).toMatchObject({ kind: 'indicator', value: 4.6 });
    expect(scaled.text).toContain('meta ajustada ao mandato');
    const [full] = createPromises([DEFINITION], 1, 48, { ...scaling, scale: 1 });
    expect(full.conditions[0]).toMatchObject({ value: 4 });
    expect(full.text).toBe(DEFINITION.text);
  });

  it('não escala promessas já cumpridas na posse nem condições de flag', () => {
    const scaling = { baseline: withInflation(3, 1), scale: 0.4, countryNames: {} };
    const flagDefinition: PromiseDefinition = { ...DEFINITION, conditions: [{ kind: 'flag', flag: 'x', present: true }] };
    const [already, flag] = createPromises([DEFINITION, flagDefinition], 1, 12, scaling);
    expect(already.conditions[0]).toMatchObject({ value: 4 });
    expect(flag.text).toBe(DEFINITION.text);
  });

  it('a promessa da pergunta obrigatória entra no estado inicial', () => {
    const [promise] = createFixtureState().promises;
    expect(promise.id).toBe(PROMISE_ID);
    expect(promise.deadlineTurn).toBe(24);
  });
});

describe('stepPromises', () => {
  it('cumpre quando as condições são verdadeiras e aplica o bônus uma única vez', () => {
    const state = withInflation(PROMISE_INFLATION_TARGET - 1, 5);
    const first = stepPromises(state);
    expect(first.state.promises[0]).toMatchObject({ status: 'fulfilled', resolvedTurn: 5 });
    expect(first.state.approval).toBeCloseTo(42);
    expect(first.news).toHaveLength(1);
    const second = stepPromises({ ...first.state, turn: 6 });
    expect(second.state.approval).toBeCloseTo(42);
    expect(second.news).toHaveLength(0);
    expect(second.state.promises[0].resolvedTurn).toBe(5);
  });

  it('antes do prazo, promessa pendente não penaliza', () => {
    const result = stepPromises(withInflation(8, 24));
    expect(result.state.promises[0].status).toBe('pending');
    expect(result.state.approval).toBeCloseTo(40);
    expect(result.news).toHaveLength(0);
  });

  it('após o prazo aplica a penalidade a cada turno e noticia ao vencer', () => {
    const expired = stepPromises(withInflation(8, 25));
    expect(expired.state.promises[0].status).toBe('overdue');
    expect(expired.state.approval).toBeCloseTo(39.5);
    expect(expired.news).toHaveLength(1);
    expect(expired.news[0].headline).toContain('Cadê a promessa');
    const later = stepPromises({ ...expired.state, turn: 26 });
    expect(later.state.approval).toBeCloseTo(39);
    expect(later.news).toHaveLength(0);
  });

  it('promessa vencida ainda pode ser cumprida depois', () => {
    const expired = stepPromises(withInflation(8, 25)).state;
    const recovered = stepPromises({ ...expired, turn: 30, metrics: { ...expired.metrics, inflation: 3 } });
    expect(recovered.state.promises[0]).toMatchObject({ status: 'fulfilled', resolvedTurn: 30 });
  });
});
