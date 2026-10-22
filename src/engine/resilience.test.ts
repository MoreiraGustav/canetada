/**
 * Amortecedores contra a "bola de neve" negativa: núcleo fiel, trégua entre
 * crises, teto dos gatilhos, gabinete de crise e o termômetro da aprovação.
 */
import { describe, expect, it } from 'vitest';
import { APPROVAL_FLOOR, CRISIS_RESPITE, DIFFICULTY_CONFIGS } from '@/constants/balance';
import type { SimulationState } from '@/types';
import { createFixtureState, FIXTURE_CONTENT, FX_CRISIS_TRIGGER, withApproval } from './__fixtures__/content';
import { explainApproval } from './approvalOutlook';
import { evaluateCondition } from './conditions';
import { selectEvent } from './events';
import { applyImpact } from './impacts';
import { applyPresidentialAction, canTakePresidentialAction, CRISIS_SLOT, isPresidentialActionAvailable } from './presidentialActions';

const NORMAL = DIFFICULTY_CONFIGS.normal;
const [CRISIS_ACTION] = FIXTURE_CONTENT.crisisActions;

const withMetrics = (state: SimulationState, metrics: Partial<SimulationState['metrics']>): SimulationState => ({
  ...state,
  metrics: { ...state.metrics, ...metrics },
});

describe('núcleo fiel: perdas encolhem no fundo do poço', () => {
  it('a mesma perda tira menos de um setor já muito insatisfeito', () => {
    const base = createFixtureState();
    const high = applyImpact(withApproval(base, 50), { sectors: { lowerClass: -10 } }).sectors.lowerClass;
    const low = applyImpact(withApproval(base, APPROVAL_FLOOR.start - APPROVAL_FLOOR.span / 2), { sectors: { lowerClass: -10 } }).sectors.lowerClass;
    expect(50 - high).toBeCloseTo(10, 6);
    expect(APPROVAL_FLOOR.start - APPROVAL_FLOOR.span / 2 - low).toBeCloseTo(5, 6);
  });
});

describe('condição "qualquer uma"', () => {
  const state = withMetrics(createFixtureState(), { inflation: 3, exchangeRate: 7 });
  it('vale se alguma das alternativas valer', () => {
    expect(
      evaluateCondition(state, {
        kind: 'any',
        conditions: [
          { kind: 'indicator', indicator: 'inflation', comparator: 'gt', value: 6 },
          { kind: 'indicator', indicator: 'exchangeRate', comparator: 'gt', value: 6.5 },
        ],
      }),
    ).toBe(true);
    expect(
      evaluateCondition(state, { kind: 'any', conditions: [{ kind: 'indicator', indicator: 'inflation', comparator: 'gt', value: 6 }] }),
    ).toBe(false);
  });
});

describe('trégua entre crises', () => {
  const RUNS = 2000;
  /** Fração dos sorteios que deram a crise cambial (a única crise elegível no turno 6 depois do escândalo). */
  const fxCrisisShare = (state: SimulationState): number =>
    Array.from({ length: RUNS }, (_, i) => selectEvent({ ...state, seed: i * 2654435761 + 7 }, FIXTURE_CONTENT.events, NORMAL).eventId).filter(
      (id) => id === 'fx-crise-cambial',
    ).length / RUNS;

  it('logo depois de uma crise, outra crise fica menos provável (mesmos eventos elegíveis)', () => {
    const state = { ...withMetrics(createFixtureState(), { exchangeRate: FX_CRISIS_TRIGGER + 1 }), turn: 8 };
    // Escândalo (crise) há 2 meses: trégua. Há 5 meses: sem trégua, mas ainda em cooldown — o sorteio tem os mesmos eventos.
    const recent = { ...state, eventHistory: { 'fx-escandalo': state.turn - CRISIS_RESPITE.turns } };
    const older = { ...state, eventHistory: { 'fx-escandalo': state.turn - CRISIS_RESPITE.turns - 3 } };
    expect(fxCrisisShare(recent)).toBeLessThan(fxCrisisShare(older) - 0.1);
  });
});

describe('gabinete de crise', () => {
  const calm = createFixtureState();
  const crisis = withMetrics(calm, { exchangeRate: FX_CRISIS_TRIGGER + 1 });

  it('a medida só é liberada com o indicador no vermelho, uma por mês', () => {
    expect(isPresidentialActionAvailable(calm, CRISIS_ACTION, CRISIS_SLOT)).toBe(false);
    expect(isPresidentialActionAvailable(crisis, CRISIS_ACTION, CRISIS_SLOT)).toBe(true);
    const taken = applyPresidentialAction(crisis, CRISIS_ACTION, NORMAL, CRISIS_SLOT).state;
    expect(taken.metrics.exchangeRate).toBeLessThan(crisis.metrics.exchangeRate);
    expect(canTakePresidentialAction(taken, CRISIS_SLOT)).toBe(false);
  });
});

describe('termômetro da aprovação', () => {
  it('no início do mandato a lua de mel puxa para cima; com o tempo, o desgaste puxa para baixo', () => {
    const start = createFixtureState();
    const early = explainApproval(start, NORMAL);
    expect(early.drivers.find((driver) => driver.key === 'honeymoon')?.points).toBeGreaterThan(0);
    const late = explainApproval({ ...start, turn: start.termStartTurn + 30 }, NORMAL);
    expect(late.drivers.find((driver) => driver.key === 'wear')?.points).toBeLessThan(0);
    expect(late.drivers.find((driver) => driver.key === 'honeymoon')).toBeUndefined();
  });

  it('inflação alta aparece entre os fatores que puxam para baixo', () => {
    const state = withMetrics(createFixtureState(), { inflation: 9 });
    const outlook = explainApproval(state, NORMAL);
    expect(outlook.drivers.find((driver) => driver.key === 'inflation')?.points).toBeLessThan(0);
    expect(outlook.target).toBeLessThan(explainApproval(createFixtureState(), NORMAL).target);
  });
});
