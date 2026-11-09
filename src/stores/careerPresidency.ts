/**
 * A ponte entre a carreira e o jogo presidencial: candidatura com o debate,
 * apuração, posse (no ano certo do calendário) e o legado no fim do governo.
 */
import { SEMESTERS_PER_YEAR } from '@/constants/career';
import { GAME_MODES } from '@/constants/game';
import {
  buildCareerCandidate,
  calculateCareerLegacy,
  calculateCareerPresidentialElection,
  enterPresidency,
  findOffice,
  selectCampaignQuestions,
  successionElectionResult,
} from '@/engine';
import type { CareerNews, CareerState, GameMode } from '@/types';
import { careerTurnToMonthTurn } from '@/utils/careerCalendar';
import { resolveCampaignOptions } from './campaignOptions';
import { careerContentOf, careerData, closeSemester, setCareer } from './careerFlow';
import { getWorldContent } from './content';
import { advanceSeed } from './gameData';
import type { GameStoreApi } from './gameStoreTypes';
import { usePlayerStore } from './usePlayerStore';

const PRESIDENT = 'presidente';
/** Mandato presidencial completo em semestres (4 anos). */
const FULL_TERM_SEMESTERS = 4 * SEMESTERS_PER_YEAR;
const MIN_SUCCESSION_MONTHS = 6;

/** Vai ao debate presidencial (as perguntas do jogo presidencial); o cargo atual fica em licença. */
export const startPresidentialRun = (api: GameStoreApi, state: CareerState, news: readonly CareerNews[] = []): void => {
  const gameContent = getWorldContent(state.world);
  const candidate = buildCareerCandidate(state, careerContentOf(state), gameContent);
  const { questionIds, seed } = selectCampaignQuestions(gameContent.campaignQuestions, api.get().seed);
  usePlayerStore.getState().hydrate({ candidate, campaignQuestionIds: questionIds, campaignAnswers: [], election: null });
  setCareer({ state, presidentialRun: true, semesterNews: [...careerData().semesterNews, ...news] });
  api.commit({ phase: 'campaign', seed });
};

/** Fim do debate na carreira: vence → noite da eleição do jogo presidencial; perde → volta à carreira. */
export const finishPresidentialRun = (api: GameStoreApi): void => {
  const { state } = careerData();
  const player = usePlayerStore.getState();
  if (!state || !player.candidate) return;
  const options = resolveCampaignOptions(player.campaignQuestionIds, player.campaignAnswers);
  const content = careerContentOf(state);
  const outcome = calculateCareerPresidentialElection(state, content, getWorldContent(state.world), player.candidate, options);
  setCareer({ presidentialRun: false, lastElection: outcome.record });
  if (!outcome.won) {
    usePlayerStore.getState().reset();
    closeSemester(outcome.state, [], null, null);
    api.commit({ phase: 'career-election-result', seed: advanceSeed(api.get().seed) });
    return;
  }
  const termYears = findOffice(content, PRESIDENT)?.termYears ?? 4;
  const entered = enterPresidency(outcome.state, content, termYears);
  usePlayerStore.getState().hydrate({ election: outcome.election });
  setCareer({ state: entered });
  api.commit({ phase: 'election-result', seed: advanceSeed(api.get().seed) });
};

/** O vice assumiu a Presidência: vai direto ao plano de governo, com o resto do mandato. */
export const enterPresidencyBySuccession = (api: GameStoreApi, state: CareerState): void => {
  const gameContent = getWorldContent(state.world);
  const candidate = buildCareerCandidate(state, careerContentOf(state), gameContent);
  usePlayerStore.getState().hydrate({
    candidate,
    campaignQuestionIds: [],
    campaignAnswers: [],
    election: successionElectionResult(state, gameContent, candidate),
  });
  setCareer({ state, currentEventId: null });
  api.commit({ phase: 'goals' });
};

/**
 * Turno da posse e duração do mandato quando a Presidência vem da carreira (null fora dela).
 * Sucessão: o mandato vale só o que resta, na mesma escala do modo escolhido.
 */
export const getCareerPresidencyParams = (state: CareerState | null, mode: GameMode): { startTurn: number; termLength: number } | null => {
  const position = state?.position;
  if (!position || position.id !== PRESIDENT) return null;
  const modeTurns = GAME_MODES[mode].turns;
  const remaining = (position.endTurn ?? position.startTurn) - position.startTurn + 1;
  const termLength = position.bySuccession ? Math.max(MIN_SUCCESSION_MONTHS, Math.round((modeTurns * remaining) / FULL_TERM_SEMESTERS)) : modeTurns;
  return { startTurn: careerTurnToMonthTurn(position.startTurn), termLength };
};

/** Fim do governo: o legado da carreira conta os anos de Presidência na escala de um mandato de 4 anos. */
export const recordPresidencyLegacy = (monthsPlayed: number, termLength: number): void => {
  const { state } = careerData();
  if (!state) return;
  const content = careerContentOf(state);
  const termYears = findOffice(content, PRESIDENT)?.termYears ?? 4;
  const years = (monthsPlayed / Math.max(1, termLength)) * termYears;
  setCareer({ legacy: calculateCareerLegacy(state, content, years) });
};

