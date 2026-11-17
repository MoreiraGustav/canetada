/**
 * Depois do fim: voltar à carreira como ex-presidente ou passar o bastão a um(a)
 * herdeiro(a). Nos dois casos o jogo presidencial é deixado para trás e a carreira
 * segue no semestre seguinte.
 */
import { calculateCareerLegacy, createHeirCareer, hasReachedRetirement } from '@/engine';
import type { CareerNews, HeirInput } from '@/types';
import { beginSemester, careerContentOf, careerData, setCareer } from './careerFlow';
import { createInitialGameData, generateSeed } from './gameData';
import type { GameStoreApi } from './gameStoreTypes';
import { resetPresidentialStores } from './persistence';
import { useCareerStore } from './useCareerStore';

/** Zera o jogo presidencial (mantém o mundo, o modo e a dificuldade da carreira). */
const resetGameForCareer = (api: GameStoreApi): void => {
  const { world, mode, difficulty, termLength } = api.get();
  api.set({ ...createInitialGameData(), world, mode, difficulty, termLength, totalTurns: termLength, seed: generateSeed() });
};

/** Ex-presidente volta à carreira (se ainda não chegou à idade da aposentadoria). */
export const resumeCareerAfterPresidency = (api: GameStoreApi): void => {
  const { state } = careerData();
  if (!state || state.position !== null || hasReachedRetirement(state)) return;
  resetPresidentialStores();
  setCareer({ legacy: null, presidentialRun: false, lastReport: null, lastElection: null, pendingRunoff: null, campaignOfficeId: null });
  resetGameForCareer(api);
  beginSemester(api, state);
};

/** O(a) herdeiro(a) começa a carreira no semestre seguinte, com parte do capital da família. */
export const startHeirCareer = (api: GameStoreApi, input: HeirInput): void => {
  const { state, legacy } = careerData();
  if (!state) return;
  const content = careerContentOf(state);
  const heir = createHeirCareer(state, content, input, legacy ?? calculateCareerLegacy(state, content), generateSeed());
  const news: CareerNews = { id: `${heir.turn}:heranca`, turn: heir.turn, headline: heir.timeline[0]?.text ?? '', tone: 'positive' };
  resetPresidentialStores();
  useCareerStore.getState().reset();
  setCareer({ state: heir, news: [news] });
  resetGameForCareer(api);
  beginSemester(api, heir);
};
