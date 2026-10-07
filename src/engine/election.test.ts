import { describe, expect, it } from 'vitest';
import { DIFFICULTY_CONFIGS, ELECTION, IDEOLOGY_AFFINITY } from '@/constants/balance';
import { CAMPAIGN_QUESTION_COUNT, GAME_MODES } from '@/constants/game';
import { INITIAL_METRICS } from '@/constants/metrics';
import { SECTOR_KEYS } from '@/constants/sectors';
import type { CampaignOption, PlayerCandidate } from '@/types';
import { createFixtureState, FIXTURE_CONTENT, pickCampaignOptions, withApproval } from './__fixtures__/content';
import {
  buildPlayerCandidate,
  calculateElectionResult,
  calculateReelection,
  deriveIdeologyAffinity,
  selectCampaignQuestions,
  startSecondTerm,
} from './election';

const CONTENT = FIXTURE_CONTENT;
const archetype = (candidateId: string): PlayerCandidate => buildPlayerCandidate({ kind: 'archetype', candidateId }, CONTENT);
const extremeOption = (voteShareDelta: number): CampaignOption => ({ id: 'x', label: '', description: '', impact: {}, voteShareDelta });

describe('buildPlayerCandidate', () => {
  it('arquétipo usa afinidade/impacto do candidato e combina modificadores', () => {
    const player = archetype('fx-centro-direita');
    expect(player.archetypeId).toBe('fx-centro-direita');
    expect(player.sectorAffinity).toEqual({ market: 10, business: 8, lowerClass: -5 });
    expect(player.startingImpact).toEqual({ congressSupport: -5 });
    // empresário (+3) + credibilidade econômica (+5) somam.
    expect(player.modifiers.economicConfidenceBonus).toBe(8);
    expect(player.modifiers.negotiationCostMultiplier).toBe(1);
  });

  it('customizado deriva a afinidade da ideologia e soma a do background', () => {
    const player = buildPlayerCandidate(
      {
        kind: 'custom',
        input: { name: '  Ana  ', partyId: 'fx-partido-liberal', economicIdeology: 100, socialIdeology: -100, background: 'academico', abilityId: 'negociador-habil' },
      },
      CONTENT,
    );
    const ideology = deriveIdeologyAffinity(100, -100);
    expect(player.archetypeId).toBeNull();
    expect(player.name).toBe('Ana');
    expect(player.sectorAffinity.market).toBe(ideology.market);
    expect(player.sectorAffinity.environmentalists).toBe((ideology.environmentalists ?? 0) + 8);
    // acadêmico (0,8) × negociador hábil (0,5): multiplicadores se multiplicam.
    expect(player.modifiers.negotiationCostMultiplier).toBeCloseTo(0.4);
    expect(player.color).toBe('#1d4ed8');
  });

  it('deriveIdeologyAffinity: direita econômica favorece mercado, esquerda favorece classe baixa', () => {
    const right = deriveIdeologyAffinity(100, 0);
    const left = deriveIdeologyAffinity(-100, 0);
    expect(right.market).toBe(Math.round(100 * (IDEOLOGY_AFFINITY.economic.market ?? 0)));
    expect(right.market ?? 0).toBeGreaterThan(0);
    expect(right.lowerClass ?? 0).toBeLessThan(0);
    expect(left.lowerClass ?? 0).toBeGreaterThan(0);
    expect(left.market ?? 0).toBeLessThan(0);
    expect(deriveIdeologyAffinity(0, 100).military ?? 0).toBeGreaterThan(0);
    SECTOR_KEYS.forEach((key) => expect(deriveIdeologyAffinity(0, 0)[key]).toBeCloseTo(0));
  });
});

describe('calculateElectionResult', () => {
  const player = archetype('fx-centro-direita');

  it('o jogador sempre vence, com votos em [minVoteShare, maxVoteShare]', () => {
    const scenarios = [pickCampaignOptions(CONTENT, 0), pickCampaignOptions(CONTENT, 1), [extremeOption(-80)], [extremeOption(80)]];
    scenarios.forEach((options) => {
      Array.from({ length: 50 }, (_, seed) => seed + 1).forEach((seed) => {
        const result = calculateElectionResult(player, options, CONTENT, seed);
        expect(result.voteShare).toBeGreaterThanOrEqual(ELECTION.minVoteShare);
        expect(result.voteShare).toBeLessThanOrEqual(ELECTION.maxVoteShare);
        expect(result.margin).toBeGreaterThan(0);
        expect(result.firstRoundShare).toBeLessThan(result.voteShare);
        expect(result.initialCongressSupport).toBeGreaterThanOrEqual(ELECTION.minInitialSupport);
        expect(result.initialCongressSupport).toBeLessThanOrEqual(ELECTION.maxInitialSupport);
      });
    });
    expect(calculateElectionResult(player, [extremeOption(-80)], CONTENT, 1).voteShare).toBe(ELECTION.minVoteShare);
    expect(calculateElectionResult(player, [extremeOption(80)], CONTENT, 1).voteShare).toBe(ELECTION.maxVoteShare);
  });

  it('margem maior dá mais capital político', () => {
    const narrow = calculateElectionResult(player, [extremeOption(-80)], CONTENT, 1);
    const landslide = calculateElectionResult(player, [extremeOption(80)], CONTENT, 1);
    expect(landslide.initialCongressSupport).toBeGreaterThan(narrow.initialCongressSupport);
    expect(landslide.capital).toBe('alto');
    expect(narrow.capital).toBe('baixo');
  });

  it('o adversário é o arquétipo ideologicamente oposto', () => {
    expect(calculateElectionResult(player, [], CONTENT, 3).opponentName).toBe('Rui Andrade');
    expect(calculateElectionResult(archetype('fx-esquerda'), [], CONTENT, 3).opponentName).toBe('Helena Prado');
  });

  it('é determinístico para a mesma semente', () => {
    const options = pickCampaignOptions(CONTENT, 0);
    expect(calculateElectionResult(player, options, CONTENT, 9)).toEqual(calculateElectionResult(player, options, CONTENT, 9));
  });
});

describe('selectCampaignQuestions', () => {
  it('devolve CAMPAIGN_QUESTION_COUNT perguntas, obrigatórias primeiro, sem repetição', () => {
    Array.from({ length: 30 }, (_, seed) => seed * 31 + 1).forEach((seed) => {
      const { questionIds, seed: nextSeed } = selectCampaignQuestions(CONTENT.campaignQuestions, seed);
      expect(questionIds).toHaveLength(CAMPAIGN_QUESTION_COUNT);
      expect(questionIds[0]).toBe('fx-economia');
      expect(new Set(questionIds).size).toBe(questionIds.length);
      expect(nextSeed).not.toBe(seed);
    });
  });

  it('é determinístico e varia com a semente', () => {
    const questions = CONTENT.campaignQuestions;
    expect(selectCampaignQuestions(questions, 5)).toEqual(selectCampaignQuestions(questions, 5));
    const variants = new Set(Array.from({ length: 30 }, (_, seed) => selectCampaignQuestions(questions, seed).questionIds.join(',')));
    expect(variants.size).toBeGreaterThan(1);
  });
});

describe('createInitialState', () => {
  it('monta a posse: turno 1, duração do modo, relações, promessas, metas e impactos iniciais', () => {
    const state = createFixtureState({ mode: 'standard' });
    expect(state.turn).toBe(1);
    expect(state.termStartTurn).toBe(1);
    expect(state.termLength).toBe(GAME_MODES.standard.turns);
    expect(state.totalTurns).toBe(GAME_MODES.standard.turns);
    expect(state.relations.argentina).toBe(75);
    expect(state.promises).toHaveLength(1);
    expect(state.goals.map((goal) => goal.goalId)).toEqual(['fx-meta-desemprego', 'fx-meta-desmatamento', 'fx-meta-gini']);
    expect(state.metrics.inflation).toBe(INITIAL_METRICS.inflation);
    expect(state.stats.peakApproval).toBe(state.approval);
    expect(state.flags).toEqual({});
  });

  it('aplica o startingImpact do candidato sobre a base eleita', () => {
    const player = archetype('fx-centro-direita');
    const options = pickCampaignOptions(CONTENT, 0);
    const election = calculateElectionResult(player, options, CONTENT, 12345);
    const state = createFixtureState({ seed: 12345 });
    expect(state.congress.support).toBeCloseTo(election.initialCongressSupport - 5);
  });
});

describe('reeleição e segundo mandato', () => {
  const threshold = DIFFICULTY_CONFIGS.normal.reelectionThreshold;

  it('aprovação ≥ limiar reelege com mais de 50%; abaixo, derrota com menos de 50%', () => {
    const state = createFixtureState();
    const win = calculateReelection(withApproval(state, threshold));
    expect(win.reelected).toBe(true);
    expect(win.voteShare).toBeGreaterThan(50);
    const loss = calculateReelection(withApproval(state, threshold - 0.1));
    expect(loss.reelected).toBe(false);
    expect(loss.voteShare).toBeLessThan(50);
  });

  it('startSecondTerm renova o mandato', () => {
    const state = { ...withApproval(createFixtureState(), 55), turn: 48 };
    const next = startSecondTerm(state);
    expect(next.termNumber).toBe(2);
    expect(next.termStartTurn).toBe(49);
    expect(next.totalTurns).toBe(96);
    expect(next.approval).toBeGreaterThan(state.approval);
  });
});
