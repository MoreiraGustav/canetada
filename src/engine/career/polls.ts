/**
 * Pré-campanha: o jogador declara a pré-candidatura e, nos semestres antes da eleição,
 * sai uma pesquisa de intenção de voto que reflete a força dele naquele momento.
 */
import { CAREER } from '@/constants/balance';
import type { CareerContent, CareerNews, CareerOfficeId, CareerPoll, CareerState, Rng } from '@/types';
import { getNextElectionTurn } from '@/utils/careerCalendar';
import { clamp, lerp } from '@/utils/math';
import { createRng } from '../random';
import { evaluateCandidacy } from './candidacy';
import { electorateFor, seatsFor } from './elections';
import { findOffice, shortName } from './helpers';
import { firstRoundShares } from './rounds';
import { createCareerNews } from './text';

const HALF = 0.5;
const MIN_SHARE = 1;
const MAX_SHARE = 85;
/** Projeção proporcional: votos de 20% a 140% do quociente conforme a chance. */
const PROJECTION = { min: 0.2, max: 1.4 } as const;
const NOISE_SCALE = 50;

const noise = (rng: Rng): number => (rng.next() * 2 - 1) * CAREER.polls.noise;

/** Semestre da próxima eleição do cargo. */
const electionTurnOf = (state: CareerState, content: CareerContent, officeId: CareerOfficeId): number | null => {
  const office = findOffice(content, officeId);
  return office ? getNextElectionTurn(state.turn, office.cycle) : null;
};

/** Pesquisa do momento: a força de hoje, avaliada como se a eleição fosse agora. */
export const pollFor = (state: CareerState, content: CareerContent, officeId: CareerOfficeId, rng: Rng): CareerPoll | null => {
  const office = findOffice(content, officeId);
  const electionTurn = electionTurnOf(state, content, officeId);
  if (!office || electionTurn === null) return null;
  // Prévia e adversário só se definem no semestre da eleição: a pesquisa os projeta lá.
  const option = evaluateCandidacy({ ...state, turn: electionTurn }, content, office);
  // Sem o sorteio da eleição: a vantagem esperada (chance − 0,5) com o ruído da pesquisa.
  const expected = firstRoundShares((option.chance - HALF) * CAREER.runoff.leadSpread + noise(rng), CAREER.runoff.othersBase + noise(rng));
  if (office.system === 'proporcional') {
    const quotient = electorateFor(state, content, office) / Math.max(1, seatsFor(state, content, office));
    const projected = quotient * lerp(PROJECTION.min, PROJECTION.max, option.chance) * (1 + noise(rng) / NOISE_SCALE);
    return { turn: state.turn, officeId, share: 0, opponentShare: null, opponentName: null, projectedVotes: Math.round(projected), quotient: Math.round(quotient) };
  }
  return {
    turn: state.turn,
    officeId,
    share: clamp(expected.player, MIN_SHARE, MAX_SHARE),
    opponentShare: clamp(expected.opponent, MIN_SHARE, MAX_SHARE),
    opponentName: option.adversary ? shortName(option.adversary.name) : null,
    projectedVotes: null,
    quotient: null,
  };
};

const pollHeadline = (state: CareerState, poll: CareerPoll): string => {
  const name = state.profile.politicalName;
  if (poll.projectedVotes !== null && poll.quotient !== null) {
    const verdict = poll.projectedVotes >= poll.quotient ? 'dentro' : 'fora';
    return `Projeção: ${name} teria ${poll.projectedVotes.toLocaleString('pt-BR')} votos, ${verdict} da conta das vagas`;
  }
  const rival = poll.opponentName ? `; ${poll.opponentName}, ${Math.round(poll.opponentShare ?? 0)}%` : '';
  return `Pesquisa: ${name} tem ${Math.round(poll.share)}% das intenções de voto${rival}`;
};

/** Fim de semestre: nova pesquisa se a eleição da pré-candidatura está perto; depois dela, a pré-candidatura acaba. */
export const stepPolls = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const officeId = state.preCandidacy;
  if (!officeId) return { state, news: [] };
  const electionTurn = electionTurnOf(state, content, officeId);
  if (electionTurn === null || electionTurn === state.turn) return { state: { ...state, preCandidacy: null }, news: [] };
  if (electionTurn - state.turn > CAREER.polls.horizon) return { state, news: [] };
  const rng = createRng(state.seed);
  const poll = pollFor(state, content, officeId, rng);
  if (!poll) return { state, news: [] };
  return {
    state: { ...state, seed: rng.getSeed(), polls: [...(state.polls ?? []), poll].slice(-CAREER.polls.history) },
    news: [createCareerNews(state.turn, pollHeadline(state, poll), 'neutral', 'pesquisa')],
  };
};

/** Lança (ou retira) a pré-candidatura: as pesquisas recomeçam para o novo cargo. */
export const declarePreCandidacy = (state: CareerState, content: CareerContent, officeId: CareerOfficeId | null): { state: CareerState; news: CareerNews[] } => {
  const office = officeId ? findOffice(content, officeId) : undefined;
  if (!office) return { state: { ...state, preCandidacy: null, polls: [] }, news: [] };
  const title = office.titles[state.profile.sex];
  const text = `${state.profile.politicalName} lança pré-candidatura e mira a vaga de ${title}`;
  const rng = createRng(state.seed);
  const poll = pollFor(state, content, office.id, rng);
  return {
    state: { ...state, seed: rng.getSeed(), preCandidacy: office.id, polls: poll ? [poll] : [], flags: { ...state.flags, 'pre-candidatura': state.turn } },
    news: [createCareerNews(state.turn, text, 'neutral', 'pre-candidatura')],
  };
};
