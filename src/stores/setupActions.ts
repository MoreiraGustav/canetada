import { GAME_MODES } from '@/constants/game';
import { GAME_CONTENT } from '@/data';
import {
  buildPlayerCandidate,
  calculateElectionResult,
  createInitialState,
  createNewsItem,
  prepareTurn,
  selectCampaignQuestions,
} from '@/engine';
import type { CampaignAnswer, CampaignOption, NewGameParams } from '@/types';
import { getCampaignOption } from './content';
import { advanceSeed, createInitialGameData, generateSeed } from './gameData';
import type { GameStoreActions, GameStoreApi } from './gameStoreTypes';
import { resetDomainStores } from './persistence';
import { distributeSimulationState, recordSnapshot } from './simulationBridge';
import { usePlayerStore } from './usePlayerStore';

type SetupActions = Pick<
  GameStoreActions,
  'goToSetup' | 'startNewGame' | 'chooseCandidate' | 'answerCampaign' | 'finishCampaign' | 'confirmElection' | 'confirmGoals'
>;

/** Converte as respostas da campanha nas opções completas, na ordem das perguntas. */
const resolveCampaignOptions = (questionIds: readonly string[], answers: readonly CampaignAnswer[]): CampaignOption[] =>
  questionIds.flatMap((questionId) => {
    const answer = answers.find((entry) => entry.questionId === questionId);
    const option = answer ? getCampaignOption(questionId, answer.optionId) : undefined;
    return option ? [option] : [];
  });

/** Cria o governo (estado inicial), sorteia as decisões do 1º mês e registra a posse. */
const startGovernment = (api: GameStoreApi, goalIds: string[]): void => {
  const game = api.get();
  const player = usePlayerStore.getState();
  if (!player.candidate || !player.election) return;
  const params: NewGameParams = {
    mode: game.mode,
    difficulty: game.difficulty,
    seed: game.seed,
    candidate: player.candidate,
    campaignOptions: resolveCampaignOptions(player.campaignQuestionIds, player.campaignAnswers),
    election: player.election,
    goalIds,
  };
  const initial = createInitialState(params, GAME_CONTENT);
  recordSnapshot(initial, 0);
  const { state, decisionIds } = prepareTurn(initial, GAME_CONTENT);
  const headline = `${player.candidate.name} toma posse como Presidente da República em Brasília`;
  api.commit({
    ...distributeSimulationState(state),
    phase: 'turn',
    turnDecisionIds: decisionIds,
    choices: {},
    currentEventId: null,
    lastReport: null,
    newsArchive: [createNewsItem(state.turn, headline, 'neutral', 'politics', 'posse')],
  });
};

export const createSetupActions = (api: GameStoreApi): SetupActions => ({
  goToSetup: () => api.set({ phase: 'setup' }),
  startNewGame: (mode, difficulty) => {
    resetDomainStores();
    const termLength = GAME_MODES[mode].turns;
    api.commit({ ...createInitialGameData(), phase: 'candidate', mode, difficulty, termLength, totalTurns: termLength, seed: generateSeed() });
  },
  chooseCandidate: (selection) => {
    const candidate = buildPlayerCandidate(selection, GAME_CONTENT);
    const { questionIds, seed } = selectCampaignQuestions(GAME_CONTENT.campaignQuestions, api.get().seed);
    usePlayerStore.getState().hydrate({ candidate, campaignQuestionIds: questionIds, campaignAnswers: [], election: null });
    api.commit({ phase: 'campaign', seed });
  },
  answerCampaign: (questionId, optionId) => {
    usePlayerStore.getState().setCampaignAnswer({ questionId, optionId });
    api.commit({});
  },
  finishCampaign: () => {
    const player = usePlayerStore.getState();
    if (!player.candidate) return;
    const options = resolveCampaignOptions(player.campaignQuestionIds, player.campaignAnswers);
    const { seed } = api.get();
    usePlayerStore.getState().hydrate({ election: calculateElectionResult(player.candidate, options, GAME_CONTENT, seed) });
    api.commit({ phase: 'election-result', seed: advanceSeed(seed) });
  },
  confirmElection: () => api.commit({ phase: 'goals' }),
  confirmGoals: (goalIds) => startGovernment(api, goalIds),
});
