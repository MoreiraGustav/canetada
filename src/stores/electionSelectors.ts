/**
 * Noite da eleição: apuração estado a estado na vitória da posse e na reeleição,
 * coerente com o resultado nacional já calculado pelo engine.
 */
import { useMemo } from 'react';
import { computeStateVotes, getStateApprovals, nationalPartial, reportedFraction } from '@/engine';
import type { StateVote } from '@/engine';
import type { ElectionContender, ElectionNightView, Portrait } from '@/types';
import { indexById } from '@/utils/math';
import { getBrazilianStates, getBrazilMap, getCandidate, getParty } from './content';
import { pickSimulationSlice } from './gameData';
import { assembleSimulationState } from './simulationBridge';
import { useGameStore } from './useGameStore';
import { useMetricsStore } from './useMetricsStore';
import { usePlayerStore } from './usePlayerStore';

const NEUTRAL_COLOR = '#7A766C';
const HALF_OF_VOTES = 50;

const contender = (name: string, partyId: string, candidateId: string | null | undefined, fallbackColor?: string): ElectionContender => {
  const party = getParty(partyId);
  const candidate = candidateId ? getCandidate(candidateId) : undefined;
  const portrait: Portrait = candidate?.portrait ?? {};
  return { name, party: party?.acronym ?? '', color: fallbackColor ?? party?.color ?? NEUTRAL_COLOR, portrait };
};

/** Funções da apuração (engine) para a animação consultar a cada quadro. */
const countingFunctions = (votes: readonly StateVote[]): Pick<ElectionNightView, 'reportedAt' | 'partialAt'> => {
  const byId = indexById(votes.map((vote) => ({ ...vote, id: vote.stateId })));
  const states = getBrazilianStates();
  return {
    reportedAt: (stateId, progress) => (byId[stateId] ? reportedFraction(byId[stateId], progress) : 0),
    partialAt: (progress) => nationalPartial(votes, states, progress),
  };
};

const buildStates = (votes: readonly StateVote[]): ElectionNightView['states'] => {
  const shapes = indexById(getBrazilMap().shapes);
  const byId = indexById(votes.map((vote) => ({ ...vote, id: vote.stateId })));
  return getBrazilianStates().map((uf) => ({
    id: uf.id,
    uf: uf.uf,
    name: uf.name,
    population: uf.population,
    shape: shapes[uf.id] ?? null,
    share: byId[uf.id]?.share ?? HALF_OF_VOTES,
    reportDelay: byId[uf.id]?.reportDelay ?? 0,
  }));
};

/** Noite da posse: o 2º turno contra o adversário, com o eleitorado de cada estado. */
export const useFirstElectionNight = (): ElectionNightView | null => {
  const candidate = usePlayerStore((state) => state.candidate);
  const election = usePlayerStore((state) => state.election);
  return useMemo(() => {
    if (!candidate || !election) return null;
    const ideology = { economic: candidate.economicIdeology, social: candidate.socialIdeology };
    const votes = computeStateVotes(election.voteShare, ideology, getBrazilianStates());
    return {
      title: 'Apuração do 2º turno',
      viewBox: getBrazilMap().viewBox,
      player: { ...contender(candidate.name, candidate.partyId, candidate.archetypeId, candidate.color) },
      opponent: contender(election.opponentName, election.opponentPartyId, election.opponentId),
      nationalShare: election.voteShare,
      won: election.voteShare > HALF_OF_VOTES,
      states: buildStates(votes),
      ...countingFunctions(votes),
    };
  }, [candidate, election]);
};

/** Noite da reeleição: contra o líder da oposição, com o peso das viagens recentes em cada estado. */
export const useReelectionNight = (): ElectionNightView | null => {
  const candidate = usePlayerStore((state) => state.candidate);
  const opposition = usePlayerStore((state) => state.cast?.opposition ?? null);
  const reelection = useGameStore((state) => state.reelection);
  const metrics = useMetricsStore((state) => state.metrics);
  return useMemo(() => {
    if (!candidate || !reelection) return null;
    const state = assembleSimulationState(pickSimulationSlice(useGameStore.getState()));
    const visitBonus = Object.fromEntries(getStateApprovals(state, getBrazilianStates()).map((entry) => [entry.stateId, entry.visitBonus]));
    const ideology = { economic: metrics.ideologyEconomic, social: metrics.ideologySocial };
    const votes = computeStateVotes(reelection.voteShare, ideology, getBrazilianStates(), visitBonus);
    return {
      title: 'Apuração da reeleição',
      viewBox: getBrazilMap().viewBox,
      player: contender(candidate.name, candidate.partyId, candidate.archetypeId, candidate.color),
      opponent: opposition
        ? contender(opposition.name, opposition.partyId, opposition.candidateId)
        : { name: 'Candidato da oposição', party: '', color: NEUTRAL_COLOR, portrait: {} },
      nationalShare: reelection.voteShare,
      won: reelection.reelected,
      states: buildStates(votes),
      ...countingFunctions(votes),
    };
  }, [candidate, opposition, reelection, metrics]);
};
