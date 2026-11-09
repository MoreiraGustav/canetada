/**
 * Acontecimentos do semestre: convites, crises, escândalos e oportunidades.
 * Cada opção tem impacto e pode ter uma consequência especial (`CareerEffect`):
 * assumir um cargo, trocar de partido, suceder o titular, ficar inelegível...
 */
import { CAREER } from '@/constants/balance';
import type { CareerContent, CareerEffect, CareerEvent, CareerNews, CareerState } from '@/types';
import { createRng, pickWeighted } from '../random';
import { evaluateCareerConditions } from './conditions';
import { closePosition, closestOtherParty, currentOffice, findOffice } from './helpers';
import { administrationFor, applyCareerImpact, impactTone, rollCareerRisk, setCareerFlags } from './impacts';
import { ensureCareerCast, retireCharacter } from './characters';
import { vacatePosition } from './positions';
import { joinParty, leaveAppointment, takeAppointment } from './setup';
import { createCareerNews, fillCareerText, getPositionTitle } from './text';

const DEFAULT_WEIGHT = 1;

const isEligible = (state: CareerState, content: CareerContent, event: CareerEvent): boolean => {
  const last = state.eventHistory[event.id];
  if (last !== undefined && (event.oneTime || state.turn - last < (event.cooldown ?? CAREER.events.defaultCooldown))) return false;
  return evaluateCareerConditions(state, content, event.conditions);
};

/** Eventos possíveis agora (para o sorteio e para os testes de conteúdo). */
export const getEligibleCareerEvents = (state: CareerState, content: CareerContent): CareerEvent[] =>
  content.events.filter((event) => isEligible(state, content, event));

/** Sorteia o acontecimento do semestre (ou nenhum) e registra no histórico. */
export const drawCareerEvent = (state: CareerState, content: CareerContent): { state: CareerState; eventId: string | null } => {
  const rng = createRng(state.seed);
  const happens = rng.next() < CAREER.events.chancePerTurn;
  const event = happens
    ? pickWeighted(rng, getEligibleCareerEvents(state, content).map((entry) => ({ item: entry, weight: entry.weight ?? DEFAULT_WEIGHT })))
    : null;
  const seed = rng.getSeed();
  if (!event) return { state: { ...state, seed }, eventId: null };
  return { state: { ...state, seed, eventHistory: { ...state.eventHistory, [event.id]: state.turn } }, eventId: event.id };
};

// ─── Consequências especiais ──────────────────────────────────────────────

type EffectResult = { state: CareerState; news: CareerNews[] };

/** O vice assume o cargo do titular até o fim do mandato. */
const succeed = (state: CareerState, content: CareerContent): EffectResult => {
  const office = currentOffice(state, content);
  const head = office?.headOffice ? findOffice(content, office.headOffice) : undefined;
  if (!office || !head || !state.position) return { state, news: [] };
  const endTurn = state.position.endTurn;
  const closed = closePosition(state, state.turn - 1);
  const next: CareerState = {
    ...closed,
    position: { kind: 'office', id: head.id, startTurn: state.turn, endTurn, consecutiveTerms: 1, bySuccession: true },
    administration: administrationFor(head),
    governments: {
      ...closed.governments,
      [head.level]: { partyId: state.partyId ?? closed.governments[head.level].partyId, leaderName: state.profile.politicalName, leaderSex: state.profile.sex, isPlayer: true },
    },
  };
  const text = `${state.profile.politicalName} assume como ${getPositionTitle(next, content)}`;
  return {
    state: { ...next, timeline: [...next.timeline, { turn: state.turn, kind: 'sucessao', text }] },
    news: [createCareerNews(state.turn, text, 'positive', 'sucessao')],
  };
};

/** Perde o mandato: o vice (fictício) assume o Executivo, se for o caso. */
const loseOffice = (state: CareerState, content: CareerContent): EffectResult => {
  if (!currentOffice(state, content)) return { state, news: [] };
  const title = getPositionTitle(state, content);
  const ousted = vacatePosition(state, content, state.turn);
  const text = `${state.profile.politicalName} perde o mandato de ${title}`;
  return {
    state: { ...ousted, timeline: [...ousted.timeline, { turn: state.turn, kind: 'cassacao', text }] },
    news: [createCareerNews(state.turn, text, 'negative', 'cassacao')],
  };
};

const becomeIneligible = (state: CareerState, semesters: number): EffectResult => {
  const until = Math.max(state.ineligibleUntil ?? 0, state.turn + semesters);
  const text = `Justiça torna ${state.profile.politicalName} inelegível por ${semesters / 2} anos`;
  return {
    state: { ...state, ineligibleUntil: until, timeline: [...state.timeline, { turn: state.turn, kind: 'inelegivel', text }] },
    news: [createCareerNews(state.turn, text, 'negative', 'inelegivel')],
  };
};

const switchToClosestParty = (state: CareerState, content: CareerContent): EffectResult => {
  const party = closestOtherParty(state, content);
  return party ? joinParty(state, content, party.id, true) : { state, news: [] };
};

const EFFECTS: { [K in CareerEffect['kind']]: (state: CareerState, content: CareerContent, effect: Extract<CareerEffect, { kind: K }>) => EffectResult } = {
  appoint: (state, content, effect) => takeAppointment(state, content, effect.appointmentId),
  'leave-appointment': (state, content) => leaveAppointment(state, content, state.profile.sex === 'f' ? 'é exonerada e deixa' : 'é exonerado e deixa'),
  succeed: (state, content) => succeed(state, content),
  'switch-party': (state, content) => switchToClosestParty(state, content),
  ineligible: (state, _content, effect) => becomeIneligible(state, effect.semesters),
  'lose-office': (state, content) => loseOffice(state, content),
  'retire-character': (state, content, effect) => ({ state: ensureCareerCast(retireCharacter(state, effect.role), content), news: [] }),
};

export const applyCareerEffect = (state: CareerState, content: CareerContent, effect: CareerEffect): EffectResult =>
  (EFFECTS[effect.kind] as (state: CareerState, content: CareerContent, effect: CareerEffect) => EffectResult)(state, content, effect);

/** Resolve a opção escolhida: impacto, risco, flags e consequência especial. */
export const resolveCareerEvent = (
  state: CareerState,
  content: CareerContent,
  eventId: string,
  optionId: string,
): { state: CareerState; news: CareerNews[] } => {
  const event = content.events.find((entry) => entry.id === eventId);
  const option = event?.options.find((entry) => entry.id === optionId);
  if (!event || !option) return { state, news: [] };
  const rng = createRng(state.seed);
  const impacted = setCareerFlags(applyCareerImpact(state, content, option.impact, event.title), option.flags);
  const { state: risked, happened } = rollCareerRisk(impacted, content, option.risk, rng);
  const outcome = happened && option.risk ? option.risk : option;
  const news = [createCareerNews(state.turn, fillCareerText(outcome.headline, state, content), impactTone(outcome.impact), `evento-${event.id}`)];
  const seeded = { ...risked, seed: rng.getSeed() };
  if (!option.effect) return { state: seeded, news };
  const effect = applyCareerEffect(seeded, content, option.effect);
  return { state: effect.state, news: [...news, ...effect.news] };
};

