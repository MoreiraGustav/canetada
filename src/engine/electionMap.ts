/**
 * Noite da eleição: votos do candidato em cada estado, coerentes com o resultado
 * nacional (a média ponderada pela população fecha o total), e a ordem em que os
 * estados divulgam a apuração — com virada para dar suspense.
 */
import { ELECTION_MAP, IDEOLOGY } from '@/constants/balance';
import type { BrazilianState } from '@/types';
import { clamp } from '@/utils/math';

const HALF_OF_VOTES = 50;

/** Resultado do candidato num estado e quando o estado começa a divulgar (0–maxReportDelay). */
export interface StateVote {
  stateId: string;
  /** % dos votos válidos do candidato no estado. */
  share: number;
  /** Fração da apuração em que o estado começa a divulgar. */
  reportDelay: number;
}

const affinity = (ideology: { economic: number; social: number }, uf: BrazilianState): number =>
  clamp(1 - Math.hypot(ideology.economic - uf.lean.economic, ideology.social - uf.lean.social) / IDEOLOGY.affinityRange, 0, 1);

/**
 * Votos por estado: total nacional + afinidade do eleitorado (relativa à média) + bônus de
 * visitas recentes (`visitBonus`, reeleição). Os desvios têm média zero ponderada pela
 * população, então o país soma o resultado nacional (salvo estados no limite).
 * Para a virada: quem vence vê primeiro os estados onde vai pior; quem perde, o contrário.
 */
export const computeStateVotes = (
  nationalShare: number,
  ideology: { economic: number; social: number },
  states: readonly BrazilianState[],
  visitBonus: Readonly<Record<string, number>> = {},
): StateVote[] => {
  const population = states.reduce((acc, uf) => acc + uf.population, 0);
  const raw = states.map(
    (uf) => ELECTION_MAP.leanWeight * affinity(ideology, uf) + ELECTION_MAP.visitWeight * (visitBonus[uf.id] ?? 0),
  );
  const mean = raw.reduce((acc, value, index) => acc + value * states[index].population, 0) / Math.max(1, population);
  const shares = states.map((uf, index) => ({
    stateId: uf.id,
    share: clamp(nationalShare + raw[index] - mean, ELECTION_MAP.minShare, ELECTION_MAP.maxShare),
  }));
  const won = nationalShare > HALF_OF_VOTES;
  const order = [...shares].sort((a, b) => (won ? a.share - b.share : b.share - a.share)).map((entry) => entry.stateId);
  const last = Math.max(1, order.length - 1);
  return shares.map((entry) => ({ ...entry, reportDelay: (order.indexOf(entry.stateId) / last) * ELECTION_MAP.maxReportDelay }));
};

/** Fração apurada de um estado no instante `progress` (0–1) da noite. */
export const reportedFraction = (vote: StateVote, progress: number): number =>
  clamp((progress - vote.reportDelay) / (1 - ELECTION_MAP.maxReportDelay), 0, 1);

/** Parcial nacional do candidato no instante `progress`: média dos votos já apurados, pesados pela população. */
export const nationalPartial = (
  votes: readonly StateVote[],
  states: readonly BrazilianState[],
  progress: number,
): { share: number; counted: number } => {
  const population = Object.fromEntries(states.map((uf) => [uf.id, uf.population]));
  const totals = votes.reduce(
    (acc, vote) => {
      const counted = reportedFraction(vote, progress) * (population[vote.stateId] ?? 0);
      return { votes: acc.votes + counted * vote.share, counted: acc.counted + counted };
    },
    { votes: 0, counted: 0 },
  );
  const all = states.reduce((acc, uf) => acc + uf.population, 0);
  return { share: totals.counted > 0 ? totals.votes / totals.counted : HALF_OF_VOTES, counted: totals.counted / Math.max(1, all) };
};
