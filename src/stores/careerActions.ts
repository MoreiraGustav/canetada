/**
 * Ações do modo carreira na `useGameStore`: criar o personagem, filiar-se,
 * jogar o semestre (agenda → acontecimento → balanço), disputar eleições e
 * chegar à Presidência. O estado da carreira fica na `useCareerStore`.
 */
import { GAME_MODES } from '@/constants/game';
import {
  advanceCareerTurn,
  applyCareerAgenda,
  canSwitchParty,
  checkAppointment,
  closeCareerSemester,
  createCareer,
  drawCareerEvent,
  findAppointment,
  joinParty,
  leaveAppointment,
  resolveCareerEvent,
  runCareerElection,
  takeAppointment,
  buildCareerReport,
  declarePreCandidacy,
  evaluateCandidacy,
  findOffice,
  resolveRunoff,
  runPrimary,
} from '@/engine';
import type { CampaignChoices, CareerElectionRecord, CareerNews, CareerOfficeId, CareerState } from '@/types';
import { beginSemester, careerContentOf, careerData, closeSemester, endCareer, prependCareerNews, setCareer } from './careerFlow';
import { enterPresidencyBySuccession, startPresidentialRun } from './careerPresidency';
import { getCareerContent } from './content';
import { createInitialGameData, generateSeed } from './gameData';
import type { GameStoreActions, GameStoreApi } from './gameStoreTypes';
import { resetDomainStores } from './persistence';

type CareerActions = Pick<
  GameStoreActions,
  | 'goToCareerSetup'
  | 'startCareer'
  | 'chooseCareerParty'
  | 'switchCareerParty'
  | 'takeCareerAppointment'
  | 'leaveCareerAppointment'
  | 'endCareerSemester'
  | 'resolveCareerEvent'
  | 'advanceCareer'
  | 'chooseCandidacy'
  | 'backToConvention'
  | 'runCampaign'
  | 'chooseRunoff'
  | 'declarePreCandidacy'
  | 'skipElection'
  | 'retireCareer'
>;

const PRESIDENT = 'presidente';

/** Aplica uma mudança imediata no meio do semestre (cargo, partido) e salva. */
const applyNow = (api: GameStoreApi, result: { state: CareerState; news: CareerNews[] }): void => {
  setCareer({ state: result.state, semesterNews: [...careerData().semesterNews, ...result.news] });
  api.commit({});
};

const startCareer = (api: GameStoreApi, input: Parameters<GameStoreActions['startCareer']>[0]): void => {
  resetDomainStores();
  const state = createCareer(input, getCareerContent(input.world), generateSeed());
  setCareer({ state, semesterStart: state });
  const termLength = GAME_MODES[input.presidencyMode].turns;
  api.commit({
    ...createInitialGameData(),
    phase: 'career-party',
    world: input.world,
    mode: input.presidencyMode,
    difficulty: input.difficulty,
    termLength,
    totalTurns: termLength,
    seed: generateSeed(),
  });
};

/** Primeira filiação: a trajetória começa. */
const chooseCareerParty = (api: GameStoreApi, partyId: string): void => {
  const { state } = careerData();
  if (!state || state.partyId !== null) return;
  const joined = joinParty(state, careerContentOf(state), partyId);
  setCareer({ news: prependCareerNews(careerData().news, joined.news) });
  beginSemester(api, joined.state);
};

const endCareerSemester = (api: GameStoreApi): void => {
  const data = careerData();
  if (!data.state) return;
  const agenda = applyCareerAgenda(data.state, careerContentOf(data.state), data.plannedActionIds, data.plannedProgramId);
  const drawn = drawCareerEvent(agenda.state, careerContentOf(agenda.state));
  setCareer({ state: drawn.state, semesterNews: [...data.semesterNews, ...agenda.news], currentEventId: drawn.eventId });
  if (drawn.eventId) {
    api.commit({ phase: 'career-event' });
    return;
  }
  closeSemester(drawn.state, [], null, null);
  api.commit({ phase: 'career-summary' });
};

const resolveEvent = (api: GameStoreApi, optionId: string): void => {
  const { state, currentEventId } = careerData();
  if (!state || !currentEventId) return;
  const resolved = resolveCareerEvent(state, careerContentOf(state), currentEventId, optionId);
  // O vice-presidente que assume vai direto governar o país.
  if (resolved.state.position?.id === PRESIDENT) {
    setCareer({ news: prependCareerNews(careerData().news, [...careerData().semesterNews, ...resolved.news]), semesterNews: [] });
    enterPresidencyBySuccession(api, resolved.state);
    return;
  }
  closeSemester(resolved.state, resolved.news, currentEventId, optionId);
  api.commit({ phase: 'career-summary' });
};

/** Balanço (ou apuração) → semestre seguinte: eleições de fundo, fim de mandato e posse. */
const advanceCareer = (api: GameStoreApi): void => {
  const { state, news } = careerData();
  if (!state) return;
  const advanced = advanceCareerTurn(state, careerContentOf(state));
  setCareer({ news: prependCareerNews(news, advanced.news) });
  beginSemester(api, advanced.state);
};

/** Fecha o semestre da eleição: a apuração faz as vezes do balanço. */
const finishElection = (api: GameStoreApi, state: CareerState, record: CareerElectionRecord, news: readonly CareerNews[]): void => {
  const data = careerData();
  const closed = closeCareerSemester(state, careerContentOf(state));
  const all = [...data.semesterNews, ...news, ...closed.news];
  setCareer({
    state: closed.state,
    lastElection: record,
    pendingRunoff: null,
    campaignOfficeId: null,
    lastReport: buildCareerReport(data.semesterStart ?? state, closed.state, all, null, null),
    news: prependCareerNews(data.news, all),
    semesterNews: [],
  });
  api.commit({ phase: 'career-election-result' });
};

/** Convenção: a Presidência passa pela prévia e vai ao debate; os demais cargos, à campanha. */
const chooseCandidacy = (api: GameStoreApi, officeId: CareerOfficeId): void => {
  const { state } = careerData();
  if (!state) return;
  if (officeId !== PRESIDENT) {
    setCareer({ campaignOfficeId: officeId });
    api.commit({ phase: 'career-campaign' });
    return;
  }
  const content = careerContentOf(state);
  const office = findOffice(content, PRESIDENT);
  if (!office) return;
  const primary = runPrimary(state, content, office, evaluateCandidacy(state, content, office));
  if (primary.passed) startPresidentialRun(api, primary.state, primary.news);
  else if (primary.record) finishElection(api, primary.state, primary.record, primary.news);
};

const runCampaign = (api: GameStoreApi, choices: CampaignChoices): void => {
  const { state, campaignOfficeId, semesterNews } = careerData();
  if (!state || !campaignOfficeId) return;
  const result = runCareerElection(state, careerContentOf(state), campaignOfficeId, choices);
  if (!result.record) return;
  if (result.runoffPending) {
    setCareer({ state: result.state, pendingRunoff: result.record, semesterNews: [...semesterNews, ...result.news] });
    api.commit({ phase: 'career-runoff' });
    return;
  }
  finishElection(api, result.state, result.record, result.news);
};

const chooseRunoff = (api: GameStoreApi, optionId: string): void => {
  const { state, pendingRunoff } = careerData();
  if (!state || !pendingRunoff) return;
  const result = resolveRunoff(state, careerContentOf(state), pendingRunoff, optionId);
  finishElection(api, result.state, result.record, result.news);
};

export const createCareerActions = (api: GameStoreApi): CareerActions => ({
  goToCareerSetup: () => api.set({ phase: 'career-setup' }),
  startCareer: (input) => startCareer(api, input),
  chooseCareerParty: (partyId) => chooseCareerParty(api, partyId),
  switchCareerParty: (partyId) => {
    const { state } = careerData();
    if (!state || !canSwitchParty(state, careerContentOf(state)).ok) return;
    applyNow(api, joinParty(state, careerContentOf(state), partyId));
  },
  takeCareerAppointment: (appointmentId) => {
    const { state } = careerData();
    if (!state) return;
    const content = careerContentOf(state);
    const appointment = findAppointment(content, appointmentId);
    if (!appointment || !checkAppointment(state, content, appointment).ok) return;
    applyNow(api, takeAppointment(state, content, appointmentId));
  },
  leaveCareerAppointment: () => {
    const { state } = careerData();
    if (state) applyNow(api, leaveAppointment(state, careerContentOf(state)));
  },
  endCareerSemester: () => endCareerSemester(api),
  resolveCareerEvent: (optionId) => resolveEvent(api, optionId),
  advanceCareer: () => advanceCareer(api),
  chooseCandidacy: (officeId) => chooseCandidacy(api, officeId),
  backToConvention: () => api.commit({ phase: 'career-election' }),
  runCampaign: (choices) => runCampaign(api, choices),
  chooseRunoff: (optionId) => chooseRunoff(api, optionId),
  declarePreCandidacy: (officeId) => {
    const { state } = careerData();
    if (state) applyNow(api, declarePreCandidacy(state, careerContentOf(state), officeId));
  },
  skipElection: () => api.commit({ phase: 'career-turn' }),
  retireCareer: () => {
    const { state } = careerData();
    if (state) endCareer(api, state, 'anuncia a aposentadoria da vida pública');
  },
});
