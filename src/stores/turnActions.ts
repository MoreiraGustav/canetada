import { MAX_NEWS_ARCHIVE } from '@/constants/game';
import {
  advanceTurn,
  applyDiplomaticAction,
  applyFiscalStance,
  applyPresidentialAction,
  buildVisitAction,
  canPerformDiplomaticAction,
  CRISIS_SLOT,
  drawEvent,
  getDifficultyConfig,
  getFiscalStance,
  getGovernors,
  getStanceCooldownLeft,
  isPresidentialActionAvailable,
  prepareTurn,
  processTurn,
  PROGRAM_SLOT,
  replaceMinister as replaceMinisterInEngine,
  TRAVEL_SLOT,
} from '@/engine';
import type { CountryId, DecisionChoice, GameData, InitiativeSlot, NewsItem, PresidentialAction, Relations, TurnEventChoice } from '@/types';
import {
  getBrazilianState,
  getBrazilianStates,
  getCountry,
  getCrisisAction,
  getDiplomaticAction,
  getFiscalStanceById,
  getFiscalStances,
  getParties,
  getPresidentialAction,
  getProgram,
  getVisitKinds,
  getWorldContent,
  NAME_POOL,
} from './content';
import { pickSimulationSlice } from './gameData';
import type { GameStoreActions, GameStoreApi } from './gameStoreTypes';
import { assembleSimulationState, distributeSimulationState, recordSnapshot } from './simulationBridge';
import { usePlayerStore } from './usePlayerStore';

type TurnActions = Pick<
  GameStoreActions,
  | 'chooseDecisionOption'
  | 'toggleNegotiation'
  | 'confirmDecisions'
  | 'resolveEvent'
  | 'performDiplomaticAction'
  | 'performPresidentialAction'
  | 'launchProgram'
  | 'takeCrisisAction'
  | 'visitCity'
  | 'setFiscalStance'
  | 'replaceMinister'
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
    content: getWorldContent(game.world),
  });
  const slice = distributeSimulationState(state);
  recordSnapshot(state, state.turn);
  const fullReport = { ...report, relationDeltas: report.relationDeltas ?? diffRelations(before.relations, state.relations) };
  api.commit({ ...slice, phase: 'summary', lastReport: fullReport, newsArchive: prependNews(game.newsArchive, report.news) });
};

/** Avança o calendário e sorteia as decisões do novo mês. */
export const startNextTurn = (api: GameStoreApi): void => {
  const advanced = advanceTurn(assembleSimulationState(pickSimulationSlice(api.get())));
  const { state, decisionIds } = prepareTurn(advanced, getWorldContent(api.get().world));
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
  const { state, eventId } = drawEvent(assembleSimulationState(pickSimulationSlice(game)), getWorldContent(game.world));
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

/** Visita a uma cidade: monta a agenda pelo perfil da cidade e o peso do estado, na vaga de viagens. */
const visitCity = (api: GameStoreApi, stateId: string, cityId: string): void => {
  const uf = getBrazilianState(stateId);
  const city = uf?.cities.find((entry) => entry.id === cityId);
  if (!uf || !city) return;
  const game = api.get();
  const state = assembleSimulationState(pickSimulationSlice(game));
  const partyId = usePlayerStore.getState().candidate?.partyId ?? null;
  const governor = getGovernors(state, getBrazilianStates(), getParties(game.world), NAME_POOL, partyId).find((entry) => entry.stateId === uf.id);
  const action = buildVisitAction(state, uf, city, getVisitKinds(), getBrazilianStates(), governor);
  performInitiative(api, action ?? undefined, TRAVEL_SLOT);
};

/** Troca a política fiscal (no mês de decisões, fora do intervalo entre mudanças e se for outra postura). */
const setFiscalStance = (api: GameStoreApi, stanceId: string): void => {
  const game = api.get();
  const stance = getFiscalStanceById(stanceId);
  const state = assembleSimulationState(pickSimulationSlice(game));
  const stances = getFiscalStances();
  if (game.phase !== 'turn' || !stance || getStanceCooldownLeft(state) > 0 || getFiscalStance(state, stances)?.id === stance.id) return;
  const result = applyFiscalStance(state, stance, stances);
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
  takeCrisisAction: (actionId) => performInitiative(api, getCrisisAction(actionId), CRISIS_SLOT),
  visitCity: (stateId, cityId) => visitCity(api, stateId, cityId),
  setFiscalStance: (stanceId) => setFiscalStance(api, stanceId),
  replaceMinister: (ministry, profile, partyId) => {
    const game = api.get();
    if (game.phase !== 'turn') return;
    const result = replaceMinisterInEngine(assembleSimulationState(pickSimulationSlice(game)), ministry, profile, partyId, NAME_POOL);
    if (result.news.length === 0) return;
    api.commit({ ...distributeSimulationState(result.state), newsArchive: prependNews(game.newsArchive, result.news) });
  },
});
