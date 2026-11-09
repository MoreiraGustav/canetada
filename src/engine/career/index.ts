/** API pública do modo carreira (funções puras). */
export { actionCooldownLeft, applyCareerAgenda, getOpenActions, getOpenAdminPrograms, isActionOpen } from './actions';
export { adversaryFor, ballotNumber, chanceFor, evaluateCandidacy, getElectionOffices, hasGuaranteedNomination, listCandidacies, officeDifficulty, primaryFor, takesLeaveFor } from './candidacy';
export { applyCampaignMarks, campaignCap, campaignOptionPoints, campaignSettlesPrimary, campaignDecisionsFor, campaignFinance, defaultCampaignChoices, planCampaign, rollCampaignRisks, strategyBonus, TONE_KEY } from './campaign';
export type { CampaignPlan } from './campaign';
export { changeRelation, characterAge, characterTarget, ensureCareerCast, getCharacter, leaveCastBehind, retireCharacter, shortName, stepCareerCast } from './characters';
export { declarePreCandidacy, pollFor, stepPolls } from './polls';
export { decisiveShare, firstRoundOutcome, firstRoundShares, hasRunoff, rollFirstRound, runoffChanceFromLead, runoffShare } from './rounds';
export { resolveBackgroundElections, resolveCastElections } from './background';
export { evaluateCareerCondition, evaluateCareerConditions } from './conditions';
export { electorateFor, resolveRunoff, runCareerElection, runoffChance, runPrimary, seatsFor } from './elections';
export type { ElectionRun, PrimaryResult } from './elections';
export { vacatePosition } from './positions';
export { applyCareerEffect, drawCareerEvent, getEligibleCareerEvents, resolveCareerEvent } from './events';
export {
  ageAt,
  arePartiesAllied,
  currentAppointment,
  currentOffice,
  findAppointment,
  findCity,
  findOffice,
  findParty,
  getCareerLevel,
  getCareerRole,
  getGovernmentRelation,
  hasMunicipalElections,
  partyInfluenceFactor,
} from './helpers';
export { applyCareerImpact, impactTone, saturationFactor } from './impacts';
export { calculateCareerLegacy } from './legacy';
export { buildCareerCandidate, calculateCareerPresidentialElection, deriveCareerAbility, enterPresidency, successionElectionResult } from './presidency';
export type { CareerPresidentialOutcome } from './presidency';
export { canSwitchParty, checkAppointment, createCareer, joinParty, leaveAppointment, takeAppointment } from './setup';
export { fillCareerText, getPositionTitle } from './text';
export { advanceCareerTurn, buildCareerReport, closeCareerSemester, hasReachedRetirement } from './turn';
export { electorateFit, electorateLean, nationalLean } from './world';
