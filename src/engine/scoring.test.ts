import { describe, expect, it } from 'vitest';
import { DIFFICULTY_CONFIGS, ENDING_MULTIPLIERS, SCORE } from '@/constants/balance';
import type { Difficulty, EndingType, GameEnding, LegacyTier, SimulationState } from '@/types';
import { createFixtureState, FIXTURE_CONTENT, withApproval } from './__fixtures__/content';
import { calculateScore } from './scoring';

const TIERS = FIXTURE_CONTENT.legacyTiers;
const ending = (type: EndingType): GameEnding => ({ type, turn: 48, reelected: false, reelectionVoteShare: null });

/** Estado "perfeito": metas cumpridas, aprovação no teto, economia ideal e crises bem conduzidas. */
const perfect = (difficulty: Difficulty = 'normal'): SimulationState => {
  const state = withApproval(createFixtureState({ difficulty }), SCORE.approvalCeiling);
  return {
    ...state,
    goals: state.goals.map((goal) => ({ ...goal, achieved: true, progress: 100 })),
    metrics: { ...state.metrics, gdpGrowth: SCORE.growthCeiling, inflation: 3, unemployment: SCORE.unemploymentCeiling, debt: SCORE.debtCeiling },
    stats: { ...state.stats, crisesFaced: 4, crisesHandled: 4 },
    congress: { ...state.congress, cpisSurvived: 3 },
  };
};

/** Estado desastroso: nada cumprido, aprovação no piso, economia em colapso, crises mal conduzidas. */
const disaster = (): SimulationState => {
  const state = withApproval(createFixtureState(), 0);
  return {
    ...state,
    goals: state.goals.map((goal) => ({ ...goal, achieved: false, progress: 0 })),
    metrics: { ...state.metrics, gdpGrowth: -5, inflation: 15, unemployment: 18, debt: 130 },
    stats: { ...state.stats, crisesFaced: 3, crisesHandled: 0 },
  };
};

describe('calculateScore', () => {
  it('estado perfeito atinge o máximo de cada componente', () => {
    const score = calculateScore(perfect(), ending('retired'), TIERS);
    expect(score).toMatchObject({ goals: SCORE.goalsMax, approval: SCORE.approvalMax, economy: SCORE.economyMax, events: SCORE.eventsMax });
    expect(score.subtotal).toBe(1000);
    expect(score.total).toBe(1000);
    expect(score.legacyTitle).toBe('Estadista');
  });

  it('estado desastroso zera os componentes e cai no menor título', () => {
    const score = calculateScore(disaster(), ending('retired'), TIERS);
    expect(score).toMatchObject({ goals: 0, approval: 0, economy: 0, events: 0, subtotal: 0, total: 0 });
    expect(score.legacyTitle).toBe('Pato Manco');
  });

  it('componentes ficam dentro dos máximos e o subtotal é a soma', () => {
    const state = createFixtureState();
    const score = calculateScore(state, ending('defeated'), TIERS);
    expect(score.goals).toBeGreaterThanOrEqual(0);
    expect(score.goals).toBeLessThanOrEqual(SCORE.goalsMax);
    expect(score.approval).toBeGreaterThanOrEqual(0);
    expect(score.approval).toBeLessThanOrEqual(SCORE.approvalMax);
    expect(score.economy).toBeGreaterThanOrEqual(0);
    expect(score.economy).toBeLessThanOrEqual(SCORE.economyMax);
    expect(score.events).toBeGreaterThanOrEqual(0);
    expect(score.events).toBeLessThanOrEqual(SCORE.eventsMax);
    expect(score.subtotal).toBe(score.goals + score.approval + score.economy + score.events);
  });

  it('aplica multiplicadores de dificuldade e de final', () => {
    const hardTwoTerms = calculateScore(perfect('hard'), ending('completed-two-terms'), TIERS);
    expect(hardTwoTerms.difficultyMultiplier).toBe(DIFFICULTY_CONFIGS.hard.scoreMultiplier);
    expect(hardTwoTerms.endingMultiplier).toBe(ENDING_MULTIPLIERS['completed-two-terms']);
    expect(hardTwoTerms.total).toBe(Math.round(1000 * DIFFICULTY_CONFIGS.hard.scoreMultiplier * ENDING_MULTIPLIERS['completed-two-terms']));
    const easyImpeached = calculateScore(perfect('easy'), ending('impeached'), TIERS);
    expect(easyImpeached.total).toBe(Math.round(1000 * DIFFICULTY_CONFIGS.easy.scoreMultiplier * ENDING_MULTIPLIERS.impeached));
    expect(easyImpeached.legacyTitle).toBe('Mediano');
  });

  it('metas não cumpridas rendem parte proporcional ao progresso', () => {
    const state = perfect();
    const half = { ...state, goals: state.goals.map((goal) => ({ ...goal, achieved: false, progress: 50 })) };
    expect(calculateScore(half, ending('retired'), TIERS).goals).toBe(Math.round(SCORE.goalsMax * SCORE.partialGoalShare * 0.5));
  });

  it('sem crises enfrentadas vale a pontuação neutra de eventos', () => {
    const state = createFixtureState();
    const calm = { ...state, stats: { ...state.stats, crisesFaced: 0, crisesHandled: 0 } };
    expect(calculateScore(calm, ending('retired'), TIERS).events).toBe(SCORE.noCrisisScore);
  });

  it('encontra o título de legado mesmo com tiers fora de ordem', () => {
    const shuffled: LegacyTier[] = [TIERS[2], TIERS[0], TIERS[1]];
    expect(calculateScore(perfect(), ending('retired'), shuffled).legacyTitle).toBe('Estadista');
    expect(calculateScore(perfect(), ending('retired'), []).legacyTitle).toBe('—');
  });
});
