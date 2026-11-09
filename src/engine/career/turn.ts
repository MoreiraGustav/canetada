/**
 * Fechamento e virada do semestre: ganhos do cargo, esquecimento do eleitor,
 * gestão (prefeitos e governadores), suplência, eleições de fundo, fim de
 * mandato e posse.
 */
import { CAREER } from '@/constants/balance';
import { ADMIN_INDICATOR_KEYS, CAREER_RETIREMENT_AGE, SEMESTERS_PER_YEAR } from '@/constants/career';
import type { AdminIndicatorKey, CareerAdministration, CareerContent, CareerMetrics, CareerNews, CareerOffice, CareerReport, CareerState } from '@/types';
import { clamp } from '@/utils/math';
import { createRng } from '../random';
import { resolveBackgroundElections } from './background';
import { stepCareerCast } from './characters';
import { stepPolls } from './polls';
import { ageAt, closePosition, currentOffice, findAppointment, findOffice } from './helpers';
import { administrationFor, applyCareerImpact, metricDeltas } from './impacts';
import { vacatePosition } from './positions';
import { createCareerNews, getPositionTitle } from './text';

/** Chance, por semestre, de um suplente ser chamado a assumir a vaga. */
const SUBSTITUTE_CALL_CHANCE = 0.1;
const SUBSTITUTE_PREFIX = 'suplente:';
const ADMIN_WEIGHT = 1 / ADMIN_INDICATOR_KEYS.length;

// ─── Fechamento do semestre ───────────────────────────────────────────────

const positionPerks = (state: CareerState, content: CareerContent): CareerState => {
  const perks = state.position?.kind === 'office' ? findOffice(content, state.position.id)?.perks : state.position ? findAppointment(content, state.position.id)?.perks : undefined;
  return perks ? applyCareerImpact(state, content, perks) : state;
};

/**
 * Sem trabalho, o eleitor esquece: deriva fixa mais a manutenção (quanto mais alto o
 * indicador, mais custa mantê-lo). Reputação ruim se recupera devagar.
 */
const applyDrift = (state: CareerState): CareerState => {
  const metrics: CareerMetrics = { ...state.metrics };
  const { threshold, rate } = CAREER.maintenance;
  (Object.entries(CAREER.drift) as Array<[keyof CareerMetrics, number]>).forEach(([key, delta]) => {
    const upkeep = Math.max(0, metrics[key] - threshold) * rate;
    metrics[key] = clamp(metrics[key] + delta - upkeep, 0, 100);
  });
  if (metrics.reputation < CAREER.reputationRecoveryCap) metrics.reputation = Math.min(CAREER.reputationRecoveryCap, metrics.reputation + CAREER.reputationRecovery);
  return { ...state, metrics };
};

/**
 * Gestão: serviços se desgastam, contas sofrem pressão; a aprovação caminha para a
 * média dos indicadores (com lua de mel no início e punição por contas no vermelho).
 */
const stepAdministration = (state: CareerState, content: CareerContent): CareerState => {
  const admin = state.administration;
  const office = currentOffice(state, content);
  if (!admin || !office || !state.position) return state;
  const rules = CAREER.admin;
  const indicators = Object.fromEntries(
    ADMIN_INDICATOR_KEYS.map((key) => [key, clamp(admin.indicators[key] + (key === 'contas' ? rules.contasDrift : rules.indicatorDrift), 0, 100)]),
  ) as Record<AdminIndicatorKey, number>;
  const average = ADMIN_INDICATOR_KEYS.reduce((acc, key) => acc + indicators[key] * ADMIN_WEIGHT, 0);
  const honeymoon = state.turn - state.position.startTurn < rules.honeymoonTurns ? rules.honeymoon : 0;
  const debt = Math.max(0, rules.contasCrisis - indicators.contas) * rules.debtPenalty;
  const equilibrium = average + honeymoon - debt;
  const approval = clamp(admin.approval + (equilibrium - admin.approval) * rules.approvalSpeed, 0, 100);
  const administration: CareerAdministration = { approval, indicators };
  // A cidade (ou o estado) julga o político pela gestão.
  const pull = office.level === 'municipal' ? rules.popularityPull : rules.popularityPull / 2;
  const metrics = {
    ...state.metrics,
    localPopularity: clamp(state.metrics.localPopularity + (approval - state.metrics.localPopularity) * pull, 0, 100),
    nationalRecognition:
      office.level === 'estadual'
        ? clamp(state.metrics.nationalRecognition + (approval - 50) * rules.governorNationalPerApproval, 0, 100)
        : state.metrics.nationalRecognition,
  };
  return { ...state, administration, metrics };
};

const substituteFlag = (state: CareerState): { officeId: string; electionTurn: number } | null => {
  const entry = Object.entries(state.flags).find(([flag]) => flag.startsWith(SUBSTITUTE_PREFIX));
  return entry ? { officeId: entry[0].slice(SUBSTITUTE_PREFIX.length), electionTurn: entry[1] } : null;
};

const clearSubstitute = (state: CareerState): CareerState => ({
  ...state,
  flags: Object.fromEntries(Object.entries(state.flags).filter(([flag]) => !flag.startsWith(SUBSTITUTE_PREFIX))),
});

/** Suplente sem cargo pode ser chamado quando um titular se licencia (até o fim daquele mandato). */
const callSubstitute = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const flag = substituteFlag(state);
  const office = flag ? findOffice(content, flag.officeId) : undefined;
  if (!flag || !office) return { state, news: [] };
  const endTurn = flag.electionTurn + office.termYears * SEMESTERS_PER_YEAR;
  if (state.turn >= endTurn) return { state: clearSubstitute(state), news: [] };
  if (state.position) return { state, news: [] };
  const rng = createRng(state.seed);
  const called = rng.next() < SUBSTITUTE_CALL_CHANCE;
  if (!called) return { state: { ...state, seed: rng.getSeed() }, news: [] };
  const next: CareerState = clearSubstitute({
    ...state,
    seed: rng.getSeed(),
    position: { kind: 'office', id: office.id, startTurn: state.turn + 1, endTurn, consecutiveTerms: 1 },
  });
  const text = `Titular se licencia e ${state.profile.politicalName} assume a vaga de ${getPositionTitle(next, content)}`;
  return {
    state: { ...next, timeline: [...next.timeline, { turn: state.turn, kind: 'posse', text }] },
    news: [createCareerNews(state.turn, text, 'positive', 'suplente-assume')],
  };
};

/** Pesquisa da gestão no fim do semestre (só para quem governa). */
const approvalNews = (state: CareerState): CareerNews[] =>
  state.administration
    ? [createCareerNews(state.turn, `Pesquisa: gestão de ${state.profile.politicalName} tem ${Math.round(state.administration.approval)}% de aprovação`, state.administration.approval >= 50 ? 'positive' : 'negative', 'pesquisa-gestao')]
    : [];

/** Fim do semestre (depois da agenda e do acontecimento). */
export const closeCareerSemester = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const worked = stepAdministration(applyDrift(positionPerks(state, content)), content);
  const substitute = callSubstitute(worked, content);
  const cast = stepCareerCast(substitute.state, content);
  const polls = stepPolls(cast.state, content);
  return { state: polls.state, news: [...approvalNews(substitute.state), ...substitute.news, ...cast.news, ...polls.news] };
};

/** Balanço do semestre: variações entre o início e o fim. */
export const buildCareerReport = (
  before: CareerState,
  after: CareerState,
  news: CareerNews[],
  eventId: string | null,
  eventOptionId: string | null,
): CareerReport => ({
  turn: before.turn,
  news,
  deltas: metricDeltas(before.metrics, after.metrics),
  approvalDelta: before.administration && after.administration ? after.administration.approval - before.administration.approval : null,
  eventId,
  eventOptionId,
});

// ─── Virada do semestre ───────────────────────────────────────────────────

/** Deixa o cargo anterior para assumir o novo (no Executivo, o vice assume). */
const leavePreviousPost = (state: CareerState, content: CareerContent, office: CareerOffice): CareerState => {
  const text = `${state.profile.politicalName} deixa o cargo de ${getPositionTitle(state, content)} para assumir como ${office.titles[state.profile.sex]}`;
  const left = vacatePosition(state, content, state.turn - 1);
  return { ...left, timeline: [...left.timeline, { turn: state.turn, kind: 'saida', text }] };
};

const takeOffice = (state: CareerState, content: CareerContent, office: CareerOffice): { state: CareerState; news: CareerNews[] } => {
  const { position } = state;
  const reelected = position?.kind === 'office' && position.id === office.id;
  const startTurn = state.turn;
  const endTurn = startTurn + office.termYears * SEMESTERS_PER_YEAR - 1;
  const leaving = position && !reelected ? leavePreviousPost(state, content, office) : state;
  const next: CareerState = {
    ...leaving,
    pendingOffice: null,
    position: { kind: 'office', id: office.id, startTurn, endTurn, consecutiveTerms: reelected && position ? position.consecutiveTerms + 1 : 1 },
    administration: reelected ? state.administration : administrationFor(office),
  };
  const title = getPositionTitle(next, content);
  const text = reelected ? `${state.profile.politicalName} toma posse para novo mandato de ${title}` : `${state.profile.politicalName} toma posse como ${title}`;
  return {
    state: { ...next, timeline: [...next.timeline, { turn: state.turn, kind: 'posse', text }] },
    news: [createCareerNews(state.turn, text, 'positive', `posse-${office.id}`)],
  };
};

/** Mandato que acabou sem reeleição. */
const endTerm = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const { position } = state;
  if (position?.kind !== 'office' || position.endTurn === null || position.endTurn >= state.turn) return { state, news: [] };
  if (state.pendingOffice === position.id) return { state, news: [] };
  const title = getPositionTitle(state, content);
  const closed = closePosition(state, position.endTurn);
  const text = `${state.profile.politicalName} encerra o mandato de ${title}`;
  return {
    state: { ...closed, timeline: [...closed.timeline, { turn: state.turn, kind: 'fim-mandato', text }] },
    news: [createCareerNews(state.turn, text, 'neutral', 'fim-mandato')],
  };
};

/**
 * Passa ao semestre seguinte: eleições de fundo (se o semestre foi de eleição),
 * fim de mandatos e posse de quem venceu. A Presidência não passa por aqui:
 * quem vence vai para o jogo presidencial.
 */
export const advanceCareerTurn = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const elections = resolveBackgroundElections(state, content);
  const moved = { ...elections.state, turn: state.turn + 1 };
  const ended = endTerm(moved, content);
  const pending = ended.state.pendingOffice ? findOffice(content, ended.state.pendingOffice) : undefined;
  const posse = pending && pending.id !== 'presidente' ? takeOffice(ended.state, content, pending) : { state: ended.state, news: [] };
  return { state: posse.state, news: [...elections.news, ...ended.news, ...posse.news] };
};

/** A carreira chega ao fim da vida pública pela idade. */
export const hasReachedRetirement = (state: CareerState): boolean => ageAt(state) >= CAREER_RETIREMENT_AGE;
