/** API pública do modo carreira (funções puras). */
export { careerStats, meetsCriterion, unlockAchievements } from './achievements';
export { actionCooldownLeft, applyCareerAgenda, getOpenActions, getOpenAdminPrograms, isActionOpen } from './actions';
export { amendmentFactor, amendmentTranche, annualAmendments, getAmendmentTargets, sendAmendments } from './amendments';
export { billBlockReason, committeeChance, expectedFloorSupport, findBill, floorPassChance, presentBill, pushBill, stepBills } from './bills';
export { adminRevenue, careerBudget, cityRevenue, committedPoints, contasPointValue, findWork, stateRevenue, workInstallment } from './budget';
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
export { applyCareerImpact, impactTone, saturationFactor, scaleCareerImpact, setCareerFlags, sumCareerImpacts } from './impacts';
export { calculateCareerLegacy } from './legacy';
export {
  castFloorVote,
  chamberSeats,
  createLegislature,
  findFloorVote,
  getOpenFloorVotes,
  houseName,
  ideologicalSide,
  legislativeOffice,
  drawFloorVote,
  naturalSideFor,
  partyLineFor,
  voteImpacts,
} from './legislature';
export { applyMandatePlan, openCareerSemester } from './mandate';
export { createPost, currentPostId, currentViceOffice, drawMission, findMission, getOpenMissions, referralDiscount, resolveMission, stepPost, titularFactor, viceTitular } from './post';
export { appealChance, appealVerdictAt, becomeIneligible, caseBackstory, fileAppeal, findCase, migrateLegacyConviction, pendingCharges, stepAppeal } from './justice';
export type { CaseStepRecord } from './justice';
export { createHeirCareer, heirMetrics, heirStartTurn, nextDynasty } from './heir';
export { leavePresidency, presidencySemesters } from './postPresidency';
export { expectedDelivery, getWorkCatalog, startWork, stepWorks, workBlockReason, worksFactor } from './works';
export { buildCareerCandidate, calculateCareerPresidentialElection, deriveCareerAbility, enterPresidency, successionElectionResult } from './presidency';
export type { CareerPresidentialOutcome } from './presidency';
export { canSwitchParty, checkAppointment, createCareer, joinParty, leaveAppointment, takeAppointment, withCareerDefaults } from './setup';
export { fillCareerText, getPositionTitle } from './text';
export { advanceCareerTurn, buildCareerReport, closeCareerSemester, hasReachedRetirement } from './turn';
export { electorateFit, electorateLean, nationalLean } from './world';
