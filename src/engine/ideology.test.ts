import { describe, expect, it } from 'vitest';
import { IDEOLOGY } from '@/constants/balance';
import { INITIAL_METRICS } from '@/constants/metrics';
import type { GameMetrics, SimulationState } from '@/types';
import { createFixtureState, FIXTURE_CONTENT } from './__fixtures__/content';
import { getVoteBonus } from './congress';
import { militancyBonus } from './simulation';

const at = (economic: number, social: number): GameMetrics => ({ ...INITIAL_METRICS, ideologyEconomic: economic, ideologySocial: social });

describe('espectro político', () => {
  it('o governo começa na ideologia do candidato', () => {
    const [first] = FIXTURE_CONTENT.candidates;
    const state = createFixtureState({ candidateId: first.id });
    // A campanha pode deslocar a posição inicial; aqui a fixture não tem impactos ideológicos.
    expect(state.metrics.ideologyEconomic).toBe(first.economicIdeology);
    expect(state.metrics.ideologySocial).toBe(first.socialIdeology);
  });

  it('governos moderados não têm militância; radicais têm, nos setores alinhados', () => {
    expect(militancyBonus(at(20, 10), 'market')).toBe(0);
    expect(militancyBonus(at(-90, -70), 'environmentalists')).toBeGreaterThan(5);
    expect(militancyBonus(at(-90, -70), 'market')).toBe(0);
    expect(militancyBonus(at(85, 85), 'agribusiness')).toBeGreaterThan(5);
    expect(militancyBonus(at(85, 85), 'military')).toBeGreaterThan(3);
    expect(militancyBonus(at(85, 85), 'environmentalists')).toBe(0);
    expect(militancyBonus(at(100, 100), 'military')).toBeLessThanOrEqual(IDEOLOGY.militancyWeight);
  });
});

describe('ferramentas para driblar o Congresso', () => {
  const withFlags = (flags: Record<string, number>): SimulationState => ({ ...createFixtureState(), turn: 5, flags });

  it('medida provisória e militância nas ruas só valem no mês em que foram usadas', () => {
    const base = getVoteBonus(withFlags({}));
    expect(getVoteBonus(withFlags({ 'medida-provisoria': 5 }))).toBeCloseTo(base + IDEOLOGY.provisionalMeasureVoteBonus);
    expect(getVoteBonus(withFlags({ 'militancia-nas-ruas': 5 }))).toBeCloseTo(base + IDEOLOGY.streetPressureVoteBonus);
    expect(getVoteBonus(withFlags({ 'medida-provisoria': 4 }))).toBeCloseTo(base);
  });
});
