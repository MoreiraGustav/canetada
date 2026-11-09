/**
 * Início da carreira, partido e cargos de nomeação.
 */
import { CAREER } from '@/constants/balance';
import { CAREER_BASE_METRICS, CAREER_METRIC_KEYS, CAREER_START_YEAR } from '@/constants/career';
import type { CareerAppointment, CareerContent, CareerMetrics, CareerNews, CareerSetupInput, CareerState, CheckResult } from '@/types';
import { clamp } from '@/utils/math';
import { createRng } from '../random';
import { ageAt, closePosition, findAppointment, findCity, findParty, getGovernmentRelation } from './helpers';
import { createCareerNews, getPositionTitle } from './text';
import { ensureCareerCast, leaveCastBehind } from './characters';
import { createInitialGovernments } from './world';

/** Semestres mínimos entre duas trocas de partido. */
const PARTY_SWITCH_MIN_TURNS = 2;

const initialMetrics = (input: CareerSetupInput, content: CareerContent): CareerMetrics => {
  const profession = content.professions.find((entry) => entry.id === input.professionId);
  return Object.fromEntries(
    CAREER_METRIC_KEYS.map((key) => [key, clamp(CAREER_BASE_METRICS[key] + (profession?.startingMetrics[key] ?? 0), 0, 100)]),
  ) as CareerMetrics;
};

/** Personagem novo, ainda sem partido, no 1º semestre de 2027. */
export const createCareer = (input: CareerSetupInput, content: CareerContent, seed: number): CareerState => {
  const city = findCity(content, input.baseCityId) ?? content.cities[0];
  const profile = {
    name: input.name.trim(),
    politicalName: input.politicalName.trim() || input.name.trim(),
    sex: input.sex,
    portraitSeed: input.portraitSeed,
    birthYear: CAREER_START_YEAR - input.startingAge,
    professionId: input.professionId,
    economicIdeology: input.economicIdeology,
    socialIdeology: input.socialIdeology,
    baseCityId: city.id,
    baseStateId: city.stateId,
  };
  const rng = createRng(seed);
  const governments = createInitialGovernments(rng, { profile }, content);
  return {
    profile,
    world: input.world ?? 'ficticio',
    difficulty: input.difficulty,
    presidencyMode: input.presidencyMode,
    turn: 1,
    partyId: null,
    partyJoinedTurn: null,
    metrics: initialMetrics(input, content),
    position: null,
    pastPositions: [],
    cast: [],
    preCandidacy: null,
    polls: [],
    administration: null,
    governments,
    pendingOffice: null,
    flags: {},
    actionHistory: {},
    eventHistory: {},
    timeline: [{ turn: 1, kind: 'inicio', text: `${profile.politicalName} entra para a política em ${city.name}, aos ${input.startingAge} anos` }],
    elections: [],
    ineligibleUntil: null,
    seed: rng.getSeed(),
  };
};

/**
 * Pode trocar de partido agora? Mandato proporcional (vereador, deputado) só na
 * janela partidária: o 1º semestre do ano em que o mandato termina. Cargos
 * majoritários e nomeações podem trocar a qualquer tempo.
 */
export const canSwitchParty = (state: CareerState, content: CareerContent): CheckResult => {
  if (state.partyId === null) return { ok: true, reason: null };
  if (state.partyJoinedTurn !== null && state.turn - state.partyJoinedTurn < PARTY_SWITCH_MIN_TURNS) {
    return { ok: false, reason: 'Acabou de trocar de partido: espere um ano.' };
  }
  const position = state.position;
  const office = position?.kind === 'office' ? content.offices.find((entry) => entry.id === position.id) : undefined;
  if (office?.system === 'proporcional' && position?.endTurn !== null && position?.endTurn !== undefined) {
    const window = position.endTurn - 1;
    if (state.turn !== window) return { ok: false, reason: 'Com mandato de vereador ou deputado, só na janela partidária (1º semestre do último ano).' };
  }
  return { ok: true, reason: null };
};

/** Filia-se (primeira vez) ou troca de partido (perde parte da influência e da imagem). */
export const joinParty = (state: CareerState, content: CareerContent, partyId: string, invited = false): { state: CareerState; news: CareerNews[] } => {
  const party = findParty(content, partyId);
  if (!party || partyId === state.partyId) return { state, news: [] };
  const name = state.profile.politicalName;
  if (state.partyId === null) {
    const text = `${name} assina a ficha de filiação ao ${party.acronym}`;
    return {
      state: ensureCareerCast({ ...state, partyId, partyJoinedTurn: state.turn, timeline: [...state.timeline, { turn: state.turn, kind: 'filiacao', text }] }, content),
      news: [createCareerNews(state.turn, text, 'neutral', 'filiacao')],
    };
  }
  const { party: rules } = CAREER;
  // A influência construída é do partido antigo: sobra uma fração (ou o piso de quem chega convidado).
  const kept = state.metrics.partyInfluence * rules.switchInfluenceKept;
  const influence = invited ? Math.max(kept, rules.switchInvitedInfluence) : kept;
  const metrics = {
    ...state.metrics,
    partyInfluence: clamp(influence, 0, 100),
    reputation: clamp(state.metrics.reputation + rules.switchReputationCost, 0, 100),
  };
  const text = `${name} troca de partido e se filia ao ${party.acronym}`;
  const behind = leaveCastBehind(state, `Você trocou o ${findParty(content, state.partyId)?.acronym ?? 'partido'} pelo ${party.acronym}`);
  const switched: CareerState = ensureCareerCast({
    ...behind,
    partyId,
    partyJoinedTurn: state.turn,
    metrics,
    flags: invited ? { ...state.flags, 'legenda-garantida': state.turn } : state.flags,
    timeline: [...state.timeline, { turn: state.turn, kind: 'troca-partido', text }],
  }, content);
  const news = [createCareerNews(state.turn, text, 'neutral', 'troca-partido')];
  // Cargo de confiança num governo que agora é de oposição ao novo partido: fica sem ele.
  const appointing = switched.position?.kind === 'appointment' ? findAppointment(content, switched.position.id)?.government ?? null : null;
  if (appointing !== null && getGovernmentRelation(switched, content, appointing) === 'opposition') {
    const left = leaveAppointment(switched, content);
    return { state: left.state, news: [...news, ...left.news] };
  }
  return { state: switched, news };
};

// ─── Cargos de nomeação ───────────────────────────────────────────────────

/** Pode assumir este cargo de nomeação agora? (motivo quando não pode) */
export const checkAppointment = (state: CareerState, content: CareerContent, appointment: CareerAppointment): CheckResult => {
  if (state.position?.kind === 'office') return { ok: false, reason: 'Exige deixar o mandato.' };
  if (state.position?.id === appointment.id) return { ok: false, reason: 'É o seu cargo atual.' };
  if (state.partyId === null) return { ok: false, reason: 'Exige filiação a um partido.' };
  if (appointment.minAge !== undefined && ageAt(state) < appointment.minAge) return { ok: false, reason: `Idade mínima: ${appointment.minAge} anos.` };
  if (state.metrics.partyInfluence < appointment.minInfluence) return { ok: false, reason: `Exige influência partidária ${appointment.minInfluence}.` };
  if (appointment.minReputation !== undefined && state.metrics.reputation < appointment.minReputation) {
    return { ok: false, reason: `Exige reputação ${appointment.minReputation}.` };
  }
  if (appointment.government !== null && getGovernmentRelation(state, content, appointment.government) === 'opposition') {
    return { ok: false, reason: 'Quem governa é de oposição ao seu partido.' };
  }
  return { ok: true, reason: null };
};

/** Assume um cargo de nomeação (deixa o anterior, se houver). */
export const takeAppointment = (state: CareerState, content: CareerContent, appointmentId: string): { state: CareerState; news: CareerNews[] } => {
  const appointment = findAppointment(content, appointmentId);
  if (!appointment || state.position?.kind === 'office') return { state, news: [] };
  const freed = closePosition(state, state.turn - 1);
  const next: CareerState = {
    ...freed,
    position: { kind: 'appointment', id: appointment.id, startTurn: state.turn, endTurn: null, consecutiveTerms: 1 },
  };
  const verb = state.profile.sex === 'f' ? 'nomeada' : 'nomeado';
  const text = `${state.profile.politicalName} é ${verb} ${getPositionTitle(next, content)}`;
  return {
    state: { ...next, timeline: [...next.timeline, { turn: state.turn, kind: 'nomeacao', text }] },
    news: [createCareerNews(state.turn, text, 'positive', `nomeacao-${appointment.id}`)],
  };
};

/** Pede demissão do cargo de nomeação. */
export const leaveAppointment = (state: CareerState, content: CareerContent, verb = 'deixa'): { state: CareerState; news: CareerNews[] } => {
  if (state.position?.kind !== 'appointment') return { state, news: [] };
  const title = getPositionTitle(state, content);
  const closed = closePosition(state, state.turn);
  const text = `${state.profile.politicalName} ${verb} o cargo de ${title}`;
  return {
    state: { ...closed, timeline: [...closed.timeline, { turn: state.turn, kind: 'saida', text }] },
    news: [createCareerNews(state.turn, text, 'neutral', 'saida-cargo')],
  };
};
