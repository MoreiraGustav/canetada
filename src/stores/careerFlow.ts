/**
 * Peças do fluxo do modo carreira compartilhadas pelas ações da store:
 * início e fim de semestre, jornal, legado e a galeria de conquistas.
 */
import { MAX_CAREER_NEWS } from '@/constants/career';
import { buildCareerReport, calculateCareerLegacy, closeCareerSemester, hasReachedRetirement, listCandidacies, openCareerSemester } from '@/engine';
import type { CareerContent, CareerData, CareerNews, CareerState } from '@/types';
import { getElectionAt } from '@/utils/careerCalendar';
import { getCareerContent } from './content';
import type { GameStoreApi } from './gameStoreTypes';
import { useAchievementsStore } from './useAchievementsStore';
import { useCareerStore } from './useCareerStore';

/** Conteúdo do mundo do personagem (partidos reais ou fictícios). */
export const careerContentOf = (state: CareerState): CareerContent => getCareerContent(state.world);

export const careerData = (): CareerData => useCareerStore.getState();

/** Atualiza a carreira e guarda na galeria as conquistas novas. */
export const setCareer = (partial: Partial<CareerData>): void => {
  useCareerStore.getState().hydrate(partial);
  if (partial.state) useAchievementsStore.getState().syncFromCareer(partial.state);
};

/** Escolhas do semestre zeradas (agenda, programa e mandato). */
export const EMPTY_SEMESTER_PLAN: Pick<
  CareerData,
  'plannedActionIds' | 'plannedProgramId' | 'plannedVote' | 'plannedBill' | 'plannedAmendmentId' | 'plannedWorkId' | 'plannedMissionOptionId'
> = {
  plannedActionIds: [],
  plannedProgramId: null,
  plannedVote: null,
  plannedBill: null,
  plannedAmendmentId: null,
  plannedWorkId: null,
  plannedMissionOptionId: null,
};

/** Jornal: mais recentes primeiro, limitado. */
export const prependCareerNews = (archive: readonly CareerNews[], news: readonly CareerNews[]): CareerNews[] =>
  [...[...news].reverse(), ...archive].slice(0, MAX_CAREER_NEWS);

/** Encerra a carreira (aposentadoria): calcula o legado e vai para a tela final. */
export const endCareer = (api: GameStoreApi, state: CareerState, reason: string): void => {
  const text = `${state.profile.politicalName} ${reason}`;
  const final: CareerState = { ...state, timeline: [...state.timeline, { turn: state.turn, kind: 'aposentadoria', text }] };
  setCareer({ state: final, legacy: calculateCareerLegacy(final, careerContentOf(final)), currentEventId: null });
  api.commit({ phase: 'career-result' });
};

/** Começa um semestre: sorteia a votação do mandato, guarda o ponto de partida e abre a convenção (ano de eleição) ou a agenda. */
export const beginSemester = (api: GameStoreApi, current: CareerState): void => {
  if (hasReachedRetirement(current)) {
    endCareer(api, current, 'se despede da vida pública');
    return;
  }
  const state = openCareerSemester(current, careerContentOf(current));
  setCareer({ state, semesterStart: state, semesterNews: [], currentEventId: null, lastElection: null, ...EMPTY_SEMESTER_PLAN });
  const election = getElectionAt(state.turn) !== null && listCandidacies(state, careerContentOf(state)).length > 0;
  api.commit({ phase: election ? 'career-election' : 'career-turn' });
};

/** Fecha o semestre (ganhos do cargo, esquecimento, gestão, obras, projetos), monta o balanço e publica o jornal. */
export const closeSemester = (state: CareerState, extraNews: readonly CareerNews[], eventId: string | null, optionId: string | null): void => {
  const data = careerData();
  const closed = closeCareerSemester(state, careerContentOf(state));
  const news = [...data.semesterNews, ...extraNews, ...closed.news];
  setCareer({
    state: closed.state,
    lastReport: buildCareerReport(data.semesterStart ?? state, closed.state, news, eventId, optionId),
    news: prependCareerNews(data.news, news),
    semesterNews: [],
    currentEventId: null,
    ...EMPTY_SEMESTER_PLAN,
  });
};
