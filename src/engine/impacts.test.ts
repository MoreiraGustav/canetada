import { describe, expect, it } from 'vitest';
import { DEBT_IMPACT_SCALE } from '@/constants/balance';
import { METRIC_BOUNDS } from '@/constants/metrics';
import { SECTOR_INFO, SECTOR_KEYS } from '@/constants/sectors';
import type { ImpactScaling, SimulationState } from '@/types';
import { createFixtureState, withApproval, withSupport } from './__fixtures__/content';
import { calculateApproval } from './approval';
import { applyActiveEffects, applyImpact, scaleImpact, scheduleDelayedImpacts } from './impacts';

/** Setores em 40 (abaixo do início da saturação): ganhos aplicados integralmente. */
const base = (): SimulationState => withSupport(withApproval(createFixtureState(), 40), 50);
const SCALING: ImpactScaling = { positive: 2, negative: 0.5 };

describe('applyImpact', () => {
  it('soma deltas às métricas sem mutar o estado original', () => {
    const state = base();
    const snapshot = JSON.stringify(state);
    const next = applyImpact(state, { inflation: 0.5, debt: -1 });
    expect(next.metrics.inflation).toBeCloseTo(state.metrics.inflation + 0.5);
    // Impactos pontuais na dívida são amortecidos por DEBT_IMPACT_SCALE.
    expect(next.metrics.debt).toBeCloseTo(state.metrics.debt - DEBT_IMPACT_SCALE);
    expect(JSON.stringify(state)).toBe(snapshot);
  });

  it('faz clamp das métricas por METRIC_BOUNDS', () => {
    const next = applyImpact(base(), { inflation: 1000, debt: -1000, deforestation: -1e6 });
    expect(next.metrics.inflation).toBe(METRIC_BOUNDS.inflation.max);
    expect(next.metrics.debt).toBe(METRIC_BOUNDS.debt.min);
    expect(next.metrics.deforestation).toBe(METRIC_BOUNDS.deforestation.min);
  });

  it('limita setores, relações e base aliada a 0–100', () => {
    const up = applyImpact(base(), { sectors: { market: 500 }, relations: { eua: 500 }, congressSupport: 500 });
    expect(up.sectors.market).toBe(100);
    expect(up.relations.eua).toBe(100);
    expect(up.congress.support).toBe(100);
    const down = applyImpact(base(), { approval: -500, relations: { china: -500 }, congressSupport: -500 });
    SECTOR_KEYS.forEach((key) => expect(down.sectors[key]).toBe(0));
    expect(down.approval).toBe(0);
    expect(down.relations.china).toBe(0);
    expect(down.congress.support).toBe(0);
  });

  it('aplica `approval` como delta uniforme em todos os setores', () => {
    const next = applyImpact(base(), { approval: 3 });
    SECTOR_KEYS.forEach((key) => expect(next.sectors[key]).toBeCloseTo(43));
    expect(next.approval).toBeCloseTo(43);
  });

  it('recalcula a aprovação como média ponderada dos setores', () => {
    const next = applyImpact(base(), { sectors: { lowerClass: 10, market: -20 } });
    const manual = SECTOR_KEYS.reduce((acc, key) => acc + next.sectors[key] * SECTOR_INFO[key].weight, 0);
    expect(next.approval).toBeCloseTo(manual);
    expect(next.approval).toBeCloseTo(calculateApproval(next.sectors));
    // 40 + 10 × 0,30 − 20 × 0,10 = 41
    expect(next.approval).toBeCloseTo(41);
  });

  it('aplica retornos decrescentes a ganhos de setores já bem avaliados (perdas integrais)', () => {
    const high = withApproval(createFixtureState(), 65);
    // fator = 1 − (65 − 45) / 40 = 0,5
    expect(applyImpact(high, { approval: 4 }).sectors.market).toBeCloseTo(67);
    expect(applyImpact(high, { approval: -4 }).sectors.market).toBeCloseTo(61);
    const saturated = withApproval(createFixtureState(), 95);
    expect(applyImpact(saturated, { approval: 10 }).sectors.market).toBeCloseTo(96);
  });

  describe('ImpactScaling por polaridade', () => {
    it('inflação +1 é prejudicial e recebe o multiplicador negativo', () => {
      const state = base();
      expect(applyImpact(state, { inflation: 1 }, SCALING).metrics.inflation).toBeCloseTo(state.metrics.inflation + 0.5);
      expect(applyImpact(state, { inflation: -1 }, SCALING).metrics.inflation).toBeCloseTo(state.metrics.inflation - 2);
    });

    it('crescimento +1 é benéfico e recebe o multiplicador positivo', () => {
      const state = base();
      expect(applyImpact(state, { gdpGrowth: 1 }, SCALING).metrics.gdpGrowth).toBeCloseTo(state.metrics.gdpGrowth + 2);
      expect(applyImpact(state, { gdpGrowth: -1 }, SCALING).metrics.gdpGrowth).toBeCloseTo(state.metrics.gdpGrowth - 0.5);
    });

    it('Selic (polaridade 0) nunca é escalada', () => {
      const state = base();
      expect(applyImpact(state, { selic: 1 }, SCALING).metrics.selic).toBeCloseTo(state.metrics.selic + 1);
      expect(applyImpact(state, { selic: -1 }, SCALING).metrics.selic).toBeCloseTo(state.metrics.selic - 1);
    });

    it('setores, relações, aprovação e base: positivo = benéfico', () => {
      const next = applyImpact(base(), { sectors: { market: 4, military: -4 }, relations: { eua: 2, china: -2 }, congressSupport: -2, approval: 1 }, SCALING);
      expect(next.sectors.market).toBeCloseTo(40 + 8 + 2);
      expect(next.sectors.military).toBeCloseTo(40 - 2 + 2);
      expect(next.relations.eua).toBeCloseTo(base().relations.eua + 4);
      expect(next.relations.china).toBeCloseTo(base().relations.china - 1);
      expect(next.congress.support).toBeCloseTo(49);
    });
  });
});

describe('scaleImpact', () => {
  it('multiplica todos os deltas, inclusive setores e relações', () => {
    expect(scaleImpact({ debt: 2, sectors: { market: 4 }, relations: { eua: -6 } }, 0.5)).toEqual({
      debt: 1,
      sectors: { market: 2 },
      relations: { eua: -3 },
    });
  });
});

describe('scheduleDelayedImpacts + applyActiveEffects', () => {
  it('não altera o estado sem efeitos graduais', () => {
    const state = base();
    expect(scheduleDelayedImpacts(state, 'x', 'X', undefined)).toBe(state);
    expect(scheduleDelayedImpacts(state, 'x', 'X', [])).toBe(state);
  });

  it('cria efeitos com perTurn = total/duração começando em turno + 1 + delay', () => {
    const state: SimulationState = { ...base(), turn: 5 };
    const next = scheduleDelayedImpacts(state, 'obra', 'Obra', [
      { impact: { debt: 3 }, delay: 2, duration: 3 },
      { impact: { infrastructureKm: 400 }, delay: 0, duration: 4, label: 'Rodovia' },
    ]);
    expect(next.activeEffects).toHaveLength(2);
    const [first, second] = next.activeEffects;
    expect(first).toMatchObject({ sourceId: 'obra', label: 'Obra', startTurn: 8, endTurn: 10 });
    expect(first.perTurn.debt).toBeCloseTo(1);
    expect(second).toMatchObject({ label: 'Rodovia', startTurn: 6, endTurn: 9 });
    expect(second.perTurn.infrastructureKm).toBeCloseTo(100);
  });

  it('aplica cada parcela só entre startTurn e endTurn e remove o efeito depois', () => {
    let state = scheduleDelayedImpacts({ ...base(), turn: 5 }, 'obra', 'Obra', [{ impact: { unemployment: 3 }, delay: 2, duration: 3 }]);
    const debtAtStart = state.metrics.unemployment;
    const debtByTurn: Record<number, number> = {};
    const effectsByTurn: Record<number, number> = {};
    for (let turn = 6; turn <= 12; turn += 1) {
      state = applyActiveEffects({ ...state, turn });
      debtByTurn[turn] = state.metrics.unemployment - debtAtStart;
      effectsByTurn[turn] = state.activeEffects.length;
    }
    expect(debtByTurn[6]).toBeCloseTo(0);
    expect(debtByTurn[7]).toBeCloseTo(0);
    expect(debtByTurn[8]).toBeCloseTo(1);
    expect(debtByTurn[9]).toBeCloseTo(2);
    expect(debtByTurn[10]).toBeCloseTo(3);
    expect(debtByTurn[12]).toBeCloseTo(3);
    // Mantido enquanto pendente/vigente; removido após aplicar a última parcela.
    expect(effectsByTurn[7]).toBe(1);
    expect(effectsByTurn[9]).toBe(1);
    expect(effectsByTurn[10]).toBe(0);
  });
});
