/**
 * Catálogo de conteúdo estático exposto à UI (componentes não importam `data/` nem `engine/`).
 */
import { EVENT_CATEGORY_INFO, MINISTRY_INFO } from '@/constants/game';
import { GAME_CONTENT } from '@/data';
import { BRAZIL_MAP, BRAZIL_MAP_VIEWBOX } from '@/data/brazilMap';
import type {
  Ability,
  BackgroundDefinition,
  Bloc,
  BrazilianState,
  CampaignOption,
  CampaignQuestion,
  Candidate,
  Country,
  Decision,
  DiplomaticAction,
  EventCategoryInfo,
  FiscalStance,
  GameEvent,
  GoalDefinition,
  MinistryId,
  MinistryInfo,
  Party,
  GovernmentProgram,
  PresidentialAction,
  StateShape,
  VisitKind,
} from '@/types';
import { indexById } from '@/utils/math';

const DECISIONS_BY_ID = indexById(GAME_CONTENT.decisions);
const EVENTS_BY_ID = indexById(GAME_CONTENT.events);
const PARTIES_BY_ID = indexById(GAME_CONTENT.parties);
const CANDIDATES_BY_ID = indexById(GAME_CONTENT.candidates);
const COUNTRIES_BY_ID = indexById(GAME_CONTENT.countries);
const GOALS_BY_ID = indexById(GAME_CONTENT.goals);
const ABILITIES_BY_ID = indexById(GAME_CONTENT.abilities);
const BACKGROUNDS_BY_ID = indexById(GAME_CONTENT.backgrounds);
const QUESTIONS_BY_ID = indexById(GAME_CONTENT.campaignQuestions);
const DIPLOMATIC_ACTIONS_BY_ID = indexById(GAME_CONTENT.diplomaticActions);
const PRESIDENTIAL_ACTIONS_BY_ID = indexById(GAME_CONTENT.presidentialActions);
const PROGRAMS_BY_ID = indexById(GAME_CONTENT.programs);
const CRISIS_ACTIONS_BY_ID = indexById(GAME_CONTENT.crisisActions);
const STANCES_BY_ID = indexById(GAME_CONTENT.fiscalStances);
const STATES_BY_ID = indexById(GAME_CONTENT.states);

/** ID do país → nome (para dicas de impacto). */
export const COUNTRY_NAMES: Readonly<Record<string, string>> = Object.fromEntries(
  GAME_CONTENT.countries.map((country) => [country.id, country.name]),
);

export const getCandidates = (): readonly Candidate[] => GAME_CONTENT.candidates;
export const getParties = (): readonly Party[] => GAME_CONTENT.parties;
export const getBackgrounds = (): readonly BackgroundDefinition[] => GAME_CONTENT.backgrounds;
export const getAbilities = (): readonly Ability[] => GAME_CONTENT.abilities;
export const getGoalDefinitions = (): readonly GoalDefinition[] => GAME_CONTENT.goals;
export const getCountries = (): readonly Country[] => GAME_CONTENT.countries;
export const getBlocs = (): readonly Bloc[] => GAME_CONTENT.blocs;
export const getDiplomaticActions = (): readonly DiplomaticAction[] => GAME_CONTENT.diplomaticActions;
export const getPresidentialActions = (): readonly PresidentialAction[] => GAME_CONTENT.presidentialActions;
export const getPrograms = (): readonly GovernmentProgram[] => GAME_CONTENT.programs;
export const getCrisisActions = (): readonly PresidentialAction[] => GAME_CONTENT.crisisActions;
export const getFiscalStances = (): readonly FiscalStance[] => GAME_CONTENT.fiscalStances;
export const getBrazilianStates = (): readonly BrazilianState[] => GAME_CONTENT.states;
export const getVisitKinds = (): readonly VisitKind[] => GAME_CONTENT.visitKinds;
/** Contornos das UFs e viewBox do mapa de viagens. */
export const getBrazilMap = (): { viewBox: string; shapes: readonly StateShape[] } => ({ viewBox: BRAZIL_MAP_VIEWBOX, shapes: BRAZIL_MAP });

export const getDecision = (id: string): Decision | undefined => DECISIONS_BY_ID[id];
export const getEvent = (id: string): GameEvent | undefined => EVENTS_BY_ID[id];
export const getParty = (id: string): Party | undefined => PARTIES_BY_ID[id];
export const getCandidate = (id: string): Candidate | undefined => CANDIDATES_BY_ID[id];
export const getCountry = (id: string): Country | undefined => COUNTRIES_BY_ID[id];
export const getGoalDefinition = (id: string): GoalDefinition | undefined => GOALS_BY_ID[id];
export const getAbility = (id: string): Ability | undefined => ABILITIES_BY_ID[id];
export const getBackground = (id: string): BackgroundDefinition | undefined => BACKGROUNDS_BY_ID[id];
export const getCampaignQuestion = (id: string): CampaignQuestion | undefined => QUESTIONS_BY_ID[id];
export const getDiplomaticAction = (id: string): DiplomaticAction | undefined => DIPLOMATIC_ACTIONS_BY_ID[id];
export const getPresidentialAction = (id: string): PresidentialAction | undefined => PRESIDENTIAL_ACTIONS_BY_ID[id];
export const getProgram = (id: string): GovernmentProgram | undefined => PROGRAMS_BY_ID[id];
export const getCrisisAction = (id: string): PresidentialAction | undefined => CRISIS_ACTIONS_BY_ID[id];
export const getFiscalStanceById = (id: string): FiscalStance | undefined => STANCES_BY_ID[id];
export const getBrazilianState = (id: string): BrazilianState | undefined => STATES_BY_ID[id];
export const getMinistry = (id: MinistryId): MinistryInfo => MINISTRY_INFO[id];
export const getEventCategory = (event: GameEvent): EventCategoryInfo => EVENT_CATEGORY_INFO[event.category];

export const getCampaignOption = (questionId: string, optionId: string): CampaignOption | undefined =>
  getCampaignQuestion(questionId)?.options.find((option) => option.id === optionId);
