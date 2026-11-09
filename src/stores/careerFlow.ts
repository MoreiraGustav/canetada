/**
 * Peças do fluxo do modo carreira compartilhadas pelas ações da store:
 * início e fim de semestre, jornal e legado.
 */
import { MAX_CAREER_NEWS } from '@/constants/career';
import { buildCareerReport, calculateCareerLegacy, closeCareerSemester, hasReachedRetirement, listCandidacies } from '@/engine';
import type { CareerContent, CareerData, CareerNews, CareerState } from '@/types';
import { getElectionAt } from '@/utils/careerCalendar';
import { getCareerContent } from './content';
import type { GameStoreApi } from './gameStoreTypes';
import { useCareerStore } from './useCareerStore';

/** Conteúdo do mundo do personagem (partidos reais ou fictícios). */
export const careerContentOf = (state: CareerState): CareerContent => getCareerContent(state.world);

export const careerData = (): CareerData => useCareerStore.getState();

export const setCareer = (partial: Partial<CareerData>): void => useCareerStore.getState().hydrate(partial);

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

/** Começa um semestre: guarda o ponto de partida e abre a convenção (ano de eleição) ou a agenda. */
export const beginSemester = (api: GameStoreApi, state: CareerState): void => {
  if (hasReachedRetirement(state)) {
    endCareer(api, state, 'se despede da vida pública');
    return;
  }
  setCareer({ state, semesterStart: state, semesterNews: [], plannedActionIds: [], plannedProgramId: null, currentEventId: null, lastElection: null });
  const election = getElectionAt(state.turn) !== null && listCandidacies(state, careerContentOf(state)).length > 0;
  api.commit({ phase: election ? 'career-election' : 'career-turn' });
};

/** Fecha o semestre (ganhos do cargo, esquecimento, gestão), monta o balanço e publica o jornal. */
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
    plannedActionIds: [],
    plannedProgramId: null,
  });
};
