/**
 * Selectors da sessão de votação no plenário: placar em cada Casa, fatores da
 * chance e votos por bancada (leis, PECs nas duas Casas e impeachment).
 */
import { useMemo } from 'react';
import { senateParties, splitVotesByParty, tallyVotes } from '@/engine';
import type { Chamber, Party, PartyVoteView, VoteKind, VoteRecord, VoteSessionItem, VoteStageView, VoteTally } from '@/types';
import { VOTE_FACTOR_LABELS } from '@/utils/labels';
import { getParties } from './content';
import { useGameStore } from './useGameStore';
import { usePlayerStore } from './usePlayerStore';

const NEUTRAL_IDEOLOGY = { economic: 0, social: 0 };
/** Chance de partida de toda votação: base no limiar e aprovação de referência. */
const BASELINE_CHANCE = 0.5;

const CHAMBER_LABELS: Record<Chamber, string> = { camara: 'Câmara dos Deputados', senado: 'Senado Federal' };

const TYPE_LABELS: Record<VoteKind, (vote: VoteRecord) => string> = {
  law: (vote) => (vote.type === 'pec' ? 'Proposta de emenda à Constituição · Câmara e Senado' : 'Projeto de lei'),
  'impeachment-opening': () => 'Impeachment · autorização na Câmara (2/3)',
  'impeachment-trial': () => 'Impeachment · julgamento no Senado (2/3)',
};

/** Carimbo de cada etapa: o que significa passar (ou não) naquela Casa. */
const STAMPS: Record<VoteKind, (passed: boolean) => string> = {
  law: (passed) => (passed ? 'Aprovada' : 'Rejeitada'),
  'impeachment-opening': (passed) => (passed ? 'Processo aberto' : 'Arquivado'),
  'impeachment-trial': (passed) => (passed ? 'Afastado' : 'Absolvido'),
};

/** Saves antigos não têm placar: reconstrói um coerente com o resultado (sorteio no meio da faixa). */
const tallyOf = (vote: VoteRecord): VoteTally =>
  vote.tally ?? tallyVotes(vote.type, vote.chance, vote.approved ? vote.chance / 2 : (1 + vote.chance) / 2);

const toPartyViews = (
  tally: VoteTally,
  parties: readonly Party[],
  vote: VoteRecord,
  playerPartyId: string | null,
  against: boolean,
): PartyVoteView[] => {
  const byId = Object.fromEntries(parties.map((party) => [party.id, party]));
  return splitVotesByParty(tally, parties, vote.ideology ?? NEUTRAL_IDEOLOGY, playerPartyId, against)
    .map((entry) => {
      const party = byId[entry.partyId];
      return {
        ...entry,
        acronym: party.acronym,
        name: party.name,
        color: party.color,
        own: party.id === playerPartyId,
        economicIdeology: party.economicIdeology,
      };
    })
    .sort((a, b) => a.economicIdeology - b.economicIdeology);
};

const buildStage = (
  tally: VoteTally,
  kind: VoteKind,
  parties: readonly Party[],
  vote: VoteRecord,
  playerPartyId: string | null,
): VoteStageView => {
  const chamber = tally.chamber ?? 'camara';
  const passed = tally.yes >= tally.required;
  const chamberParties = chamber === 'senado' ? senateParties(parties) : parties;
  return {
    chamber,
    chamberLabel: CHAMBER_LABELS[chamber],
    tally,
    parties: toPartyViews(tally, chamberParties, vote, playerPartyId, kind !== 'law'),
    passed,
    stamp: STAMPS[kind](passed),
  };
};

/** Votações prontas para a sessão animada (na ordem em que aconteceram). */
export const useVoteSession = (votes: readonly VoteRecord[]): VoteSessionItem[] => {
  const partyId = usePlayerStore((state) => state.candidate?.partyId ?? null);
  const world = useGameStore((state) => state.world);
  return useMemo(() => {
    const parties = getParties(world);
    return votes.map((vote) => {
      const kind = vote.kind ?? 'law';
      const tallies = [tallyOf(vote), ...(vote.senateTally ? [vote.senateTally] : [])];
      return {
        vote,
        typeLabel: TYPE_LABELS[kind](vote),
        stages: tallies.map((tally) => buildStage(tally, kind, parties, vote, partyId)),
        baseline: BASELINE_CHANCE,
        factors: (vote.factors ?? []).map((factor) => ({ ...factor, label: VOTE_FACTOR_LABELS[factor.key] })),
        against: kind !== 'law',
        impeachment: vote.impeachment ?? null,
      };
    });
  }, [votes, partyId, world]);
};
