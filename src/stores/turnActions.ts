import { MAX_NEWS_ARCHIVE } from '@/constants/game';
import { GAME_CONTENT } from '@/data';
import {
  advanceTurn,
  applyDiplomaticAction,
  applyPresidentialAction,
  canPerformDiplomaticAction,
  drawEvent,
  getDifficultyConfig,
  isPresidentialActionAvailable,
  prepareTurn,
  processTurn,
  PROGRAM_SLOT,
} from '@/engine';
import type { CountryId, DecisionChoice, GameData, InitiativeSlot, NewsItem, PresidentialAction, Relations, TurnEventChoice } from '@/types';
import { getCountry, getDiplomaticAction, getPresidentialAction, getProgram } from './content';
import { pickSimulationSlice } from './gameData';
import type { GameStoreActions, GameStoreApi } from './gameStoreTypes';
import { assembleSimulationState, distributeSimulationState, recordSnapshot } from './simulationBridge';

type TurnActions = Pick<
  GameStoreActions,
  'chooseDecisionOption' | 'toggleNegotiation' | 'confirmDecisions' | 'resolveEvent' | 'performDiplomaticAction' | 'performPresidentialAction' | 'launchProgram'
>;

const collectChoices = (data: GameData): DecisionChoice[] =>
  data.turnDecisionIds.flatMap((id) => (data.choices[id] ? [data.choices[id]] : []));

export const prependNews = (archive: readonly NewsItem[], news: readonly NewsItem[]): NewsItem[] =>
  [...news, ...archive].slice(0, MAX_NEWS_ARCHIVE);

const diffRelations = (before: Relations, after: Relations): Partial<Relations> =>
  Object.fromEntries((Object.keys(after) as CountryId[]).map((id) => [id, after[id] - before[id]]));

/** Processa o turno completo no engine e leva ao resumo do mês. */
const runTurn = (api: GameStoreApi, event: TurnEventChoice | null): void => {
  const game = api.get();
  const before = assembleSimulationState(pickSimulationSlice(game));
  const { state, report } = processTurn({
    state: before,
    decisions: collectChoices(game),
    event,
    content: GAME_CONTENT,
  });
  const slice = distributeSimulationState(state);
  recordSnapshot(state, state.turn);
  const fullReport = { ...report, relationDeltas: report.relationDeltas ?? diffRelations(before.relations, state.relations) };
  api.commit({ ...slice, phase: 'summary', lastReport: fullReport, newsArchive: prependNews(game.newsArchive, report.news) });
};

/** Avança o calendário e sorteia as decisões do novo mês. */
export const startNextTurn = (api: GameStoreApi): void => {
  const advanced = advanceTurn(assembleSimulationState(pickSimulationSlice(api.get())));
  const { state, decisionIds } = prepareTurn(advanced, GAME_CONTENT);
  api.commit({
    ...distributeSimulationState(state),
    phase: 'turn',
    turnDecisionIds: decisionIds,
    choices: {},
    currentEventId: null,
  });
};

const confirmDecisions = (api: GameStoreApi): void => {
  const game = api.get();
  if (game.phase !== 'turn' || !game.turnDecisionIds.every((id) => game.choices[id])) return;
  const { state, eventId } = drawEvent(assembleSimulationState(pickSimulationSlice(game)), GAME_CONTENT);
  const slice = distributeSimulationState(state);
  if (eventId === null) {
    api.set(slice);
    runTurn(api, null);
    return;
  }
  api.commit({ ...slice, phase: 'event', currentEventId: eventId });
};

const performDiplomaticAction = (api: GameStoreApi, actionId: string, countryId: CountryId): void => {
  const game = api.get();
  const action = getDiplomaticAction(actionId);
  const country = getCountry(countryId);
  const state = assembleSimulationState(pickSimulationSlice(game));
  if (game.phase !== 'turn' || !action || !country || !canPerformDiplomaticAction(state)) return;
  const result = applyDiplomaticAction(state, action, country.id, country.name);
  api.commit({ ...distributeSimulationState(result.state), newsArchive: prependNews(game.newsArchive, [result.news]) });
};

/** Iniciativa livre do mês (agenda ou programa), se a vaga e o cooldown permitirem. */
const performInitiative = (api: GameStoreApi, action: PresidentialAction | undefined, slot?: InitiativeSlot): void => {
  const game = api.get();
  const state = assembleSimulationState(pickSimulationSlice(game));
  if (game.phase !== 'turn' || !action || !isPresidentialActionAvailable(state, action, slot)) return;
  const result = applyPresidentialAction(state, action, getDifficultyConfig(state.difficulty), slot);
  api.commit({ ...distributeSimulationState(result.state), newsArchive: prependNews(game.newsArchive, result.news) });
};

export const createTurnActions = (api: GameStoreApi): TurnActions => ({
  chooseDecisionOption: (decisionId, optionId) => {
    const { choices } = api.get();
    const negotiate = choices[decisionId]?.negotiate ?? false;
    api.commit({ choices: { ...choices, [decisionId]: { decisionId, optionId, negotiate } } });
  },
  toggleNegotiation: (decisionId) => {
    const { choices } = api.get();
    const previous = choices[decisionId];
    if (!previous) return;
    api.commit({ choices: { ...choices, [decisionId]: { ...previous, negotiate: !previous.negotiate } } });
  },
  confirmDecisions: () => confirmDecisions(api),
  resolveEvent: (optionId) => {
    const { currentEventId, phase } = api.get();
    if (phase !== 'event' || !currentEventId) return;
    runTurn(api, { eventId: currentEventId, optionId });
  },
  performDiplomaticAction: (actionId, countryId) => performDiplomaticAction(api, actionId, countryId),
  performPresidentialAction: (actionId) => performInitiative(api, getPresidentialAction(actionId)),
  launchProgram: (programId) => performInitiative(api, getProgram(programId), PROGRAM_SLOT),
});
