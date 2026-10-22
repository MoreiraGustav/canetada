/**
 * Chance de aprovar uma proposta no Congresso e os bônus do mês (habilidade,
 * medida provisória, militância). Separado de congress.ts para o plenário
 * (plenary.ts) usá-lo sem dependência circular.
 */
import { CONGRESS, IDEOLOGY, MAX_VOTE_CHANCE, MIN_VOTE_CHANCE, NEGOTIATION_SUPPORT_BONUS, ORDINARY_LAW_THRESHOLD, PEC_THRESHOLD } from '@/constants/balance';
import type { SimulationState, VoteChanceParams } from '@/types';
import { clamp } from '@/utils/math';
import { isFlagActive } from './conditions';

/**
 * Chance de aprovação: logística em torno do limiar (50 lei / 60 PEC),
 * deslocada pela aprovação popular, + bônus da negociação e da habilidade.
 */
export const calculateVoteChance = (params: VoteChanceParams): number => {
  const threshold = params.type === 'pec' ? PEC_THRESHOLD : ORDINARY_LAW_THRESHOLD;
  const effectiveSupport = params.support + (params.negotiate ? NEGOTIATION_SUPPORT_BONUS : 0);
  const logOdds =
    (effectiveSupport - threshold) / CONGRESS.voteLogisticScale +
    CONGRESS.voteApprovalWeight * (params.approval - CONGRESS.voteApprovalReference);
  const probability = 1 / (1 + Math.exp(-logOdds)) + params.voteChanceBonus;
  // Medida provisória tem força de lei imediata: lei ordinária ganha chance mínima (a Constituição veda MP para PEC).
  const floor = params.provisionalMeasure && params.type === 'ordinary' ? IDEOLOGY.provisionalMeasureFloor : MIN_VOTE_CHANCE;
  return clamp(probability, floor, MAX_VOTE_CHANCE);
};

/** Medida provisória editada neste mês. */
export const hasProvisionalMeasure = (state: SimulationState): boolean => isFlagActive(state, FLAG_PROVISIONAL_MEASURE, 0);

/** Flags (definidas por ações da agenda) que reforçam as votações do mês. */
export const FLAG_PROVISIONAL_MEASURE = 'medida-provisoria';
export const FLAG_STREET_PRESSURE = 'militancia-nas-ruas';

/**
 * Bônus total na chance de aprovar leis neste mês: habilidade do presidente +
 * medida provisória editada no mês + militância nas ruas no mês.
 */
export const getVoteBonus = (state: SimulationState): number =>
  state.modifiers.voteChanceBonus +
  (isFlagActive(state, FLAG_PROVISIONAL_MEASURE, 0) ? IDEOLOGY.provisionalMeasureVoteBonus : 0) +
  (isFlagActive(state, FLAG_STREET_PRESSURE, 0) ? IDEOLOGY.streetPressureVoteBonus : 0);
