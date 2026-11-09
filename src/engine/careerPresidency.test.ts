import { describe, expect, it } from 'vitest';
import { CAREER } from '@/constants/balance';
import type { CareerState, NewGameParams } from '@/types';
import { getTurnFromDate } from '@/utils/calendar';
import { buildCareerCandidate, calculateCareerPresidentialElection, deriveCareerAbility, enterPresidency } from './career';
import { getGameTurn } from './conditions';
import { createInitialState } from './election';
import { CAREER_FIXTURE, createFixtureCareer, withMetrics } from './__fixtures__/career';
import { FIXTURE_CONTENT, pickCampaignOptions } from './__fixtures__/content';

/** Eleições gerais de 2030 (2º semestre). */
const GENERAL_2030 = 8;

const veteran = (): CareerState =>
  withMetrics({ ...createFixtureCareer({ startingAge: 45 }), turn: GENERAL_2030, partyJoinedTurn: 1 }, {
    partyInfluence: 85,
    nationalRecognition: 90,
    reputation: 80,
    electoralBase: 60,
    localPopularity: 60,
  });

describe('da carreira ao Planalto', () => {
  it('o ponto forte da carreira vira a habilidade do presidente', () => {
    expect(deriveCareerAbility(veteran()).abilityId).toBe('carisma-popular');
    expect(deriveCareerAbility(withMetrics(veteran(), { partyInfluence: 99 })).abilityId).toBe('articulador-nato');
  });

  it('influência vira base aliada; reputação vira aprovação', () => {
    const state = veteran();
    const candidate = buildCareerCandidate(state, CAREER_FIXTURE, FIXTURE_CONTENT);
    expect(candidate.name).toBe(state.profile.politicalName);
    expect(candidate.partyId).toBe(state.partyId);
    expect(candidate.portrait).toEqual({ seed: state.profile.portraitSeed, traits: { sex: 'f' } });
    const neutral = buildCareerCandidate(withMetrics(state, { partyInfluence: 50, reputation: 50 }), CAREER_FIXTURE, FIXTURE_CONTENT);
    const supportBonus = (state.metrics.partyInfluence - 50) * CAREER.presidency.influenceToSupport;
    const approvalBonus = (state.metrics.reputation - 50) * CAREER.presidency.reputationToApproval;
    expect((candidate.startingImpact.congressSupport ?? 0) - (neutral.startingImpact.congressSupport ?? 0)).toBeCloseTo(supportBonus, 6);
    expect((candidate.startingImpact.approval ?? 0) - (neutral.startingImpact.approval ?? 0)).toBeCloseTo(approvalBonus, 6);
  });

  it('o 2º turno pode ser perdido, e a vitória é sempre acima de 50%', () => {
    const outcomes = Array.from({ length: 30 }, (_, seed) => {
      const state = { ...veteran(), seed: seed + 1 };
      const candidate = buildCareerCandidate(state, CAREER_FIXTURE, FIXTURE_CONTENT);
      return calculateCareerPresidentialElection(state, CAREER_FIXTURE, FIXTURE_CONTENT, candidate, pickCampaignOptions(FIXTURE_CONTENT, 0));
    });
    outcomes.forEach((outcome) => {
      expect(outcome.won).toBe(outcome.record.voteShare > 50);
      expect(outcome.state.pendingOffice).toBe(outcome.won ? 'presidente' : null);
      if (outcome.won) expect(outcome.election.voteShare).toBeGreaterThan(50);
    });
    const weak = withMetrics(veteran(), { nationalRecognition: 5, reputation: 20 });
    const weakCandidate = buildCareerCandidate(weak, CAREER_FIXTURE, FIXTURE_CONTENT);
    expect(calculateCareerPresidentialElection(weak, CAREER_FIXTURE, FIXTURE_CONTENT, weakCandidate, []).won).toBe(false);
  });

  it('a posse registra o cargo e o governo federal passa a ser do jogador', () => {
    const entered = enterPresidency(veteran(), CAREER_FIXTURE, 4);
    expect(entered.turn).toBe(GENERAL_2030 + 1);
    expect(entered.position).toMatchObject({ id: 'presidente', startTurn: 9, endTurn: 16 });
    expect(entered.governments.federal.isPlayer).toBe(true);
  });

  it('o governo começa no janeiro do ano da posse e o conteúdo conta a partir dele', () => {
    const state = veteran();
    const candidate = buildCareerCandidate(state, CAREER_FIXTURE, FIXTURE_CONTENT);
    const options = pickCampaignOptions(FIXTURE_CONTENT, 0);
    const { election } = calculateCareerPresidentialElection(state, CAREER_FIXTURE, FIXTURE_CONTENT, candidate, options);
    const startTurn = getTurnFromDate(2031, 1);
    const params: NewGameParams = { mode: 'blitz', difficulty: 'normal', seed: 3, candidate, campaignOptions: options, election, goalIds: [], startTurn };
    const initial = createInitialState(params, FIXTURE_CONTENT);
    expect(initial.turn).toBe(startTurn);
    expect(initial.termStartTurn).toBe(startTurn);
    expect(initial.totalTurns).toBe(startTurn - 1 + initial.termLength);
    expect(getGameTurn(initial)).toBe(1);
    initial.promises.forEach((promise) => expect(promise.deadlineTurn).toBeGreaterThanOrEqual(startTurn));
  });
});
