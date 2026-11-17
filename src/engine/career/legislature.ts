/**
 * Mandato no Legislativo: a Casa do parlamentar, a votação importante do semestre
 * (orientação do partido, opinião pública e coerência) e o placar do plenário.
 */
import { CAREER } from '@/constants/balance';
import { CHAMBER_OF_DEPUTIES_SEATS, LEGISLATIVE_HOUSES, SENATE_SEATS } from '@/constants/career';
import type {
  CareerContent,
  CareerImpact,
  CareerLegislature,
  CareerNews,
  CareerOffice,
  CareerState,
  FloorVote,
  FloorVoteChoice,
  FloorVoteRecord,
  Rng,
  FloorTally,
} from '@/types';
import { clamp } from '@/utils/math';
import { createRng, pickWeighted, randomBetween } from '../random';
import { evaluateCareerConditions } from './conditions';
import { seatsFor } from './elections';
import { currentOffice, findParty, getGovernmentRelation } from './helpers';
import { applyCareerImpact } from './impacts';
import { createCareerNews } from './text';

type Side = Exclude<FloorVoteChoice, 'abstencao'>;

/** Abaixo desta distância do centro, a votação não divide esquerda e direita. */
const IDEOLOGY_NEUTRAL = 15;
const PARTY_IDEOLOGY_WEIGHT = 0.8;
const GOVERNMENT_DISCIPLINE: Record<ReturnType<typeof getGovernmentRelation>, number> = { own: 1, ally: 0.5, opposition: -1 };
const HALF = 50;
const PERCENT = 100;
const MIN_SHARE = 0.05;
const MAX_SHARE = 0.95;

export const createLegislature = (): CareerLegislature => ({
  floorVoteId: null,
  bills: [],
  billHistory: [],
  voteHistory: [],
  votesWithParty: 0,
  votesAgainstParty: 0,
  amendmentsTotal: 0,
  floorVoteLog: {},
});

export const withLegislature = (state: CareerState, patch: Partial<CareerLegislature>): CareerState => ({
  ...state,
  legislature: { ...state.legislature, ...patch },
});

/** Mandato no Legislativo (vereador, deputado, senador), ou undefined. */
export const legislativeOffice = (state: CareerState, content: CareerContent): CareerOffice | undefined => {
  const office = currentOffice(state, content);
  return office?.branch === 'legislativo' ? office : undefined;
};

/** Cadeiras da Casa: Câmara Municipal (TSE), Assembleia (CF, art. 27), Câmara (513) ou Senado (81). */
export const chamberSeats = (state: CareerState, content: CareerContent, office: CareerOffice): number => {
  if (office.id === 'deputado-federal') return CHAMBER_OF_DEPUTIES_SEATS;
  if (office.id === 'senador') return SENATE_SEATS;
  return seatsFor(state, content, office);
};

export const houseName = (office: CareerOffice): string => LEGISLATIVE_HOUSES[office.id]?.short ?? 'Plenário';

/** Placar de uma votação a partir da fração de apoio (com ausentes). */
export const tallyFor = (seats: number, share: number): FloorTally => {
  const present = Math.max(1, Math.round(seats * (1 - CAREER.legislature.absentShare)));
  const yes = Math.round(present * clamp(share, MIN_SHARE, MAX_SHARE));
  return { yes, no: present - yes };
};

// ─── Posições ─────────────────────────────────────────────────────────────

interface Ideology {
  economicIdeology: number;
  socialIdeology: number;
}

/** Lado natural pela ideologia (mais perto da posição do "sim" ou do oposto), ou null se a pauta não é ideológica. */
export const ideologicalSide = (who: Ideology, vote: { economic: number; social: number }): Side | null => {
  if (Math.hypot(vote.economic, vote.social) < IDEOLOGY_NEUTRAL) return null;
  const yes = Math.hypot(who.economicIdeology - vote.economic, who.socialIdeology - vote.social);
  const no = Math.hypot(who.economicIdeology + vote.economic, who.socialIdeology + vote.social);
  return yes <= no ? 'sim' : 'nao';
};

/** Orientação do partido: disciplina com o governo (nas propostas dele) + ideologia; empate segue a Mesa ("sim"). */
export const partyLineFor = (state: CareerState, content: CareerContent, vote: FloorVote, office: CareerOffice): Side => {
  const party = findParty(content, state.partyId);
  const side = party ? ideologicalSide(party, vote) : null;
  const discipline = vote.government ? GOVERNMENT_DISCIPLINE[getGovernmentRelation(state, content, office.level)] : 0;
  const score = discipline + (side === null ? 0 : side === 'sim' ? PARTY_IDEOLOGY_WEIGHT : -PARTY_IDEOLOGY_WEIGHT);
  return score < 0 ? 'nao' : 'sim';
};

/** Lado coerente com a ideologia do personagem (ou com a opinião pública, se a pauta não é ideológica). */
export const naturalSideFor = (state: CareerState, vote: FloorVote): Side =>
  ideologicalSide(state.profile, vote) ?? (vote.publicSupport >= HALF ? 'sim' : 'nao');

// ─── Sorteio da votação do semestre ───────────────────────────────────────

const isFloorVoteOpen = (state: CareerState, content: CareerContent, vote: FloorVote, office: CareerOffice): boolean => {
  const last = state.legislature.floorVoteLog[vote.id];
  if (last !== undefined && state.turn - last < CAREER.legislature.vote.cooldown) return false;
  if (!vote.levels.includes(office.level) || !evaluateCareerConditions(state, content, vote.conditions)) return false;
  // Proposta do governo só entra em pauta se combina com quem governa.
  const governing = findParty(content, state.governments[office.level].partyId);
  return !vote.government || !governing || ideologicalSide(governing, vote) !== 'nao';
};

export const getOpenFloorVotes = (state: CareerState, content: CareerContent, office: CareerOffice): FloorVote[] =>
  content.floorVotes.filter((vote) => isFloorVoteOpen(state, content, vote, office));

/** Início do semestre: quem tem mandato legislativo recebe a votação do semestre. */
export const drawFloorVote = (state: CareerState, content: CareerContent): CareerState => {
  const office = legislativeOffice(state, content);
  if (!office) return state.legislature.floorVoteId === null ? state : withLegislature(state, { floorVoteId: null });
  if (state.legislature.floorVoteId !== null) return state;
  const rng = createRng(state.seed);
  const vote = pickWeighted(rng, getOpenFloorVotes(state, content, office).map((item) => ({ item, weight: 1 })));
  return withLegislature({ ...state, seed: rng.getSeed() }, { floorVoteId: vote?.id ?? null });
};

export const findFloorVote = (content: CareerContent, id: string | null): FloorVote | undefined =>
  id === null ? undefined : content.floorVotes.find((vote) => vote.id === id);

// ─── Consequências do voto ────────────────────────────────────────────────

/** Opinião pública a favor da posição escolhida → popularidade (no Congresso, metade vira reconhecimento nacional). */
const publicImpact = (vote: FloorVote, choice: Side, office: CareerOffice): CareerImpact => {
  const rules = CAREER.legislature.vote;
  const favor = choice === 'sim' ? vote.publicSupport : PERCENT - vote.publicSupport;
  const points = (favor - HALF) * rules.publicPerPoint;
  if (office.level !== 'federal') return { localPopularity: points };
  return { localPopularity: points * (1 - rules.nationalShare), nationalRecognition: points * rules.nationalShare };
};

/** Impactos do voto: partido, opinião pública e coerência com a própria ideologia. */
export const voteImpacts = (state: CareerState, content: CareerContent, vote: FloorVote, office: CareerOffice, choice: FloorVoteChoice): CareerImpact[] => {
  const rules = CAREER.legislature.vote;
  if (choice === 'abstencao') return [rules.abstention];
  const partyLine = partyLineFor(state, content, vote, office);
  const coherent = choice === naturalSideFor(state, vote);
  return [
    choice === partyLine ? rules.withParty : rules.againstParty,
    publicImpact(vote, choice, office),
    { electoralBase: coherent ? rules.coherence : -rules.coherence },
  ];
};

/** Apoio no plenário (fração): base aliada nas propostas do governo, opinião pública e ruído. */
const floorShare = (vote: FloorVote, rng: Rng): number => {
  const rules = CAREER.legislature.vote;
  const support = HALF + (vote.government ? rules.governmentSupport : 0) + (vote.publicSupport - HALF) * rules.publicWeight;
  return (support + randomBetween(rng, -rules.noise, rules.noise)) / PERCENT;
};

const voteHeadline = (state: CareerState, content: CareerContent, vote: FloorVote, office: CareerOffice, record: FloorVoteRecord): string => {
  const verdict = record.passed ? 'aprova' : 'rejeita';
  const base = `${houseName(office)} ${verdict} ${vote.title.toLowerCase()} por ${record.tally.yes} a ${record.tally.no}`;
  if (record.choice === 'abstencao') return `${base}; ${state.profile.politicalName} se abstém`;
  const party = findParty(content, state.partyId)?.acronym ?? 'partido';
  return record.choice === record.partyLine ? base : `${base}; ${state.profile.politicalName} contraria o ${party}`;
};

/** Vota a pauta do semestre (sem escolha, segue a orientação do partido) e registra o placar. */
export const castFloorVote = (state: CareerState, content: CareerContent, choice: FloorVoteChoice | null): { state: CareerState; news: CareerNews[] } => {
  const office = legislativeOffice(state, content);
  const vote = findFloorVote(content, state.legislature.floorVoteId);
  if (!office || !vote) return { state, news: [] };
  const partyLine = partyLineFor(state, content, vote, office);
  const chosen = choice ?? partyLine;
  const rng = createRng(state.seed);
  const tally = tallyFor(chamberSeats(state, content, office), floorShare(vote, rng));
  const record: FloorVoteRecord = { voteId: vote.id, turn: state.turn, officeId: office.id, choice: chosen, partyLine, passed: tally.yes > tally.no, tally };
  const impacted = voteImpacts(state, content, vote, office, chosen).reduce((acc, impact) => applyCareerImpact(acc, content, impact, vote.title), state);
  const { legislature } = impacted;
  const next = withLegislature(
    { ...impacted, seed: rng.getSeed() },
    {
      floorVoteId: null,
      voteHistory: [...legislature.voteHistory, record].slice(-CAREER.legislature.vote.history),
      votesWithParty: legislature.votesWithParty + (chosen === partyLine ? 1 : 0),
      votesAgainstParty: legislature.votesAgainstParty + (chosen !== partyLine && chosen !== 'abstencao' ? 1 : 0),
      floorVoteLog: { ...legislature.floorVoteLog, [vote.id]: state.turn },
    },
  );
  const tone = chosen === partyLine ? 'neutral' : 'negative';
  return { state: next, news: [createCareerNews(state.turn, voteHeadline(state, content, vote, office, record), tone, `votacao-${vote.id}`)] };
};
