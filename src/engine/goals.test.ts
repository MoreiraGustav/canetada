import { describe, expect, it } from 'vitest';
import { GAME_MODES } from '@/constants/game';
import { INITIAL_METRICS } from '@/constants/metrics';
import type { GameMetrics, GoalDefinition, GameMode } from '@/types';
import { FIXTURE_CONTENT } from './__fixtures__/content';
import { createGoalProgress, updateGoalProgress } from './goals';

const GOALS = FIXTURE_CONTENT.goals;
const metrics = (overrides: Partial<GameMetrics> = {}): GameMetrics => ({ ...INITIAL_METRICS, ...overrides });
const targetFor = (goalId: string, mode: GameMode): number => createGoalProgress([goalId], GOALS, metrics(), mode)[0].targetValue;

describe('createGoalProgress', () => {
  it.each(['blitz', 'standard', 'full'] as const)('escala metas absolutas pelo goalScale (%s)', (mode) => {
    const scale = GAME_MODES[mode].goalScale;
    // Desemprego: de 7,8 até 6.
    expect(targetFor('fx-meta-desemprego', mode)).toBeCloseTo(INITIAL_METRICS.unemployment + (6 - INITIAL_METRICS.unemployment) * scale);
  });

  it.each(['blitz', 'standard', 'full'] as const)('escala metas relativas pelo goalScale (%s)', (mode) => {
    const scale = GAME_MODES[mode].goalScale;
    expect(targetFor('fx-meta-desmatamento', mode)).toBeCloseTo(INITIAL_METRICS.deforestation * (1 - 0.3 * scale));
  });

  it.each(['blitz', 'standard', 'full'] as const)('escala metas de delta pelo goalScale (%s)', (mode) => {
    const scale = GAME_MODES[mode].goalScale;
    expect(targetFor('fx-meta-gini', mode)).toBeCloseTo(INITIAL_METRICS.gini - 0.03 * scale);
  });

  it('no modo completo o alvo é o valor integral', () => {
    expect(targetFor('fx-meta-desemprego', 'full')).toBeCloseTo(6);
    expect(targetFor('fx-meta-desmatamento', 'full')).toBeCloseTo(INITIAL_METRICS.deforestation * 0.7);
    expect(targetFor('fx-meta-gini', 'full')).toBeCloseTo(INITIAL_METRICS.gini - 0.03);
  });

  it('começa com progresso 0 e guarda o baseline', () => {
    const [goal] = createGoalProgress(['fx-meta-ideb'], GOALS, metrics(), 'full');
    expect(goal).toMatchObject({ goalId: 'fx-meta-ideb', baseline: INITIAL_METRICS.ideb, targetValue: 5.5, progress: 0, achieved: false });
  });

  it('meta absoluta já superada no início fica cumprida', () => {
    const easy: GoalDefinition = { ...GOALS[3], id: 'facil', target: INITIAL_METRICS.ideb - 0.5 };
    const [goal] = createGoalProgress(['facil'], [easy], metrics(), 'blitz');
    expect(goal.targetValue).toBe(easy.target);
    expect(goal.achieved).toBe(true);
    expect(goal.progress).toBe(100);
  });

  it('ignora IDs desconhecidos', () => {
    expect(createGoalProgress(['inexistente', 'fx-meta-gini'], GOALS, metrics(), 'full').map((goal) => goal.goalId)).toEqual(['fx-meta-gini']);
  });
});

describe('updateGoalProgress', () => {
  const [goal] = createGoalProgress(['fx-meta-desemprego'], GOALS, metrics(), 'full');
  const progressAt = (unemployment: number): { progress: number; achieved: boolean } =>
    updateGoalProgress([goal], GOALS, metrics({ unemployment }))[0];

  it('progresso proporcional entre baseline e alvo (0–100)', () => {
    expect(progressAt(INITIAL_METRICS.unemployment).progress).toBeCloseTo(0);
    expect(progressAt((INITIAL_METRICS.unemployment + 6) / 2).progress).toBeCloseTo(50);
  });

  it('piora não gera progresso negativo', () => {
    expect(progressAt(12).progress).toBe(0);
  });

  it('atingir ou superar o alvo cumpre a meta com 100%', () => {
    expect(progressAt(6)).toEqual(expect.objectContaining({ progress: 100, achieved: true }));
    expect(progressAt(4)).toEqual(expect.objectContaining({ progress: 100, achieved: true }));
  });

  it('meta pode voltar a não cumprida se o indicador piorar', () => {
    const achieved = updateGoalProgress([goal], GOALS, metrics({ unemployment: 5 }));
    expect(updateGoalProgress(achieved, GOALS, metrics({ unemployment: 7 }))[0].achieved).toBe(false);
  });
});
