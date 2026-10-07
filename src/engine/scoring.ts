/**
 * Score final e legado (GDD §4.5): metas 40%, aprovação final 25%,
 * economia 20% e eventos sobrevividos 15%, × dificuldade × tipo de final.
 */
import { ECONOMY, ENDING_MULTIPLIERS, SCORE } from '@/constants/balance';
import type { GameEnding, LatentRisk, LegacyTier, ScoreBreakdown, SimulationState } from '@/types';
import { clamp } from '@/utils/math';
import { getDifficultyConfig } from './difficulty';
import { getExposedRisks } from './latentRisks';

const ECONOMY_CRITERIA = 4;
const FULL_PROGRESS = 100;

/** Fração linear de `floor` (0) a `ceiling` (1), aceitando faixas decrescentes. */
const band = (value: number, floor: number, ceiling: number): number => clamp((value - floor) / (ceiling - floor), 0, 1);

/** Cada meta vale goalsMax/n; não cumprida rende parte proporcional ao progresso. */
const scoreGoals = (state: SimulationState): number => {
  if (state.goals.length === 0) return 0;
  const perGoal = SCORE.goalsMax / state.goals.length;
  return state.goals.reduce(
    (acc, goal) => acc + (goal.achieved ? perGoal : perGoal * SCORE.partialGoalShare * (goal.progress / FULL_PROGRESS)),
    0,
  );
};

const scoreApproval = (state: SimulationState): number =>
  SCORE.approvalMax * band(state.approval, SCORE.approvalFloor, SCORE.approvalCeiling);

/** Quatro quesitos iguais: crescimento, inflação perto da meta, desemprego e dívida. */
const scoreEconomy = (state: SimulationState): number => {
  const m = state.metrics;
  const growth = band(m.gdpGrowth, SCORE.growthFloor, SCORE.growthCeiling);
  const inflation = 1 - clamp(Math.abs(m.inflation - ECONOMY.inflationTarget) / SCORE.inflationTolerance, 0, 1);
  const unemployment = band(m.unemployment, SCORE.unemploymentFloor, SCORE.unemploymentCeiling);
  const debt = band(m.debt, SCORE.debtFloor, SCORE.debtCeiling);
  return (SCORE.economyMax / ECONOMY_CRITERIA) * (growth + inflation + unemployment + debt);
};

/** Crises bem conduzidas + bônus por CPIs e impeachments superados. */
const scoreEvents = (state: SimulationState): number => {
  const { crisesFaced, crisesHandled } = state.stats;
  const crises = crisesFaced > 0 ? SCORE.crisesWeight * (crisesHandled / crisesFaced) : SCORE.noCrisisScore;
  const survival =
    SCORE.cpiSurvivedBonus * state.congress.cpisSurvived + SCORE.impeachmentSurvivedBonus * state.congress.impeachmentsSurvived;
  return Math.min(SCORE.eventsMax, crises + survival);
};

const findLegacy = (total: number, tiers: readonly LegacyTier[]): LegacyTier | undefined =>
  [...tiers].sort((a, b) => b.minScore - a.minScore).find((tier) => total >= tier.minScore);

/**
 * Score final. Esquemas revelados (`latentRisks` com flag de exposição) descontam
 * `legacyPenalty` do total depois dos multiplicadores.
 */
export const calculateScore = (
  state: SimulationState,
  ending: GameEnding,
  legacyTiers: readonly LegacyTier[],
  latentRisks: readonly LatentRisk[] = [],
): ScoreBreakdown => {
  const goals = Math.round(scoreGoals(state));
  const approval = Math.round(scoreApproval(state));
  const economy = Math.round(scoreEconomy(state));
  const events = Math.round(scoreEvents(state));
  const subtotal = goals + approval + economy + events;
  const difficultyMultiplier = getDifficultyConfig(state.difficulty).scoreMultiplier;
  const endingMultiplier = ENDING_MULTIPLIERS[ending.type];
  const revealed = getExposedRisks(state, latentRisks);
  const integrityPenalty = revealed.reduce((acc, risk) => acc + risk.legacyPenalty, 0);
  const total = Math.max(0, Math.round(subtotal * difficultyMultiplier * endingMultiplier) - integrityPenalty);
  const legacy = findLegacy(total, legacyTiers);
  return {
    goals,
    approval,
    economy,
    events,
    subtotal,
    difficultyMultiplier,
    endingMultiplier,
    total,
    legacyTitle: legacy?.title ?? '—',
    legacyDescription: legacy?.description ?? '',
    integrityPenalty,
    revelations: revealed.map((risk) => risk.label),
  };
};
