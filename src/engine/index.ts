/** API pública do engine (funções puras, sem React/Zustand/DOM). */
export { getChoiceAlignment, isAlignedChoice, totalImpactDelta } from './alignment';
export { calculateApproval } from './approval';
export { explainApproval } from './approvalOutlook';
export { evaluateCondition, evaluateConditions, getIndicatorValue, isFlagActive } from './conditions';
export { calculateVoteChance, FLAG_RECENT_NEGOTIATION, getNegotiationCost, getPoliticalStatus, getVoteBonus, hasProvisionalMeasure, isImpeached, stepCongress } from './congress';
export { applyDecisionChoice, isDecisionEligible, selectTurnDecisions } from './decisions';
export { getDifficultyConfig } from './difficulty';
export { applyDiplomaticAction, canPerformDiplomaticAction, stepDiplomacy } from './diplomacy';
export {
  buildPlayerCandidate,
  calculateElectionResult,
  calculateReelection,
  createInitialState,
  deriveIdeologyAffinity,
  selectCampaignQuestions,
  startSecondTerm,
} from './election';
export { getEligibleEvents, resolveEventOption, selectEvent } from './events';
export {
  applyFiscalStance,
  createFiscalCostEstimator,
  getFiscalStance,
  getPublicAccounts,
  getStanceCooldownLeft,
  gdpShareToBillions,
  projectDebt,
  stepFiscalPolicy,
} from './fiscal';
export { createGoalProgress, updateGoalProgress } from './goals';
export { getExposedRisks, getRiskChance, isRiskPending, resolvePostTermRisks, stepLatentRisks } from './latentRisks';
export { applyActiveEffects, applyImpact, scaleImpact, scaleImpactByPolarity, scheduleDelayedImpacts } from './impacts';
export { createNewsItem, generateIndicatorNews } from './news';
export { stepNewsBlips } from './newsBlips';
export { rollOutcomeRisk } from './outcomes';
export { explainVoteChance, splitVotesByParty, tallyVotes } from './plenary';
export {
  AGENDA_SLOT,
  applyPresidentialAction,
  canTakePresidentialAction,
  CRISIS_SLOT,
  getActionCooldownLeft,
  getInitiativeLastTurn,
  isPresidentialActionAvailable,
  PROGRAM_SLOT,
  TRAVEL_SLOT,
} from './presidentialActions';
export { createPromises, stepPromises } from './promises';
export { createRng, pickWeighted, randomBetween, randomInt, randomNormal, shuffle } from './random';
export { calculateScore } from './scoring';
export { computeApprovalSignals, computeSectorEquilibrium, militancyBonus, stepEconomy, stepSectors, stepSocial } from './simulation';
export { buildVisitAction, fillVisitTemplate, getStateApprovals, getStateCooldownLeft, stateAffinity } from './travel';
export { advanceTurn, drawEvent, prepareTurn, processTurn } from './turn';
