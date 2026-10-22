/**
 * Plenário: explica de onde vem a chance de aprovar uma proposta e transforma o
 * resultado da votação em placar (513 deputados) e votos por bancada.
 * Nada aqui muda o resultado — só o torna visível para o jogador.
 */
import { CONGRESS, IDEOLOGY, ORDINARY_LAW_THRESHOLD, PEC_THRESHOLD, PLENARY } from '@/constants/balance';
import type {
  LegislativeType,
  Party,
  PartyVote,
  SimulationState,
  VoteChanceBreakdown,
  VoteChanceParams,
  VoteFactor,
  VoteFactorKey,
  VoteTally,
} from '@/types';
import { clamp } from '@/utils/math';
import { isFlagActive } from './conditions';
import { calculateVoteChance, FLAG_PROVISIONAL_MEASURE, FLAG_STREET_PRESSURE } from './congress';
/** Variações de chance menores que isso não aparecem como fator. */
const FACTOR_EPSILON = 0.0005;

interface FactorStep {
  key: VoteFactorKey;
  params: VoteChanceParams;
}

/**
 * Decompõe a chance de aprovação: parte de 50% (base no limiar, aprovação de
 * referência) e soma, um de cada vez, base aliada, aprovação popular, negociação,
 * habilidade do presidente, militância nas ruas e medida provisória. Os deltas
 * somam exatamente a chance final.
 */
export const explainVoteChance = (state: SimulationState, type: LegislativeType, negotiate: boolean): VoteChanceBreakdown => {
  const neutral: VoteChanceParams = {
    type,
    support: type === 'pec' ? PEC_THRESHOLD : ORDINARY_LAW_THRESHOLD,
    approval: CONGRESS.voteApprovalReference,
    negotiate: false,
    voteChanceBonus: 0,
  };
  const street = isFlagActive(state, FLAG_STREET_PRESSURE, 0) ? IDEOLOGY.streetPressureVoteBonus : 0;
  const provisional = isFlagActive(state, FLAG_PROVISIONAL_MEASURE, 0);
  const ability = state.modifiers.voteChanceBonus;
  const withSupport = { ...neutral, support: state.congress.support };
  const withApproval = { ...withSupport, approval: state.approval };
  const withNegotiation = { ...withApproval, negotiate };
  const withAbility = { ...withNegotiation, voteChanceBonus: ability };
  const withStreet = { ...withAbility, voteChanceBonus: ability + street };
  const steps: FactorStep[] = [
    { key: 'support', params: withSupport },
    { key: 'approval', params: withApproval },
    { key: 'negotiation', params: withNegotiation },
    { key: 'ability', params: withAbility },
    { key: 'street-pressure', params: withStreet },
    {
      key: 'provisional-measure',
      params: { ...withStreet, voteChanceBonus: withStreet.voteChanceBonus + (provisional ? IDEOLOGY.provisionalMeasureVoteBonus : 0), provisionalMeasure: provisional },
    },
  ];
  const baseline = calculateVoteChance(neutral);
  let previous = baseline;
  const factors: VoteFactor[] = [];
  steps.forEach(({ key, params }) => {
    const chance = calculateVoteChance(params);
    const delta = chance - previous;
    // Base e aprovação sempre aparecem; os bônus, só quando valem algo.
    if (key === 'support' || key === 'approval' || Math.abs(delta) > FACTOR_EPSILON) factors.push({ key, delta });
    previous = chance;
  });
  return { chance: previous, baseline, factors };
};

/** Primos usados para derivar ausências e abstenções do mesmo sorteio da votação. */
const ABSENT_PRIME = 7919;
const ABSTENTION_PRIME = 104729;

/** Parte fracionária de x × primo: espalha um único sorteio em números "independentes" (sem gastar o PRNG). */
const spread = (roll: number, prime: number): number => {
  const value = roll * prime;
  return value - Math.floor(value);
};

/**
 * Placar coerente com o resultado: a folga em votos é proporcional a (chance − sorteio),
 * então votações aprovadas por pouco saem apertadas. Lei ordinária precisa de maioria
 * dos votantes; PEC, de 308 votos.
 */
export const tallyVotes = (type: LegislativeType, chance: number, roll: number): VoteTally => {
  const approved = roll < chance;
  const absent = PLENARY.absentMin + Math.floor(spread(roll, ABSENT_PRIME) * PLENARY.absentRange);
  const abstentions = PLENARY.abstentionMin + Math.floor(spread(roll, ABSTENTION_PRIME) * PLENARY.abstentionRange);
  const voting = PLENARY.seats - absent - abstentions;
  const required = type === 'pec' ? PLENARY.pecVotes : Math.floor(voting / 2) + 1;
  const swing = Math.round((chance - roll) * PLENARY.marginVotes);
  const yes = approved ? clamp(required + Math.max(0, swing), required, voting) : clamp(required - 1 + Math.min(0, swing), 0, required - 1);
  return { yes, no: voting - yes, abstentions, absent, required };
};

/** Distribui `total` entre pesos com arredondamento pelo maior resto (a soma fecha exata). */
const apportion = (total: number, weights: readonly number[]): number[] => {
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  if (sum <= 0) return weights.map(() => 0);
  const raw = weights.map((weight) => (weight / sum) * total);
  const floors = raw.map(Math.floor);
  const order = raw.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest);
  let missing = total - floors.reduce((acc, value) => acc + value, 0);
  for (const { index } of order) {
    if (missing <= 0) break;
    floors[index] += 1;
    missing -= 1;
  }
  return floors;
};

/** Afinidade (0–1) de uma bancada com o governo: o próprio partido é 1; os outros, pela distância no espectro. */
const partyAffinity = (party: Party, ideology: { economic: number; social: number }, playerPartyId: string | null): number => {
  if (party.id === playerPartyId) return 1;
  const distance = Math.hypot(party.economicIdeology - ideology.economic, party.socialIdeology - ideology.social);
  return clamp(1 - distance / PLENARY.partyAffinityRange, 0, 1);
};

const logistic = (x: number): number => 1 / (1 + Math.exp(-x));

/** Nenhuma bancada dá mais "sim" do que tem votantes: o excedente passa às bancadas com folga, mantendo o total. */
const fitWithinCapacity = (votes: readonly number[], capacity: readonly number[]): number[] => {
  const fitted = votes.map((value, index) => Math.min(value, capacity[index]));
  let excess = votes.reduce((acc, value, index) => acc + Math.max(0, value - capacity[index]), 0);
  for (let index = 0; index < fitted.length && excess > 0; index += 1) {
    const room = Math.min(excess, capacity[index] - fitted[index]);
    fitted[index] += room;
    excess -= room;
  }
  return fitted;
};

/**
 * Votos por bancada coerentes com o placar: cada partido adere conforme a afinidade
 * com o governo (logística); o corte é ajustado por bisseção para fechar o total de "sim".
 */
export const splitVotesByParty = (
  tally: VoteTally,
  parties: readonly Party[],
  ideology: { economic: number; social: number },
  playerPartyId: string | null,
): PartyVote[] => {
  const seated = parties.filter((party) => party.seats > 0);
  const others = apportion(tally.absent + tally.abstentions, seated.map((party) => party.seats));
  const voters = seated.map((party, index) => party.seats - others[index]);
  const affinities = seated.map((party) => partyAffinity(party, ideology, playerPartyId));
  const yesShare = (cut: number): number[] => affinities.map((affinity) => logistic(PLENARY.partySteepness * (affinity - cut)));
  const expectedYes = (cut: number): number => yesShare(cut).reduce((acc, share, index) => acc + share * voters[index], 0);
  let low = -1;
  let high = 2;
  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2;
    if (expectedYes(mid) > tally.yes) low = mid;
    else high = mid;
  }
  const shares = yesShare((low + high) / 2);
  const yes = fitWithinCapacity(apportion(tally.yes, shares.map((share, index) => share * voters[index])), voters);
  return seated.map((party, index) => ({ partyId: party.id, seats: party.seats, yes: yes[index], no: voters[index] - yes[index], other: others[index] }));
};
