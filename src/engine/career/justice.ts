/**
 * Justiça na carreira: a história de cada caso (para a condenação nunca vir "do nada"),
 * as acusações em andamento, a inelegibilidade (Ficha Limpa) e o recurso ao tribunal
 * superior, julgado alguns semestres depois.
 */
import { CAREER } from '@/constants/balance';
import type { CareerAppeal, CareerCase, CareerContent, CareerNews, CareerState } from '@/types';
import { formatCareerTurn } from '@/utils/careerCalendar';
import { clamp } from '@/utils/math';
import { createRng } from '../random';
import { applyCareerImpact, setCareerFlags } from './impacts';
import { createCareerNews } from './text';

const OVERTURNED_FLAG = 'condenacao-anulada';
const UPHELD_FLAG = 'recurso-negado';
/** Inelegibilidade da Ficha Limpa: 8 anos. */
const FICHA_LIMPA_SEMESTERS = 16;

export const findCase = (content: CareerContent, id: string): CareerCase | undefined => content.cases.find((entry) => entry.id === id);

/** Uma etapa já vivida de um caso: quando, o que significa e o que a causou. */
export interface CaseStepRecord {
  caseId: string;
  caseName: string;
  turn: number;
  text: string;
  /** A escolha ou o desfecho que marcou a etapa (vazio em saves antigos). */
  note: string;
}

/** Etapas já vividas dos casos pedidos, em ordem cronológica. */
export const caseBackstory = (state: CareerState, content: CareerContent, caseIds: readonly string[]): CaseStepRecord[] =>
  caseIds
    .flatMap((id) => {
      const entry = findCase(content, id);
      if (!entry) return [];
      return entry.steps.flatMap((step) => {
        const turn = state.flags[step.flag];
        return turn === undefined ? [] : [{ caseId: entry.id, caseName: entry.name, turn, text: step.text, note: state.flagNotes[step.flag] ?? '' }];
      });
    })
    .sort((a, b) => a.turn - b.turn);

/** Acusações em andamento (abertas e ainda sem desfecho). */
export const pendingCharges = (state: CareerState, content: CareerContent): CareerCase[] =>
  content.cases.filter(
    (entry) => entry.charge !== undefined && state.flags[entry.charge.flag] !== undefined && !entry.charge.closedBy.some((flag) => state.flags[flag] !== undefined),
  );

/** Casos que podem levar à Ficha Limpa e já têm acusação. */
const convictionCases = (state: CareerState, content: CareerContent): CareerCase[] =>
  content.cases.filter((entry) => entry.appealChance !== undefined && entry.charge !== undefined && state.flags[entry.charge.flag] !== undefined);

/** Chance de o recurso anular a condenação: a do caso mais fraco para a defesa, mais o peso político dos advogados. */
export const appealChance = (state: CareerState, content: CareerContent): number => {
  const rules = CAREER.appeal;
  const cases = convictionCases(state, content);
  const base = cases.length > 0 ? Math.min(...cases.map((entry) => entry.appealChance ?? rules.defaultChance)) : rules.defaultChance;
  return clamp(base + (state.metrics.partyInfluence - rules.influenceReference) * rules.perInfluence, rules.minChance, rules.maxChance);
};

/** Fica inelegível por N semestres (Ficha Limpa). */
export const becomeIneligible = (state: CareerState, semesters: number): { state: CareerState; news: CareerNews[] } => {
  const until = Math.max(state.ineligibleUntil ?? 0, state.turn + semesters);
  const text = `Justiça torna ${state.profile.politicalName} inelegível por ${semesters / 2} anos`;
  return {
    state: { ...state, ineligibleUntil: until, timeline: [...state.timeline, { turn: state.turn, kind: 'inelegivel', text }] },
    news: [createCareerNews(state.turn, text, 'negative', 'inelegivel')],
  };
};

const newAppeal = (state: CareerState, content: CareerContent, filedTurn: number): CareerAppeal => ({
  caseIds: convictionCases(state, content).map((entry) => entry.id),
  filedTurn,
  decisionTurn: filedTurn + CAREER.appeal.decisionTurns,
  chance: appealChance(state, content),
});

/** Condenado, recorre: a inelegibilidade vale já e o recurso fica esperando o julgamento. */
export const fileAppeal = (state: CareerState, content: CareerContent, semesters: number): { state: CareerState; news: CareerNews[] } => {
  const ineligible = becomeIneligible(state, semesters);
  const appeal = newAppeal(state, content, state.turn);
  const text = `Defesa de ${state.profile.politicalName} recorre; tribunal superior decide no ${formatCareerTurn(appeal.decisionTurn)}`;
  return {
    state: { ...ineligible.state, appeal, timeline: [...ineligible.state.timeline, { turn: state.turn, kind: 'recurso', text }] },
    news: [...ineligible.news, createCareerNews(state.turn, text, 'neutral', 'recurso-protocolado')],
  };
};

/** Recurso aceito: a condenação cai e a inelegibilidade também. */
const overturn = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const text = `Tribunal superior anula a condenação de ${state.profile.politicalName}, que volta a ser elegível`;
  const cleared = setCareerFlags(applyCareerImpact({ ...state, appeal: null, ineligibleUntil: null }, content, CAREER.appeal.overturnImpact), [OVERTURNED_FLAG], text);
  return {
    state: { ...cleared, timeline: [...cleared.timeline, { turn: state.turn, kind: 'recurso', text }] },
    news: [createCareerNews(state.turn, text, 'positive', 'recurso-julgado')],
  };
};

/** Recurso negado: a condenação fica e a inelegibilidade segue até o fim. */
const uphold = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const until = state.ineligibleUntil === null ? '' : `; inelegível até o ${formatCareerTurn(state.ineligibleUntil)}`;
  const text = `Tribunal superior nega o recurso de ${state.profile.politicalName}${until}`;
  const kept = setCareerFlags(applyCareerImpact({ ...state, appeal: null }, content, CAREER.appeal.upheldImpact), [UPHELD_FLAG], text);
  return {
    state: { ...kept, timeline: [...kept.timeline, { turn: state.turn, kind: 'recurso', text }] },
    news: [createCareerNews(state.turn, text, 'negative', 'recurso-julgado')],
  };
};

/** Fim do semestre: chegou a data, o tribunal julga o recurso. */
export const stepAppeal = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const { appeal } = state;
  if (!appeal || state.turn < appeal.decisionTurn) return { state, news: [] };
  const rng = createRng(state.seed);
  const overturned = rng.next() < appeal.chance;
  const seeded = { ...state, seed: rng.getSeed() };
  return overturned ? overturn(seeded, content) : uphold(seeded, content);
};

/** Desfecho do recurso julgado neste semestre (para o balanço). */
export const appealVerdictAt = (state: CareerState, turn: number): 'anulada' | 'mantida' | null => {
  if (state.flags[OVERTURNED_FLAG] === turn) return 'anulada';
  return state.flags[UPHELD_FLAG] === turn ? 'mantida' : null;
};

/**
 * Saves de antes do recurso de verdade: quem foi condenado e segue inelegível ganha o
 * julgamento do recurso (a defesa sempre recorre), no máximo daqui a `decisionTurns` semestres.
 */
export const migrateLegacyConviction = (state: CareerState, content: CareerContent): CareerState => {
  const convictedAt = state.flags['ficha-suja'];
  const stillIneligible = state.ineligibleUntil !== null && state.ineligibleUntil >= state.turn;
  if (state.appeal !== null || convictedAt === undefined || !stillIneligible || state.ineligibleUntil !== convictedAt + FICHA_LIMPA_SEMESTERS) return state;
  const appeal = newAppeal(state, content, convictedAt);
  return { ...state, appeal: { ...appeal, decisionTurn: Math.max(state.turn, appeal.decisionTurn) } };
};
