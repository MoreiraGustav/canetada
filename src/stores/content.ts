/**
 * Catálogo de conteúdo estático exposto à UI (componentes não importam `data/` nem `engine/`).
 */
import { EVENT_CATEGORY_INFO, MINISTRY_INFO } from '@/constants/game';
import { GAME_CONTENT } from '@/data';
import type {
  Ability,
  BackgroundDefinition,
  Bloc,
  CampaignOption,
  CampaignQuestion,
  Candidate,
  Country,
  Decision,
  DiplomaticAction,
  EventCategoryInfo,
  GameEvent,
  GoalDefinition,
  MinistryId,
  MinistryInfo,
  Party,
  PresidentialAction,
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
export const getMinistry = (id: MinistryId): MinistryInfo => MINISTRY_INFO[id];
export const getEventCategory = (event: GameEvent): EventCategoryInfo => EVENT_CATEGORY_INFO[event.category];

export const getCampaignOption = (questionId: string, optionId: string): CampaignOption | undefined =>
  getCampaignQuestion(questionId)?.options.find((option) => option.id === optionId);
