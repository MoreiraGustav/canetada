/**
 * Da carreira ao Planalto: o personagem vira um `PlayerCandidate` do jogo
 * presidencial (trajetória pela profissão, habilidade pelo ponto forte da
 * carreira, capital político pela influência e pela reputação) e disputa o
 * 2º turno com as respostas do debate presidencial.
 */
import { CAREER, ELECTION } from '@/constants/balance';
import type {
  AbilityId,
  CampaignOption,
  CareerContent,
  CareerElectionRecord,
  CareerMetricKey,
  CareerState,
  ElectionResult,
  FaceSex,
  GameContent,
  PlayerCandidate,
} from '@/types';
import { clamp } from '@/utils/math';
import { generateName } from '../cast';
import { buildElectionResult, buildPlayerCandidate, campaignVoteDelta } from '../election';
import { createRng, randomBetween } from '../random';
import { ballotNumber, evaluateCandidacy } from './candidacy';
import { electorateFor } from './elections';
import { findOffice, findParty } from './helpers';
import { vacatePosition } from './positions';
import { electorateLean, pickGoverningParty } from './world';

const PRESIDENT = 'presidente';
const HALF = 50;
const PERCENT = 100;
const FEMALE_SHARE = 0.5;
/** Soma típica das respostas do debate (3 perguntas): o que fica acima disso ajuda. */
const CAMPAIGN_BASELINE = 3;

/** O ponto forte da carreira vira a habilidade especial do presidente. */
const ABILITY_BY_METRIC: Record<CareerMetricKey, { abilityId: AbilityId; reason: string }> = {
  partyInfluence: { abilityId: 'articulador-nato', reason: 'anos de bastidores no partido' },
  reputation: { abilityId: 'ficha-limpa', reason: 'uma reputação sem manchas' },
  nationalRecognition: { abilityId: 'carisma-popular', reason: 'um nome conhecido no país inteiro' },
  localPopularity: { abilityId: 'carisma-popular', reason: 'o carisma de quem é querido em casa' },
  electoralBase: { abilityId: 'negociador-habil', reason: 'uma rede de lideranças construída voto a voto' },
};

export const deriveCareerAbility = (state: CareerState): { abilityId: AbilityId; reason: string } => {
  const [best] = (Object.keys(ABILITY_BY_METRIC) as CareerMetricKey[]).sort((a, b) => state.metrics[b] - state.metrics[a]);
  return ABILITY_BY_METRIC[best];
};

/** Candidato presidencial a partir da carreira (como um candidato criado, mais o capital político). */
export const buildCareerCandidate = (state: CareerState, careerContent: CareerContent, gameContent: GameContent): PlayerCandidate => {
  const profession = careerContent.professions.find((entry) => entry.id === state.profile.professionId);
  const base = buildPlayerCandidate(
    {
      kind: 'custom',
      input: {
        name: state.profile.politicalName,
        partyId: state.partyId ?? careerContent.parties[0].id,
        economicIdeology: state.profile.economicIdeology,
        socialIdeology: state.profile.socialIdeology,
        background: profession?.background ?? 'politico-veterano',
        abilityId: deriveCareerAbility(state).abilityId,
      },
    },
    gameContent,
  );
  const { influenceToSupport, reputationToApproval } = CAREER.presidency;
  return {
    ...base,
    emblem: profession?.icon ?? base.emblem,
    portrait: { seed: state.profile.portraitSeed, traits: { sex: state.profile.sex } },
    startingImpact: {
      ...base.startingImpact,
      // Influência construída na carreira vira base aliada; reputação vira aprovação.
      congressSupport: (base.startingImpact.congressSupport ?? 0) + (state.metrics.partyInfluence - HALF) * influenceToSupport,
      approval: (base.startingImpact.approval ?? 0) + (state.metrics.reputation - HALF) * reputationToApproval,
    },
  };
};

export interface CareerPresidentialOutcome {
  won: boolean;
  /** Resultado no formato do jogo presidencial (só usado se `won`). */
  election: ElectionResult;
  record: CareerElectionRecord;
  state: CareerState;
}

/**
 * 2º turno presidencial na carreira: força eleitoral da carreira + debate.
 * Votos = 50 + peso × (força − dificuldade) + (debate − referência) + ruído.
 */
export const calculateCareerPresidentialElection = (
  state: CareerState,
  careerContent: CareerContent,
  gameContent: GameContent,
  candidate: PlayerCandidate,
  options: readonly CampaignOption[],
): CareerPresidentialOutcome => {
  const office = findOffice(careerContent, PRESIDENT);
  const option = office ? evaluateCandidacy(state, careerContent, office) : null;
  const rng = createRng(state.seed);
  const { strengthToShare, campaignWeight, noise, minShare, maxShare } = CAREER.presidency;
  const gap = option ? option.strength - option.difficulty : 0;
  const campaign = campaignWeight * (campaignVoteDelta(candidate, options) - CAMPAIGN_BASELINE);
  const voteShare = clamp(HALF + strengthToShare * gap + campaign + randomBetween(rng, -noise, noise), minShare, maxShare);
  const won = voteShare > HALF;
  const opponentParty = pickGoverningParty(rng, careerContent.parties, electorateLean(state, careerContent, 'federal'), state.partyId);
  const sex: FaceSex = rng.next() < FEMALE_SHARE ? 'f' : 'm';
  const opponent = { name: generateName(rng, careerContent.names, sex), partyId: opponentParty.id, sex };
  const election = buildElectionResult(candidate, Math.max(voteShare, ELECTION.minVoteShare), { name: opponent.name, partyId: opponent.partyId }, gameContent, rng);
  const record: CareerElectionRecord = {
    turn: state.turn,
    officeId: PRESIDENT,
    partyId: state.partyId ?? '',
    won,
    chance: option?.chance ?? 0,
    voteShare,
    votes: office ? Math.round((electorateFor(state, careerContent, office) * voteShare) / PERCENT) : 0,
    substitute: false,
    opponent,
    seats: null,
    partySeats: null,
    partyList: [],
    runningMate: null,
    strategyId: null,
    ballotNumber: office ? ballotNumber(state, careerContent, office) : null,
    campaign: {},
    spending: 0,
    primary: option?.primary ? { rivalName: option.primary.rival.name, won: true } : null,
    firstRound: null,
    runoff: null,
    strength: option?.strength ?? 0,
    difficulty: option?.difficulty ?? 0,
  };
  return { won, election, record, state: recordPresidentialRace({ ...state, seed: rng.getSeed() }, careerContent, record) };
};

/** Registra a disputa presidencial na trajetória (e o cargo a empossar, se venceu). */
const recordPresidentialRace = (state: CareerState, careerContent: CareerContent, record: CareerElectionRecord): CareerState => {
  const party = findParty(careerContent, state.partyId)?.acronym ?? '';
  const share = `${record.voteShare.toFixed(1).replace('.', ',')}%`;
  const name = state.profile.politicalName;
  const text = record.won ? `${name} (${party}) vence o 2º turno com ${share} e chega ao Planalto` : `${name} perde o 2º turno presidencial com ${share}`;
  return {
    ...state,
    pendingOffice: record.won ? PRESIDENT : null,
    elections: [...state.elections, record],
    timeline: [...state.timeline, { turn: state.turn, kind: record.won ? 'eleito' : 'derrota', text }],
  };
};

/** Posse no Planalto: a carreira registra o cargo e passa a vez ao jogo presidencial. */
export const enterPresidency = (state: CareerState, careerContent: CareerContent, termYears: number): CareerState => {
  const startTurn = state.turn + 1;
  const text = `${state.profile.politicalName} toma posse como ${state.profile.sex === 'f' ? 'presidenta' : 'presidente'} da República`;
  // Deixa o mandato anterior (ex.: governador no meio do mandato: o vice assume) e passa a governar o país.
  const closed = vacatePosition(state, careerContent, state.turn);
  const federal = { partyId: state.partyId ?? state.governments.federal.partyId, leaderName: state.profile.politicalName, leaderSex: state.profile.sex, isPlayer: true };
  return {
    ...closed,
    governments: { ...closed.governments, federal },
    turn: startTurn,
    pendingOffice: null,
    position: { kind: 'office', id: PRESIDENT, startTurn, endTurn: startTurn + termYears * 2 - 1, consecutiveTerms: 1 },
    administration: null,
    timeline: [...closed.timeline, { turn: startTurn, kind: 'presidencia', text }],
  };
};

/**
 * O vice assume a Presidência (sucessão): o "resultado" da posse vem da chapa
 * eleita (votos do vice) contra o adversário daquela eleição.
 */
export const successionElectionResult = (state: CareerState, gameContent: GameContent, candidate: PlayerCandidate): ElectionResult => {
  const ticket = [...state.elections].reverse().find((record) => record.officeId === 'vice-presidente' && record.won);
  const rng = createRng(state.seed);
  const voteShare = Math.max(ticket?.voteShare ?? ELECTION.minVoteShare, ELECTION.minVoteShare);
  const opponent = ticket?.opponent ?? { name: 'Candidato da oposição', partyId: '' };
  return buildElectionResult(candidate, voteShare, { name: opponent.name, partyId: opponent.partyId }, gameContent, rng);
};
