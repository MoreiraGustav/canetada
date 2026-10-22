/**
 * Selectors da sessão de votação no plenário: placar, fatores da chance e votos por bancada.
 */
import { useMemo } from 'react';
import { splitVotesByParty, tallyVotes } from '@/engine';
import type { VoteRecord, VoteSessionItem, VoteTally } from '@/types';
import { indexById } from '@/utils/math';
import { VOTE_FACTOR_LABELS } from '@/utils/labels';
import { getParties } from './content';
import { usePlayerStore } from './usePlayerStore';

const TYPE_LABELS: Record<VoteRecord['type'], string> = { ordinary: 'Projeto de lei', pec: 'Proposta de emenda à Constituição' };
const NEUTRAL_IDEOLOGY = { economic: 0, social: 0 };
/** Chance de partida de toda votação: base no limiar e aprovação de referência. */
const BASELINE_CHANCE = 0.5;

/** Saves antigos não têm placar: reconstrói um coerente com o resultado (sorteio no meio da faixa). */
const tallyOf = (vote: VoteRecord): VoteTally =>
  vote.tally ?? tallyVotes(vote.type, vote.chance, vote.approved ? vote.chance / 2 : (1 + vote.chance) / 2);

/** Votações prontas para a sessão animada (na ordem em que aconteceram). */
export const useVoteSession = (votes: readonly VoteRecord[]): VoteSessionItem[] => {
  const partyId = usePlayerStore((state) => state.candidate?.partyId ?? null);
  return useMemo(() => {
    const parties = getParties();
    const byId = indexById(parties);
    return votes.map((vote) => {
      const tally = tallyOf(vote);
      return {
        vote,
        typeLabel: TYPE_LABELS[vote.type],
        tally,
        baseline: BASELINE_CHANCE,
        factors: (vote.factors ?? []).map((factor) => ({ ...factor, label: VOTE_FACTOR_LABELS[factor.key] })),
        parties: splitVotesByParty(tally, parties, vote.ideology ?? NEUTRAL_IDEOLOGY, partyId)
          .map((entry) => {
            const party = byId[entry.partyId];
            return {
              ...entry,
              acronym: party.acronym,
              name: party.name,
              color: party.color,
              own: party.id === partyId,
              economicIdeology: party.economicIdeology,
            };
          })
          .sort((a, b) => a.economicIdeology - b.economicIdeology),
      };
    });
  }, [votes, partyId]);
};
