/**
 * Eleição do jogador: prévia contra o rival, campanha (escolhas, riscos e dinheiro),
 * votação (turno único, dois turnos ou proporcional com a lista do partido) e registro.
 */
import { CAREER } from '@/constants/balance';
import { STATE_ASSEMBLY_RULE, VALID_VOTES_PER_VOTER } from '@/constants/career';
import type {
  CampaignChoices,
  CampaignDecisionOption,
  CandidacyOption,
  CareerContent,
  CareerElectionRecord,
  CareerNews,
  CareerOffice,
  CareerPerson,
  CareerRound,
  CareerState,
  FaceSex,
  PartyListEntry,
  Rng,
} from '@/types';
import { getCareerDate } from '@/utils/careerCalendar';
import { clamp, lerp } from '@/utils/math';
import { generateName } from '../cast';
import { createRng } from '../random';
import { applyCampaignMarks, campaignSettlesPrimary, planCampaign, rollCampaignRisks } from './campaign';
import { chanceFor, evaluateCandidacy } from './candidacy';
import { changeRelation, getCharacter, shortName } from './characters';
import { findCity, findOffice, findParty } from './helpers';
import { applyCareerImpact } from './impacts';
import { decisiveShare, firstRoundOutcome, hasRunoff, rollFirstRound, runoffChanceFromLead, runoffShare } from './rounds';
import { createCareerNews, fillCareerText, getPositionTitle } from './text';
import { electorateLean, pickGoverningParty } from './world';

const PERCENT = 100;
const TOTAL_CHAMBER_SEATS = 513;
const FEMALE_SHARE = 0.5;
/** Votos do derrotado nas proporcionais: fração do quociente (mín./máx.). */
const LOSER_QUOTIENT = { min: 0.05, max: 0.4 } as const;
/** Diferença de votos entre posições vizinhas da lista do partido. */
const LIST_STEP = 0.14;
/** Folga mínima no cálculo de proximidade. */
const MIN_MARGIN = 0.1;
/** Relação: quem perde para você guarda mágoa (o adversário na urna, o rival na prévia). */
const DEFEATED_RELATION = -6;
const PRIMARY_LOSER_RELATION = -8;
const OTHER_CANDIDATES = 2;

// ─── Eleitorado e vagas ───────────────────────────────────────────────────

/** Votos válidos esperados na circunscrição do cargo (município, estado ou país). */
export const electorateFor = (state: CareerState, content: CareerContent, office: CareerOffice): number => {
  const statewide = office.level === 'estadual' || office.id === 'senador' || office.id === 'deputado-federal';
  const voters =
    office.level === 'municipal'
      ? findCity(content, state.profile.baseCityId)?.voters ?? 0
      : statewide
        ? content.stateVoters[state.profile.baseStateId] ?? 0
        : Object.values(content.stateVoters).reduce((acc, value) => acc + value, 0);
  return Math.round(voters * VALID_VOTES_PER_VOTER);
};

/** Vagas em disputa nas proporcionais: Câmara Municipal (TSE 2024), Assembleia e bancada federal. */
export const seatsFor = (state: CareerState, content: CareerContent, office: CareerOffice): number => {
  if (office.id === 'vereador') return findCity(content, state.profile.baseCityId)?.councilSeats ?? 0;
  const federal = content.states.find((entry) => entry.id === state.profile.baseStateId)?.seats ?? 0;
  if (office.id === 'deputado-federal') return federal;
  // Assembleia (art. 27): o triplo da bancada federal até 36; depois, +1 por deputado federal além de 12.
  const { multiplier, cap, federalThreshold } = STATE_ASSEMBLY_RULE;
  return federal * multiplier <= cap ? federal * multiplier : cap + (federal - federalThreshold);
};

// ─── Proporcional ─────────────────────────────────────────────────────────

const randomPerson = (rng: Rng, content: CareerContent, partyId: string): CareerPerson => {
  const sex: FaceSex = rng.next() < FEMALE_SHARE ? 'f' : 'm';
  return { name: generateName(rng, content.names, sex), partyId, sex };
};

interface ProportionalOutcome {
  votes: number;
  seats: number;
  partySeats: number;
  partyList: PartyListEntry[];
}

/** Nomes da lista do partido: o jogador na posição dele e o rival (se houver) logo acima ou abaixo. */
const listNames = (state: CareerState, rng: Rng, content: CareerContent, position: number): string[] => {
  const { listSize } = CAREER.election;
  const rival = getCharacter(state, 'rival');
  const rivalAhead = (rival?.strength ?? 0) > state.metrics.partyInfluence;
  const rivalSlot = !rival ? -1 : rivalAhead && position > 1 ? position - 1 : Math.min(position + 1, listSize);
  return Array.from({ length: listSize }, (_, index) => {
    if (index + 1 === position) return state.profile.politicalName;
    return index + 1 === rivalSlot && rival ? shortName(rival.name) : randomPerson(rng, content, '').name;
  });
};

/**
 * Proporcional: o partido leva vagas conforme sua bancada; o jogador entra se ficar entre os
 * mais votados da lista. Votos em torno do quociente (votos válidos / vagas).
 */
const proportionalOutcome = (state: CareerState, content: CareerContent, office: CareerOffice, won: boolean, closeness: number, rng: Rng): ProportionalOutcome => {
  const seats = Math.max(1, seatsFor(state, content, office));
  const quotient = electorateFor(state, content, office) / seats;
  const rawPartySeats = Math.round((seats * (findParty(content, state.partyId)?.seats ?? 0)) / TOTAL_CHAMBER_SEATS);
  const partySeats = won ? Math.max(1, rawPartySeats) : rawPartySeats;
  const { electedQuotientMin, electedQuotientMax, listSize } = CAREER.election;
  // Vitória folgada → mais votos e topo da lista; derrota apertada → suplente.
  const factor = won ? lerp(electedQuotientMin, electedQuotientMax, closeness) : lerp(LOSER_QUOTIENT.min, LOSER_QUOTIENT.max, closeness);
  const votes = Math.max(1, Math.round(quotient * factor));
  const shown = Math.min(partySeats, listSize - 1);
  const position = Math.min(won ? 1 + Math.floor((1 - closeness) * Math.max(1, shown)) : shown + 1, listSize);
  const partyList = listNames(state, rng, content, position).map((name, index): PartyListEntry => {
    const isPlayer = index + 1 === position;
    const others = Math.max(0.2, 1 + (position - (index + 1)) * LIST_STEP + (rng.next() - 0.5) * LIST_STEP);
    return { name, votes: isPlayer ? votes : Math.round(votes * others), elected: index < shown, isPlayer };
  });
  return { votes, seats, partySeats, partyList };
};

// ─── Registro ─────────────────────────────────────────────────────────────

const resultHeadline = (state: CareerState, office: CareerOffice, record: CareerElectionRecord): string => {
  const name = state.profile.politicalName;
  const title = office.titles[state.profile.sex];
  const share = `${record.voteShare.toFixed(1).replace('.', ',')}%`;
  const round = record.runoff ? ' no 2º turno' : record.firstRound ? ' no 1º turno' : '';
  if (record.primary && !record.primary.won) return `${name} perde a prévia do partido para ${shortName(record.primary.rivalName)}`;
  if (record.won && office.system === 'proporcional') return `${name} conquista vaga de ${title} com ${record.votes.toLocaleString('pt-BR')} votos`;
  if (record.won) return `Com ${share} dos votos${round}, ${name} vence e será ${title}`;
  if (record.substitute) return `${name} fica como suplente de ${title}`;
  return office.system === 'proporcional' ? `${name} não consegue vaga de ${title}` : `${name} perde a disputa para ${title} com ${share}${round}`;
};

/** Licença do cargo atual durante a campanha (volta a ele se perder). */
const leaveNews = (state: CareerState, content: CareerContent, office: CareerOffice): CareerNews => {
  const verb = state.profile.sex === 'f' ? 'licenciada' : 'licenciado';
  const text = `${state.profile.politicalName}, ${verb} de ${getPositionTitle(state, content)}, disputa vaga de ${office.titles[state.profile.sex]}`;
  return createCareerNews(state.turn, text, 'neutral', 'licenca');
};

/** Derrota com licença: volta ao cargo que já ocupava. */
const returnToPost = (state: CareerState, content: CareerContent): CareerState => {
  const text = `${state.profile.politicalName} perde a eleição e reassume o cargo de ${getPositionTitle(state, content)}`;
  return { ...state, timeline: [...state.timeline, { turn: state.turn, kind: 'retorno', text }] };
};

/** Tem cargo e disputa outro: está de licença na campanha. */
const isOnLeave = (state: CareerState, office: CareerOffice): boolean =>
  state.position !== null && !(state.position.kind === 'office' && state.position.id === office.id);

/** Registra o resultado: suplência, cargo a empossar, trajetória, manchete e a memória do adversário. */
const recordElection = (state: CareerState, content: CareerContent, office: CareerOffice, record: CareerElectionRecord): { state: CareerState; news: CareerNews[] } => {
  const headline = resultHeadline(state, office, record);
  const kind = record.won ? 'eleito' : record.substitute ? 'suplente' : 'derrota';
  const adversary = getCharacter(state, 'adversario');
  const year = getCareerDate(record.turn).year;
  const beatAdversary = record.won && adversary !== undefined && record.opponent?.name === adversary.name;
  const remembered = beatAdversary ? changeRelation(state, 'adversario', DEFEATED_RELATION, `Perdeu para você a eleição de ${year}`) : state;
  const recorded: CareerState = {
    ...remembered,
    flags: record.substitute ? { ...remembered.flags, [`suplente:${office.id}`]: record.turn } : remembered.flags,
    pendingOffice: record.won ? office.id : null,
    elections: [...remembered.elections, record],
    timeline: [...remembered.timeline, { turn: record.turn, kind, text: headline }],
  };
  return {
    state: isOnLeave(state, office) && !record.won ? returnToPost(recorded, content) : recorded,
    news: [createCareerNews(record.turn, headline, record.won ? 'positive' : 'negative', `eleicao-${office.id}`)],
  };
};

const emptyRecord = (state: CareerState, office: CareerOffice, option: CandidacyOption, choices: CampaignChoices, spending: number): CareerElectionRecord => ({
  turn: state.turn,
  officeId: office.id,
  partyId: state.partyId ?? '',
  won: false,
  chance: option.chance,
  voteShare: 0,
  votes: 0,
  substitute: false,
  opponent: null,
  seats: null,
  partySeats: null,
  partyList: [],
  runningMate: option.runningMate,
  strategyId: choices.tom ?? null,
  ballotNumber: option.ballotNumber,
  campaign: choices,
  spending,
  primary: null,
  firstRound: null,
  runoff: null,
  strength: option.strength,
  difficulty: option.difficulty,
});

// ─── Prévia ───────────────────────────────────────────────────────────────

export interface PrimaryResult {
  state: CareerState;
  /** Venceu (ou não houve prévia). */
  passed: boolean;
  /** Registro da derrota na prévia (null se passou). */
  record: CareerElectionRecord | null;
  news: CareerNews[];
}

/** Prévia contra o rival do partido, se ele quiser o mesmo cargo. Quem perde guarda a mágoa. */
export const runPrimary = (state: CareerState, content: CareerContent, office: CareerOffice, option: CandidacyOption, choices: CampaignChoices = {}): PrimaryResult => {
  if (!option.primary) return { state, passed: true, record: null, news: [] };
  if (campaignSettlesPrimary(content, office, choices)) {
    const text = `${state.profile.politicalName} fecha acordo com ${shortName(option.primary.rival.name)} e evita a prévia`;
    return { state, passed: true, record: null, news: [createCareerNews(state.turn, text, 'positive', 'previa')] };
  }
  const rng = createRng(state.seed);
  const passed = rng.next() < option.primary.chance;
  const rivalName = option.primary.rival.name;
  const year = getCareerDate(state.turn).year;
  const seeded = { ...state, seed: rng.getSeed() };
  if (passed) {
    const text = `${state.profile.politicalName} vence a prévia do partido contra ${shortName(rivalName)}`;
    return {
      state: changeRelation(seeded, 'rival', PRIMARY_LOSER_RELATION, `Perdeu para você a prévia de ${year}`),
      passed: true,
      record: null,
      news: [createCareerNews(state.turn, text, 'positive', 'previa')],
    };
  }
  const record: CareerElectionRecord = { ...emptyRecord(state, office, option, choices, 0), primary: { rivalName, won: false } };
  const recorded = recordElection(seeded, content, office, record);
  return { state: recorded.state, passed: false, record, news: recorded.news };
};

// ─── Votação ──────────────────────────────────────────────────────────────

export interface ElectionRun {
  state: CareerState;
  record: CareerElectionRecord | null;
  news: CareerNews[];
  /** Foi ao 2º turno: o registro espera `resolveRunoff`. */
  runoffPending: boolean;
}

/** Turno único ou proporcional: vence pela chance; votos coerentes com o resultado. */
const singleRound = (state: CareerState, content: CareerContent, office: CareerOffice, base: CareerElectionRecord, opponent: CareerPerson | null, rng: Rng): CareerElectionRecord => {
  const { chance } = base;
  const roll = rng.next();
  const won = roll < chance;
  // Proximidade (0–1): o quanto a vitória foi folgada ou a derrota apertada.
  const closeness = won ? clamp((chance - roll) / Math.max(chance, MIN_MARGIN), 0, 1) : clamp(chance / Math.max(roll, MIN_MARGIN), 0, 1);
  const electorate = electorateFor(state, content, office);
  if (office.system === 'proporcional') {
    const outcome = proportionalOutcome(state, content, office, won, closeness, rng);
    return {
      ...base,
      won,
      voteShare: (outcome.votes / electorate) * PERCENT,
      votes: outcome.votes,
      substitute: !won && chance >= CAREER.election.substituteMinChance,
      seats: outcome.seats,
      partySeats: outcome.partySeats,
      partyList: outcome.partyList,
    };
  }
  const voteShare = decisiveShare(chance, roll, won);
  return { ...base, won, voteShare, votes: Math.round((electorate * voteShare) / PERCENT), opponent };
};

/** Majoritária em dois turnos: decide no 1º turno ou deixa o 2º turno pendente. */
const firstRound = (
  state: CareerState,
  content: CareerContent,
  office: CareerOffice,
  base: CareerElectionRecord,
  opponent: CareerPerson,
  rng: Rng,
): { record: CareerElectionRecord; runoffPending: boolean } => {
  const lean = electorateLean(state, content, office.level);
  // Um candidato por partido: os demais vêm de legendas que ainda não estão na disputa.
  const others = Array.from({ length: OTHER_CANDIDATES }).reduce<CareerPerson[]>((acc) => {
    const taken = new Set([state.partyId, opponent.partyId, ...acc.map((person) => person.partyId)]);
    const free = content.parties.filter((party) => !taken.has(party.id));
    return free.length > 0 ? [...acc, randomPerson(rng, content, pickGoverningParty(rng, free, lean).id)] : acc;
  }, []);
  const player: CareerPerson = { name: state.profile.politicalName, partyId: state.partyId ?? '', sex: state.profile.sex };
  const round: CareerRound = rollFirstRound(rng, base.chance, player, opponent, others);
  const { outcome, runoffOpponent } = firstRoundOutcome(round);
  const share = round.candidates.find((candidate) => candidate.isPlayer)?.share ?? 0;
  // Adversário de referência: quem vai ao 2º turno ou, sem 2º turno, quem ficou à frente.
  const main = runoffOpponent ?? round.candidates.find((candidate) => !candidate.isPlayer);
  const known = [opponent, ...others].find((person) => person.name === main?.name) ?? opponent;
  return {
    record: {
      ...base,
      won: outcome === 'won',
      voteShare: share,
      votes: Math.round((electorateFor(state, content, office) * share) / PERCENT),
      opponent: known,
      firstRound: round,
    },
    runoffPending: outcome === 'runoff',
  };
};

/**
 * Disputa a eleição do semestre: prévia (se o rival quiser o cargo), riscos da campanha,
 * votação e marcas da campanha. Com 2º turno, o registro volta pendente.
 * Vencendo, o novo cargo fica em `pendingOffice` até a posse; perdendo, volta ao antigo.
 */
export const runCareerElection = (state: CareerState, content: CareerContent, officeId: string, choices: CampaignChoices): ElectionRun => {
  const office = findOffice(content, officeId);
  if (!office) return { state, record: null, news: [], runoffPending: false };
  const option = evaluateCandidacy(state, content, office);
  if (!option.eligible) return { state, record: null, news: [], runoffPending: false };
  const leave = option.takesLeave ? [leaveNews(state, content, office)] : [];
  const primary = runPrimary(state, content, office, option, choices);
  if (!primary.passed) return { state: primary.state, record: primary.record, news: [...leave, ...primary.news], runoffPending: false };
  const plan = planCampaign(primary.state, content, office, choices);
  const rng = createRng(primary.state.seed);
  const risks = rollCampaignRisks(primary.state, content, office, choices, rng);
  const strength = option.strength + plan.points - risks.strengthLoss;
  const base: CareerElectionRecord = {
    ...emptyRecord(state, office, option, choices, plan.spending),
    chance: chanceFor(strength, option.difficulty),
    strength,
    primary: option.primary && !campaignSettlesPrimary(content, office, choices) ? { rivalName: option.primary.rival.name, won: true } : null,
  };
  const lean = electorateLean(state, content, office.level);
  const opponent = option.adversary ?? randomPerson(rng, content, pickGoverningParty(rng, content.parties, lean, state.partyId).id);
  const voted = hasRunoff(state, content, office)
    ? firstRound(state, content, office, base, opponent, rng)
    : { record: singleRound(state, content, office, base, office.system === 'majoritario' ? opponent : null, rng), runoffPending: false };
  const marked = applyCampaignMarks({ ...risks.state, seed: rng.getSeed() }, content, office, choices, plan, rng);
  const seeded = { ...marked.state, seed: rng.getSeed() };
  const news = [...leave, ...primary.news, ...risks.news, ...marked.news];
  if (voted.runoffPending) return { state: seeded, record: voted.record, news, runoffPending: true };
  const recorded = recordElection(seeded, content, office, voted.record);
  return { state: recorded.state, record: voted.record, news: [...news, ...recorded.news], runoffPending: false };
};

/** Chance no 2º turno: força da campanha + escolha entre os turnos − tropeço + vantagem do 1º turno. */
export const runoffChance = (pending: CareerElectionRecord, choice: CampaignDecisionOption, strengthLoss = 0): number => {
  const candidates = pending.firstRound?.candidates ?? [];
  const playerShare = candidates.find((candidate) => candidate.isPlayer)?.share ?? 0;
  const opponentShare = candidates.find((candidate) => candidate.name === pending.opponent?.name)?.share ?? playerShare;
  // Efeito da escolha: o quanto ela moveria a chance da campanha (mesma curva da força).
  const effect = chanceFor(pending.strength + choice.strength - strengthLoss, pending.difficulty) - chanceFor(pending.strength, pending.difficulty);
  return runoffChanceFromLead(playerShare - opponentShare, effect);
};

/** 2º turno: parte da força da campanha e soma a escolha entre os turnos e a vantagem do 1º turno. */
export const resolveRunoff = (
  state: CareerState,
  content: CareerContent,
  pending: CareerElectionRecord,
  optionId: string,
): { state: CareerState; record: CareerElectionRecord; news: CareerNews[] } => {
  const office = findOffice(content, pending.officeId);
  const choice = content.runoffOptions.find((entry) => entry.id === optionId) ?? content.runoffOptions[0];
  if (!office || !pending.firstRound || !choice) return { state, record: pending, news: [] };
  const rng = createRng(state.seed);
  const gaffe = choice.risk !== undefined && rng.next() < choice.risk.chance;
  const chance = runoffChance(pending, choice, gaffe && choice.risk ? choice.risk.strength : 0);
  const roll = rng.next();
  const won = roll < chance;
  const first = pending.firstRound.candidates;
  const playerFirst = first.find((candidate) => candidate.isPlayer)?.share ?? 0;
  const opponentFirst = first.find((candidate) => candidate.name === pending.opponent?.name)?.share ?? 0;
  const share = runoffShare(playerFirst, opponentFirst, chance, roll, won);
  const record: CareerElectionRecord = {
    ...pending,
    won,
    voteShare: share,
    votes: Math.round((electorateFor(state, content, office) * share) / PERCENT),
    runoff: {
      candidates: [
        { name: state.profile.politicalName, partyId: state.partyId ?? '', share, isPlayer: true },
        { name: pending.opponent?.name ?? '', partyId: pending.opponent?.partyId ?? '', share: PERCENT - share, isPlayer: false },
      ].sort((a, b) => b.share - a.share),
    },
  };
  const impacted = applyCareerImpact({ ...state, seed: rng.getSeed() }, content, choice.impact, '2º turno');
  const marked = gaffe && choice.risk ? applyCareerImpact(impacted, content, choice.risk.impact) : impacted;
  const news = gaffe && choice.risk ? [createCareerNews(state.turn, fillCareerText(choice.risk.headline, state, content), 'negative', 'segundo-turno-risco')] : [];
  const recorded = recordElection(marked, content, office, record);
  return { state: recorded.state, record, news: [...news, ...recorded.news] };
};
