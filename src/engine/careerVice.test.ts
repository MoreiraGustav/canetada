import { describe, expect, it } from 'vitest';
import { CAREER } from '@/constants/balance';
import type { CareerContent, CareerState } from '@/types';
import { advanceCareerTurn, applyCareerImpact, evaluateCandidacy, evaluateCareerCondition, findOffice, openCareerSemester, resolveMission, stepPost } from './career';
import { atTurn, CAREER_FIXTURE, createFixtureCareer, FX_LEFT_PARTY, FX_VICE_MISSION } from './__fixtures__/career';

const CONTENT = CAREER_FIXTURE;
const TITULAR = 'Otávio Mendes Prado';
const VICE_START = 5;
const VICE_END = 12;

/** Vice-prefeita no meio do mandato, na chapa de um prefeito fictício. */
const vice = (trust: number | null = CAREER.post.initialTrust, missionId: string | null = null): CareerState => {
  const base = atTurn(createFixtureCareer(), VICE_START);
  return {
    ...base,
    position: { kind: 'office', id: 'vice-prefeito', startTurn: VICE_START, endTurn: VICE_END, consecutiveTerms: 1 },
    governments: { ...base.governments, municipal: { partyId: FX_LEFT_PARTY, leaderName: TITULAR, leaderSex: 'm', isPlayer: false } },
    post: trust === null ? null : { trust, missionId },
  };
};

const office = (id: string) => {
  const found = findOffice(CONTENT, id);
  if (!found) throw new Error(id);
  return found;
};

describe('vice no governo', () => {
  it('o vice recebe o pedido do titular a cada semestre; outros mandatos, não', () => {
    const opened = openCareerSemester(vice(null), CONTENT);
    expect(opened.post).toEqual({ trust: CAREER.post.initialTrust, missionId: FX_VICE_MISSION });
    const mayor: CareerState = { ...vice(null), position: { kind: 'office', id: 'prefeito', startTurn: VICE_START, endTurn: VICE_END, consecutiveTerms: 1 } };
    expect(openCareerSemester(mayor, CONTENT).post).toBeNull();
  });

  it('atender o pedido mexe na confiança do titular; ignorar custa confiança', () => {
    const { state, news } = resolveMission(vice(50, FX_VICE_MISSION), CONTENT, 'lealdade');
    expect(state.post).toEqual({ trust: 56, missionId: null });
    expect(state.metrics.partyInfluence).toBeGreaterThan(vice().metrics.partyInfluence);
    expect(news[0].headline).toMatch(/cobre a ausência de Otávio Prado/);
    const skipped = resolveMission(vice(50, FX_VICE_MISSION), CONTENT, null);
    expect(skipped.state.post?.trust).toBe(50 + CAREER.post.skippedMissionTrust);
    expect(skipped.news[0].headline).toMatch(/deixa de lado o pedido do titular/);
  });

  it('confiança baixa não exonera o vice: o titular esvazia o seu espaço', () => {
    const outcomes = Array.from({ length: 30 }, (_, seed) => stepPost({ ...vice(10), seed: seed + 1 }, CONTENT));
    outcomes.forEach((result) => expect(result.state.position?.id).toBe('vice-prefeito'));
    const sidelined = outcomes.filter((result) => result.news.length > 0);
    expect(sidelined.length).toBeGreaterThan(0);
    expect(sidelined.length).toBeLessThan(outcomes.length);
    expect(sidelined[0].news[0].headline).toMatch(/^Otávio Prado esvazia/);
    expect(sidelined[0].state.metrics.partyInfluence).toBeLessThan(vice().metrics.partyInfluence);
  });

  it('confiança alta faz o cargo de vice render mais', () => {
    const content: CareerContent = { ...CONTENT, offices: CONTENT.offices.map((entry) => (entry.id === 'vice-prefeito' ? { ...entry, perks: { partyInfluence: 4 } } : entry)) };
    const high = vice(CAREER.post.highTrust);
    expect(stepPost(high, content).state.metrics.partyInfluence).toBeGreaterThan(high.metrics.partyInfluence);
    expect(stepPost(vice(50), content).state.metrics.partyInfluence).toBe(high.metrics.partyInfluence);
  });

  it('na disputa pela cadeira do titular, a confiança vira apoio ou veto', () => {
    const factor = (trust: number, officeId = 'prefeito') => evaluateCandidacy(vice(trust), CONTENT, office(officeId)).factors.find((entry) => entry.key === 'apoio-titular');
    expect(factor(80)).toMatchObject({ label: 'Apoio de Otávio Prado (titular)', points: CAREER.post.successorSupport });
    expect(factor(10)).toMatchObject({ label: 'Otávio Prado (titular) apoia outro nome', points: -CAREER.post.successorSupport });
    expect(factor(50)).toBeUndefined();
    expect(factor(80, 'deputado-federal')).toBeUndefined();
    const strength = (trust: number) => evaluateCandidacy(vice(trust), CONTENT, office('prefeito')).strength;
    expect(strength(80) - strength(10)).toBeCloseTo(2 * CAREER.post.successorSupport, 6);
  });

  it('impactos e condições de eventos usam a confiança', () => {
    expect(applyCareerImpact(vice(50), CONTENT, { trust: -30 }).post?.trust).toBe(20);
    expect(applyCareerImpact(vice(10), CONTENT, { trust: -30 }).post?.trust).toBe(0);
    expect(applyCareerImpact(vice(null), CONTENT, { trust: 10 }).post).toBeNull();
    const low = { kind: 'trust', comparator: 'lt', value: 25 } as const;
    expect(evaluateCareerCondition(vice(20), CONTENT, low)).toBe(true);
    expect(evaluateCareerCondition(vice(60), CONTENT, low)).toBe(false);
    expect(evaluateCareerCondition(vice(null), CONTENT, low)).toBe(false);
  });

  it('reeleito na chapa de outro titular, a confiança recomeça', () => {
    const reelected = advanceCareerTurn({ ...vice(90), turn: VICE_END, pendingOffice: 'vice-prefeito' }, CONTENT).state;
    expect(reelected.position).toMatchObject({ id: 'vice-prefeito', consecutiveTerms: 2 });
    expect(reelected.post).toBeNull();
    expect(openCareerSemester(reelected, CONTENT).post?.trust).toBe(CAREER.post.initialTrust);
  });
});
