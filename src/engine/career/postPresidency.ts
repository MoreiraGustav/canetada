/**
 * Vida depois do Planalto: o jogo presidencial devolve a carreira. O tempo de
 * governo vira semestres, a aprovação final e os escândalos mexem nos indicadores,
 * o impeachment deixa inelegível por 8 anos e alguém assume o governo federal.
 */
import { CAREER } from '@/constants/balance';
import { EX_PRESIDENT_FLAG, SEMESTERS_PER_YEAR } from '@/constants/career';
import { MAX_TERMS } from '@/constants/game';
import type { CareerContent, CareerGovernment, CareerMetrics, CareerNews, CareerState, PresidencyOutcome, PresidencyRecord, Rng } from '@/types';
import { formatCareerTurn } from '@/utils/careerCalendar';
import { clamp } from '@/utils/math';
import { createRng } from '../random';
import { unlockAchievements } from './achievements';
import { closePosition, findOffice, findParty } from './helpers';
import { createCareerNews } from './text';
import { createGovernment, createInitialGovernments, electorateLean, pickGoverningParty } from './world';

const PRESIDENT = 'presidente';
const DEFAULT_TERM_YEARS = 4;
const METRIC_MAX = 100;

/** Semestres de governo: meses jogados na escala de um mandato de 4 anos (dois mandatos = 16). */
export const presidencySemesters = (outcome: PresidencyOutcome, termYears: number = DEFAULT_TERM_YEARS): number => {
  const fraction = outcome.monthsPlayed / Math.max(1, outcome.termLength);
  return clamp(Math.round(fraction * termYears * SEMESTERS_PER_YEAR), 1, MAX_TERMS * termYears * SEMESTERS_PER_YEAR);
};

/** O capital político de quem saiu do Planalto. */
const exPresidentMetrics = (metrics: CareerMetrics, outcome: PresidencyOutcome): CareerMetrics => {
  const rules = CAREER.postPresidency;
  const impeached = outcome.ending === 'impeached';
  const reputation =
    metrics.reputation +
    (outcome.finalApproval - rules.approvalReference) * rules.reputationPerApproval +
    outcome.scandals * rules.scandalReputation +
    (impeached ? rules.impeachmentReputation : 0);
  const leader = outcome.finalApproval >= rules.partyLeaderApproval && !impeached;
  return {
    nationalRecognition: Math.max(metrics.nationalRecognition, rules.nationalRecognition),
    reputation: clamp(reputation, 0, METRIC_MAX),
    localPopularity: clamp(metrics.localPopularity + (outcome.finalApproval - metrics.localPopularity) * rules.localPopularityBlend, 0, METRIC_MAX),
    electoralBase: Math.max(metrics.electoralBase, rules.electoralBaseFloor),
    partyInfluence: clamp(leader ? Math.max(metrics.partyInfluence, rules.partyLeaderInfluence) : metrics.partyInfluence + rules.partyFallout, 0, METRIC_MAX),
  };
};

/** Quem governa o país depois: o vice (impeachment), a oposição (derrota) ou o sucessor eleito. */
const nextFederalGovernment = (state: CareerState, content: CareerContent, outcome: PresidencyOutcome, rng: Rng): CareerGovernment => {
  const own = findParty(content, state.partyId) ?? content.parties[0];
  const opposition = (): CareerGovernment => createGovernment(rng, content, pickGoverningParty(rng, content.parties, electorateLean(state, content, 'federal'), state.partyId));
  if (outcome.ending === 'impeached') return createGovernment(rng, content, own);
  if (outcome.ending === 'defeated') return opposition();
  const { successionCenter, successionSpread } = CAREER.postPresidency;
  const keeps = 1 / (1 + Math.exp(-(outcome.finalApproval - successionCenter) / successionSpread));
  return rng.next() < keeps ? createGovernment(rng, content, own) : opposition();
};

const exitText = (state: CareerState, outcome: PresidencyOutcome): string => {
  const name = state.profile.politicalName;
  const approval = `${Math.round(outcome.finalApproval)}%`;
  if (outcome.ending === 'impeached') return `${name} sofre impeachment e deixa o Planalto com ${approval} de aprovação`;
  if (outcome.ending === 'defeated') return `${name} perde a reeleição e deixa o Planalto com ${approval} de aprovação`;
  return `${name} deixa o Planalto com ${approval} de aprovação`;
};

/**
 * Fim do governo no jogo presidencial: fecha a Presidência no semestre certo, registra a
 * passagem, ajusta os indicadores e devolve a carreira no semestre seguinte, como ex-presidente.
 */
export const leavePresidency = (state: CareerState, content: CareerContent, outcome: PresidencyOutcome): { state: CareerState; news: CareerNews[] } => {
  const { position } = state;
  if (position?.kind !== 'office' || position.id !== PRESIDENT) return { state, news: [] };
  const lastTurn = position.startTurn + presidencySemesters(outcome, findOffice(content, PRESIDENT)?.termYears) - 1;
  const returnTurn = lastTurn + 1;
  const closed = closePosition({ ...state, position: { ...position, consecutiveTerms: outcome.terms } }, lastTurn);
  const rng = createRng(state.seed);
  // As eleições locais seguiram sem você: prefeitura e governo do estado são de outra gente agora.
  const local = createInitialGovernments(rng, state, content);
  const governments = { municipal: local.municipal, estadual: local.estadual, federal: nextFederalGovernment(state, content, outcome, rng) };
  const { terms, ending, finalApproval, scandals, score, legacyTitle } = outcome;
  const record: PresidencyRecord = { startTurn: position.startTurn, endTurn: lastTurn, terms, ending, finalApproval, scandals, score, legacyTitle };
  const impeached = outcome.ending === 'impeached';
  const ineligibleUntil = impeached ? Math.max(state.ineligibleUntil ?? 0, returnTurn + CAREER.postPresidency.impeachmentIneligibleSemesters - 1) : state.ineligibleUntil;
  const text = exitText(state, outcome);
  const timeline = [
    ...closed.timeline,
    { turn: lastTurn, kind: impeached ? ('cassacao' as const) : ('ex-presidente' as const), text },
    ...(impeached ? [{ turn: returnTurn, kind: 'inelegivel' as const, text: `${state.profile.politicalName} fica inelegível até o ${formatCareerTurn(ineligibleUntil ?? returnTurn)}` }] : []),
  ];
  const left: CareerState = {
    ...closed,
    turn: returnTurn,
    seed: rng.getSeed(),
    metrics: exPresidentMetrics(state.metrics, outcome),
    governments,
    pendingOffice: null,
    preCandidacy: null,
    polls: [],
    ineligibleUntil,
    flags: { ...closed.flags, [EX_PRESIDENT_FLAG]: returnTurn },
    presidencies: [...state.presidencies, record],
    timeline,
  };
  const unlocked = unlockAchievements(left, content);
  // O jornal mostra a última notícia primeiro: a saída do Planalto vira a manchete.
  return { state: unlocked.state, news: [...unlocked.news, createCareerNews(lastTurn, text, impeached ? 'negative' : 'neutral', 'deixa-planalto')] };
};
