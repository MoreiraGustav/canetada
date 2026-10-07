import { describe, expect, it } from 'vitest';
import type { SimulationState } from '@/types';
import { createFixtureState, FIXTURE_CONTENT } from './__fixtures__/content';
import { applyDiplomaticAction, canPerformDiplomaticAction, stepDiplomacy } from './diplomacy';
import { applyActiveEffects } from './impacts';

const ACTION = FIXTURE_CONTENT.diplomaticActions[0];

describe('applyDiplomaticAction', () => {
  it('aplica o ganho de relação × multiplicador, marca o turno e conta a ação', () => {
    const state: SimulationState = { ...createFixtureState(), turn: 3 };
    const boosted: SimulationState = { ...state, modifiers: { ...state.modifiers, diplomacyMultiplier: 1.5 } };
    const { state: next, news } = applyDiplomaticAction(boosted, ACTION, 'india', 'Índia');
    expect(next.relations.india).toBeCloseTo(state.relations.india + ACTION.relationDelta * 1.5);
    expect(next.metrics.prestige).toBeCloseTo(state.metrics.prestige + 1);
    expect(next.lastDiplomaticActionTurn).toBe(3);
    expect(next.stats.diplomaticActions).toBe(1);
    expect(news.headline).toBe('Presidente visita Índia');
    expect(canPerformDiplomaticAction(next)).toBe(false);
    expect(canPerformDiplomaticAction({ ...next, turn: 4 })).toBe(true);
  });

  it('a parte temporária do ganho se dissipa ao longo de decayDuration turnos', () => {
    let state = applyDiplomaticAction({ ...createFixtureState(), turn: 3 }, ACTION, 'india', 'Índia').state;
    const initial = createFixtureState().relations.india;
    for (let turn = 4; turn <= 3 + ACTION.decayDuration; turn += 1) state = applyActiveEffects({ ...state, turn });
    expect(state.relations.india).toBeCloseTo(initial + ACTION.relationDelta - ACTION.targetRelationDecay);
    expect(state.activeEffects).toHaveLength(0);
  });
});

describe('stepDiplomacy', () => {
  it('relações derivam de volta à relação inicial', () => {
    const state = createFixtureState();
    const drifted = stepDiplomacy({ ...state, relations: { ...state.relations, eua: 90, china: 20 } }, FIXTURE_CONTENT.countries);
    expect(drifted.relations.eua).toBeLessThan(90);
    expect(drifted.relations.eua).toBeGreaterThan(60);
    expect(drifted.relations.china).toBeGreaterThan(20);
  });
});
