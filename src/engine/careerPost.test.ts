import { describe, expect, it } from 'vitest';
import { CAREER } from '@/constants/balance';
import type { CareerState } from '@/types';
import { applyMandatePlan, checkAppointment, findAppointment, leaveAppointment, openCareerSemester, resolveMission, stepPost, takeAppointment } from './career';
import { atTurn, CAREER_FIXTURE, createFixtureCareer, FX_LEFT_PARTY, FX_MISSION, withMetrics } from './__fixtures__/career';

const CONTENT = CAREER_FIXTURE;

/** Assessora parlamentar com a missão de teste na mesa. */
const aide = (trust: number = CAREER.post.initialTrust): CareerState => {
  const appointed = takeAppointment(atTurn(createFixtureCareer(), 5), CONTENT, 'assessor-parlamentar').state;
  return { ...appointed, post: { trust, missionId: FX_MISSION } };
};

const withMayor = (state: CareerState, partyId: string): CareerState => ({
  ...state,
  governments: { ...state.governments, municipal: { ...state.governments.municipal, partyId, isPlayer: false } },
});

describe('cargo de confiança', () => {
  it('assumir o cargo começa com a confiança neutra; o semestre traz a missão do chefe', () => {
    const appointed = takeAppointment(atTurn(createFixtureCareer(), 5), CONTENT, 'assessor-parlamentar').state;
    expect(appointed.post).toEqual({ trust: CAREER.post.initialTrust, missionId: null });
    const opened = openCareerSemester(appointed, CONTENT);
    expect(['fx-missao', 'fx-missao-gabinete']).toContain(opened.post?.missionId);
    expect(openCareerSemester(atTurn(createFixtureCareer(), 5), CONTENT).post).toBeNull();
    expect(leaveAppointment(opened, CONTENT).state.post).toBeNull();
  });

  it('cumprir a missão mexe na carreira e na confiança; ignorar custa confiança', () => {
    const state = aide();
    const done = resolveMission(state, CONTENT, 'caprichar').state;
    expect(done.post).toEqual({ trust: CAREER.post.initialTrust + 10, missionId: null });
    expect(done.metrics.electoralBase).toBeGreaterThan(state.metrics.electoralBase);
    expect(done.missionLog[FX_MISSION]).toBe(state.turn);
    const skipped = resolveMission(state, CONTENT, null);
    expect(skipped.state.post?.trust).toBe(CAREER.post.initialTrust + CAREER.post.skippedMissionTrust);
    expect(skipped.news[0].headline).toMatch(/deixa de lado a missão/);
  });

  it('o desfecho ruim de uma missão arriscada desconta a confiança e fica registrado como origem', () => {
    const { state, news } = resolveMission(aide(), CONTENT, 'arriscar');
    expect(state.post?.trust).toBe(CAREER.post.initialTrust + 5 - 20);
    expect(news[0].headline).toMatch(/se dá mal/);
    const planned = applyMandatePlan(aide(), CONTENT, { vote: null, bill: null, amendmentId: null, workId: null, missionOptionId: 'caprichar' });
    expect(planned.state.post?.trust).toBe(CAREER.post.initialTrust + 10);
  });

  it('confiança alta rende mais e faz o chefe indicar você para cargos maiores', () => {
    const high = aide(CAREER.post.highTrust);
    const closed = stepPost(high, CONTENT).state;
    expect(closed.metrics.partyInfluence).toBeGreaterThan(high.metrics.partyInfluence);
    expect(closed.post?.missionId).toBeNull();
    // Secretaria municipal exige influência 35; com a indicação do chefe, 25 bastam.
    const secretary = findAppointment(CONTENT, 'secretario-municipal')!;
    const candidate = withMayor(withMetrics(high, { partyInfluence: 28, reputation: 60 }), FX_LEFT_PARTY);
    expect(checkAppointment(candidate, CONTENT, secretary).ok).toBe(true);
    expect(checkAppointment({ ...candidate, post: { trust: 50, missionId: null } }, CONTENT, secretary).ok).toBe(false);
  });

  it('confiança baixa pode levar à exoneração', () => {
    const outcomes = Array.from({ length: 30 }, (_, seed) => stepPost({ ...aide(10), seed: seed + 1 }, CONTENT));
    const dismissed = outcomes.filter((result) => result.state.position === null);
    expect(dismissed.length).toBeGreaterThan(0);
    expect(dismissed.length).toBeLessThan(outcomes.length);
    expect(dismissed[0].state.post).toBeNull();
    expect(dismissed[0].news[0].headline).toMatch(/exonerada: o chefe perdeu a confiança/);
  });
});
