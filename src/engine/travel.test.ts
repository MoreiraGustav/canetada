import { describe, expect, it } from 'vitest';
import { DIFFICULTY_CONFIGS, TRAVEL } from '@/constants/balance';
import type { BrazilianState, SimulationState } from '@/types';
import { createFixtureState, FIXTURE_CONTENT } from './__fixtures__/content';
import { applyPresidentialAction, canTakePresidentialAction, isPresidentialActionAvailable, TRAVEL_SLOT } from './presidentialActions';
import { buildVisitAction, getStateApprovals, getStateCooldownLeft, stateAffinity } from './travel';

const NORMAL = DIFFICULTY_CONFIGS.normal;
const STATES = FIXTURE_CONTENT.states;
const KINDS = FIXTURE_CONTENT.visitKinds;
const findState = (id: string): BrazilianState => {
  const found = STATES.find((uf) => uf.id === id);
  if (!found) throw new Error(`Estado de fixture inexistente: ${id}`);
  return found;
};
const SP = findState('sp');
const RR = findState('rr');

/** Governo de centro-esquerda (longe do eleitorado de Roraima, perto do de SP). */
const leftGovernment = (state: SimulationState): SimulationState => ({
  ...state,
  metrics: { ...state.metrics, ideologyEconomic: -20, ideologySocial: -10 },
});

describe('buildVisitAction', () => {
  const state = leftGovernment(createFixtureState());

  it('a bancada do estado vira base aliada e o nome usa a cidade', () => {
    const capital = buildVisitAction(state, SP, SP.cities[0], KINDS, STATES);
    expect(capital?.impact.congressSupport).toBeCloseTo(0.8 + TRAVEL.supportPerSeat * SP.seats, 6);
    expect(capital?.name).toContain('São Paulo');
    expect(capital?.headline).toContain('(SP)');
  });

  it('eleitorado hostil aumenta o risco; estado mais populoso amplia o efeito nos setores', () => {
    const sp = buildVisitAction(state, SP, SP.cities[0], KINDS, STATES);
    const rr = buildVisitAction(state, RR, RR.cities[0], KINDS, STATES);
    expect(stateAffinity(state.metrics, RR)).toBeLessThan(stateAffinity(state.metrics, SP));
    expect(rr?.risk?.chance ?? 0).toBeGreaterThan(sp?.risk?.chance ?? 0);
    expect(sp?.impact.sectors?.middleClass ?? 0).toBeGreaterThan(rr?.impact.sectors?.middleClass ?? 0);
  });
});

describe('viagem do mês', () => {
  const state = leftGovernment(createFixtureState());
  const action = buildVisitAction(state, SP, SP.cities[1], KINDS, STATES);
  if (!action) throw new Error('visita de fixture inválida');
  const visited = applyPresidentialAction(state, action, NORMAL, TRAVEL_SLOT).state;

  it('uma viagem por mês, e o estado só pode ser revisitado depois do intervalo', () => {
    expect(canTakePresidentialAction(visited, TRAVEL_SLOT)).toBe(false);
    const nextMonth = { ...visited, turn: visited.turn + 1 };
    expect(canTakePresidentialAction(nextMonth, TRAVEL_SLOT)).toBe(true);
    expect(isPresidentialActionAvailable(nextMonth, action, TRAVEL_SLOT)).toBe(false);
    expect(getStateCooldownLeft(nextMonth, SP)).toBe(TRAVEL.stateCooldown - 1);
    const rr = buildVisitAction(nextMonth, RR, RR.cities[0], KINDS, STATES);
    expect(rr && isPresidentialActionAvailable(nextMonth, rr, TRAVEL_SLOT)).toBe(true);
  });

  it('a visita dá um bônus local que decai mês a mês', () => {
    const now = getStateApprovals(visited, STATES).find((entry) => entry.stateId === 'sp');
    const later = getStateApprovals({ ...visited, turn: visited.turn + 4 }, STATES).find((entry) => entry.stateId === 'sp');
    expect(now?.visitBonus).toBeCloseTo(TRAVEL.localVisitBonus, 6);
    expect(later?.visitBonus ?? 0).toBeLessThan(now?.visitBonus ?? 0);
    expect(later?.visitBonus ?? 0).toBeGreaterThan(0);
  });

  it('sem visitas, a média dos estados ponderada pela população fica na aprovação nacional', () => {
    const approvals = getStateApprovals(state, STATES);
    const population = STATES.reduce((acc, uf) => acc + uf.population, 0);
    const weighted = approvals.reduce((acc, entry) => acc + entry.approval * findState(entry.stateId).population, 0) / population;
    expect(weighted).toBeCloseTo(state.approval, 1);
  });
});
