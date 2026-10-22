/**
 * Plenário: explica de onde vem a chance de aprovar uma proposta e transforma o
 * resultado da votação em placar (513 deputados) e votos por bancada.
 * Nada aqui muda o resultado — só o torna visível para o jogador.
 */
import { CONGRESS, IDEOLOGY, ORDINARY_LAW_THRESHOLD, PEC_THRESHOLD, PLENARY } from '@/constants/balance';
import type { ChamberConfig } from '@/constants/balance';
import type {
  Chamber,
  ImpeachmentFacts,
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
import { calculateVoteChance, FLAG_PROVISIONAL_MEASURE, FLAG_STREET_PRESSURE } from './voteChance';
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

/** Primos usados para derivar ausências, abstenções e a Casa da derrota do mesmo sorteio da votação. */
const ABSENT_PRIME = 7919;
const ABSTENTION_PRIME = 104729;
const PEC_HOUSE_PRIME = 1299709;
/** Razão áurea: espalha os turnos em "sorteios" estáveis para as sessões de impeachment. */
const GOLDEN_RATIO = 0.618033988749895;

/** Parte fracionária de x × primo: espalha um único sorteio em números "independentes" (sem gastar o PRNG). */
const spread = (roll: number, prime: number): number => {
  const value = roll * prime;
  return value - Math.floor(value);
};

/** Votos "sim" exigidos: maioria dos votantes (lei), 3/5 (PEC) ou 2/3 (impeachment). */
type Requirement = 'majority' | 'pec' | 'impeachment';

const requiredVotes = (config: ChamberConfig, requirement: Requirement, voting: number): number => {
  if (requirement === 'pec') return config.pecVotes;
  if (requirement === 'impeachment') return config.impeachmentVotes;
  return Math.floor(voting / 2) + 1;
};

/** Placar com o resultado e a folga (em votos) dados: aprovado ⇒ sim ≥ exigido; rejeitado ⇒ sim < exigido. */
const buildTally = (chamber: Chamber, requirement: Requirement, approved: boolean, marginVotes: number, roll: number): VoteTally => {
  const config = PLENARY.chambers[chamber];
  const absent = config.absentMin + Math.floor(spread(roll, ABSENT_PRIME) * config.absentRange);
  const abstentions = config.abstentionMin + Math.floor(spread(roll, ABSTENTION_PRIME) * config.abstentionRange);
  const voting = config.seats - absent - abstentions;
  const required = requiredVotes(config, requirement, voting);
  const margin = Math.round(Math.abs(marginVotes));
  const yes = approved ? clamp(required + margin, required, voting) : clamp(required - 1 - margin, 0, required - 1);
  return { yes, no: voting - yes, abstentions, absent, required, chamber };
};

/**
 * Placar coerente com o resultado: a folga em votos é proporcional a (chance − sorteio),
 * então votações aprovadas por pouco saem apertadas. Lei ordinária precisa de maioria
 * dos votantes; PEC, de 3/5 da Casa.
 */
export const tallyVotes = (type: LegislativeType, chance: number, roll: number, chamber: Chamber = 'camara'): VoteTally =>
  buildTally(chamber, type === 'pec' ? 'pec' : 'majority', roll < chance, (chance - roll) * PLENARY.chambers[chamber].marginVotes, roll);

/**
 * Placares de uma proposta: lei ordinária só no plenário da Câmara; PEC nas duas Casas.
 * PEC rejeitada cai na Câmara ou, passando por pouco nela, no Senado.
 */
export const tallyBill = (type: LegislativeType, chance: number, roll: number): { camara: VoteTally; senado: VoteTally | null } => {
  if (type !== 'pec') return { camara: tallyVotes(type, chance, roll), senado: null };
  const approved = roll < chance;
  if (approved || spread(roll, PEC_HOUSE_PRIME) < PLENARY.pecChamberRejectionShare) {
    return { camara: tallyVotes(type, chance, roll), senado: approved ? tallyVotes(type, chance, roll, 'senado') : null };
  }
  const narrow = spread(roll, PEC_HOUSE_PRIME) * PLENARY.pecChamberNarrowMargin;
  return { camara: buildTally('camara', 'pec', true, narrow, roll), senado: tallyVotes(type, chance, roll, 'senado') };
};

/**
 * Placar de uma sessão de impeachment (2/3 da Casa). A folga cresce com o quanto
 * aprovação e base estão além (ou aquém) dos limites; o turno espalha ausências.
 */
export const tallyImpeachment = (chamber: Chamber, approved: boolean, facts: ImpeachmentFacts, turn: number): VoteTally => {
  const depth = Math.abs(facts.approvalLimit - facts.approval) + Math.abs(facts.supportLimit - facts.support);
  const roll = spread(turn, GOLDEN_RATIO);
  const config = PLENARY.chambers[chamber];
  return buildTally(chamber, 'impeachment', approved, Math.min(config.impeachmentMaxMargin, depth * config.impeachmentVotesPerPoint), roll);
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

/** Bancadas no Senado: os 81 senadores divididos na proporção das bancadas da Câmara. */
export const senateParties = (parties: readonly Party[]): Party[] => {
  const seated = parties.filter((party) => party.seats > 0);
  const senators = apportion(PLENARY.chambers.senado.seats, seated.map((party) => party.seats));
  return seated.map((party, index) => ({ ...party, seats: senators[index] }));
};

/**
 * Votos por bancada coerentes com o placar: cada partido adere conforme a afinidade
 * com o governo (logística); o corte é ajustado por bisseção para fechar o total de "sim".
 * `against` = votação contra o governo (impeachment): quem vota "sim" é quem tem menos afinidade.
 */
export const splitVotesByParty = (
  tally: VoteTally,
  parties: readonly Party[],
  ideology: { economic: number; social: number },
  playerPartyId: string | null,
  against = false,
): PartyVote[] => {
  const seated = parties.filter((party) => party.seats > 0);
  const others = apportion(tally.absent + tally.abstentions, seated.map((party) => party.seats));
  const voters = seated.map((party, index) => party.seats - others[index]);
  const affinities = seated.map((party) => {
    const affinity = partyAffinity(party, ideology, playerPartyId);
    return against ? 1 - affinity : affinity;
  });
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
