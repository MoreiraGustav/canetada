import { describe, expect, it } from 'vitest';
import { PLENARY } from '@/constants/balance';
import type { VoteTally } from '@/types';
import { createFixtureState, FIXTURE_CONTENT, withApproval, withSupport } from './__fixtures__/content';
import { calculateVoteChance, getVoteBonus } from './congress';
import { explainVoteChance, splitVotesByParty, tallyVotes } from './plenary';

const total = (tally: VoteTally): number => tally.yes + tally.no + tally.abstentions + tally.absent;

describe('explainVoteChance', () => {
  const state = withApproval(withSupport(createFixtureState(), 42), 38);

  it('parte de 50% e os fatores somam exatamente a chance real da votação', () => {
    const breakdown = explainVoteChance(state, 'ordinary', false);
    const real = calculateVoteChance({
      type: 'ordinary',
      support: state.congress.support,
      approval: state.approval,
      negotiate: false,
      voteChanceBonus: getVoteBonus(state),
    });
    expect(breakdown.baseline).toBeCloseTo(0.5, 9);
    expect(breakdown.chance).toBeCloseTo(real, 9);
    const summed = breakdown.factors.reduce((acc, factor) => acc + factor.delta, breakdown.baseline);
    expect(summed).toBeCloseTo(breakdown.chance, 9);
  });

  it('base fraca e aprovação baixa pesam contra; negociar ajuda', () => {
    const plain = explainVoteChance(state, 'ordinary', false);
    expect(plain.factors.find((factor) => factor.key === 'support')?.delta).toBeLessThan(0);
    expect(plain.factors.find((factor) => factor.key === 'approval')?.delta).toBeLessThan(0);
    const negotiated = explainVoteChance(state, 'ordinary', true);
    expect(negotiated.factors.find((factor) => factor.key === 'negotiation')?.delta).toBeGreaterThan(0);
    expect(negotiated.chance).toBeGreaterThan(plain.chance);
  });
});

describe('tallyVotes', () => {
  it('o placar é coerente com o resultado e fecha 513 deputados', () => {
    for (const [type, chance, roll] of [
      ['ordinary', 0.7, 0.2],
      ['ordinary', 0.3, 0.8],
      ['pec', 0.6, 0.59],
      ['pec', 0.4, 0.41],
    ] as const) {
      const tally = tallyVotes(type, chance, roll);
      expect(total(tally)).toBe(PLENARY.seats);
      if (roll < chance) expect(tally.yes).toBeGreaterThanOrEqual(tally.required);
      else expect(tally.yes).toBeLessThan(tally.required);
    }
    expect(tallyVotes('pec', 0.6, 0.2).required).toBe(PLENARY.pecVotes);
  });

  it('votação apertada sai por poucos votos; folgada, por muitos', () => {
    const close = tallyVotes('ordinary', 0.5, 0.49);
    const easy = tallyVotes('ordinary', 0.95, 0.05);
    expect(close.yes - close.required).toBeLessThan(easy.yes - easy.required);
  });
});

describe('splitVotesByParty', () => {
  const parties = FIXTURE_CONTENT.parties;
  const tally = tallyVotes('ordinary', 0.8, 0.3);

  it('as bancadas somam o placar exato', () => {
    const votes = splitVotesByParty(tally, parties, { economic: 50, social: 20 }, parties[0].id);
    expect(votes.reduce((acc, vote) => acc + vote.yes, 0)).toBe(tally.yes);
    expect(votes.reduce((acc, vote) => acc + vote.no, 0)).toBe(tally.no);
    expect(votes.reduce((acc, vote) => acc + vote.other, 0)).toBe(tally.abstentions + tally.absent);
  });

  it('o partido do presidente e os afins votam mais "sim" que os adversários', () => {
    const [own, rival] = splitVotesByParty(tally, parties, { economic: 50, social: 20 }, parties[0].id);
    expect(own.yes / own.seats).toBeGreaterThan(rival.yes / rival.seats);
  });
});
