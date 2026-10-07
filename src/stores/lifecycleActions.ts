import { MAX_TERMS } from '@/constants/game';
import { GAME_CONTENT } from '@/data';
import {
  advanceTurn,
  calculateReelection,
  calculateScore,
  createNewsItem,
  prepareTurn,
  resolvePostTermRisks,
  startSecondTerm,
} from '@/engine';
import type { EndingType, GameEnding } from '@/types';
import { createInitialGameData, pickSimulationSlice } from './gameData';
import type { GameStoreActions, GameStoreApi } from './gameStoreTypes';
import { clearSave, loadGame, resetDomainStores } from './persistence';
import { assembleSimulationState, distributeSimulationState } from './simulationBridge';
import { prependNews, startNextTurn } from './turnActions';
import { usePlayerStore } from './usePlayerStore';

type LifecycleActions = Pick<
  GameStoreActions,
  'advance' | 'continueToSecondTerm' | 'retire' | 'goToMenu' | 'continueSavedGame' | 'abandonGame'
>;

/** Encerra a partida: investigações pós-mandato, score e legado, e vai para a tela de resultado. */
const finishGame = (api: GameStoreApi, type: EndingType): void => {
  const game = api.get();
  const { state } = resolvePostTermRisks(assembleSimulationState(pickSimulationSlice(game)), GAME_CONTENT.latentRisks);
  const reelected = game.termNumber > 1 || (game.reelection?.reelected ?? false);
  const ending: GameEnding = {
    type,
    turn: game.turn,
    reelected,
    reelectionVoteShare: game.reelection?.voteShare ?? null,
  };
  const score = calculateScore(state, ending, GAME_CONTENT.legacyTiers, GAME_CONTENT.latentRisks);
  api.commit({ ...distributeSimulationState(state), phase: 'result', ending, score });
};

/** Fim de mandato: no 1º, apura a reeleição; no último, encerra a partida. */
const concludeTerm = (api: GameStoreApi): void => {
  const game = api.get();
  if (game.termNumber >= MAX_TERMS) {
    finishGame(api, 'completed-two-terms');
    return;
  }
  const reelection = calculateReelection(assembleSimulationState(pickSimulationSlice(game)));
  api.commit({ phase: 'reelection', reelection });
};

const continueToSecondTerm = (api: GameStoreApi): void => {
  const game = api.get();
  if (game.phase !== 'reelection' || !game.reelection?.reelected) return;
  const renewed = advanceTurn(startSecondTerm(assembleSimulationState(pickSimulationSlice(game))));
  const { state, decisionIds } = prepareTurn(renewed, GAME_CONTENT);
  const name = usePlayerStore.getState().candidate?.name ?? 'Presidente';
  const news = createNewsItem(state.turn, `${name} toma posse para o segundo mandato`, 'neutral', 'politics', 'posse-2');
  api.commit({
    ...distributeSimulationState(state),
    phase: 'turn',
    turnDecisionIds: decisionIds,
    choices: {},
    currentEventId: null,
    lastReport: null,
    newsArchive: prependNews(game.newsArchive, [news]),
  });
};

export const createLifecycleActions = (api: GameStoreApi): LifecycleActions => ({
  advance: () => {
    const { phase, lastReport } = api.get();
    if (phase !== 'summary') return;
    const outcome = lastReport?.outcome ?? 'continue';
    if (outcome === 'impeached') finishGame(api, 'impeached');
    else if (outcome === 'term-ended') concludeTerm(api);
    else startNextTurn(api);
  },
  continueToSecondTerm: () => continueToSecondTerm(api),
  retire: () => {
    const { phase, reelection } = api.get();
    if (phase !== 'reelection') return;
    finishGame(api, reelection?.reelected ? 'retired' : 'defeated');
  },
  goToMenu: () => api.set({ phase: 'menu' }),
  continueSavedGame: () => {
    const data = loadGame();
    if (!data) return false;
    api.set({ ...createInitialGameData(), ...data });
    return true;
  },
  abandonGame: () => {
    clearSave();
    resetDomainStores();
    api.set(createInitialGameData());
  },
});
