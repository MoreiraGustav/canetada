import { ALIGNED_DECISION_WEIGHT, DECISION_RECYCLE_TURNS, DEFAULT_DECISION_COOLDOWN, SEEN_DECISION_WEIGHT } from '@/constants/balance';
import { MAX_DECISIONS_PER_TURN, MAX_VOTE_RECORDS, MIN_DECISIONS_PER_TURN } from '@/constants/game';
import type {
  Decision,
  DecisionOption,
  DecisionResult,
  DecisionSelection,
  DifficultyConfig,
  GoalDefinition,
  MinistryId,
  NewsItem,
  Rng,
  SimulationState,
  StateWithNews,
  VoteRecord,
} from '@/types';
import { getTurnDate } from '@/utils/calendar';
import { getChoiceAlignment, isAlignedChoice } from './alignment';
import { evaluateConditions } from './conditions';
import { calculateVoteChance, FLAG_RECENT_NEGOTIATION, getNegotiationCost, getVoteBonus, hasProvisionalMeasure } from './congress';
import { applyImpact, imprintPolicyMemory, scaleImpactByPolarity, scheduleDelayedImpacts, setFlags, toneFromImpact } from './impacts';
import { createNewsItem } from './news';
import { rollOutcomeRisk } from './outcomes';
import { pickWeighted, randomInt, withStateRng } from './random';

const DEFAULT_DECISION_WEIGHT = 1;

/**
 * Elegibilidade quanto ao histórico: repetíveis respeitam o cooldown; não-repetíveis
 * só voltam após DECISION_RECYCLE_TURNS e se nenhuma flag das suas opções estiver ativa.
 */
const isHistoryEligible = (state: SimulationState, decision: Decision): boolean => {
  const last = state.decisionHistory[decision.id];
  if (last === undefined) return true;
  const elapsed = state.turn - last;
  if (decision.repeatable) return elapsed >= (decision.cooldown ?? DEFAULT_DECISION_COOLDOWN);
  const resolved = decision.options.some((option) => (option.flags ?? []).some((flag) => state.flags[flag] !== undefined));
  return !resolved && elapsed >= DECISION_RECYCLE_TURNS;
};

export const isDecisionEligible = (state: SimulationState, decision: Decision): boolean => {
  const { month } = getTurnDate(state.turn);
  return (
    (decision.minTurn === undefined || state.turn >= decision.minTurn) &&
    (decision.months === undefined || decision.months.includes(month)) &&
    isHistoryEligible(state, decision) &&
    evaluateConditions(state, decision.conditions)
  );
};

/** Alguma opção da decisão ajuda uma meta do mandato ou promessa pendente. */
const isAlignedDecision = (state: SimulationState, decision: Decision, goals: readonly GoalDefinition[]): boolean =>
  decision.options.some((option) => isAlignedChoice(getChoiceAlignment(state, goals, option)));

interface DrawCandidate {
  decision: Decision;
  aligned: boolean;
}

/** Peso de sorteio: `weight` × novidade (não-repetíveis já vistas pesam menos) × alinhamento com metas/promessas. */
const drawWeight = ({ decision, aligned }: DrawCandidate, history: Record<string, number>): number => {
  const seen = !decision.repeatable && history[decision.id] !== undefined;
  return (decision.weight ?? DEFAULT_DECISION_WEIGHT) * (seen ? SEEN_DECISION_WEIGHT : 1) * (aligned ? ALIGNED_DECISION_WEIGHT : 1);
};

/** A primeira decisão sai do grupo alinhado (se houver); as demais, do pool todo. */
const drawDecisions = (rng: Rng, pool: readonly DrawCandidate[], history: Record<string, number>): Decision[] => {
  const target = randomInt(rng, MIN_DECISIONS_PER_TURN, MAX_DECISIONS_PER_TURN);
  const picked: Decision[] = [];
  const usedMinistries = new Set<MinistryId>();
  while (picked.length < target) {
    const open = pool.filter((candidate) => !usedMinistries.has(candidate.decision.ministry));
    const aligned = open.filter((candidate) => candidate.aligned);
    const remaining = picked.length === 0 && aligned.length > 0 ? aligned : open;
    const choice = pickWeighted(rng, remaining.map((candidate) => ({ item: candidate.decision, weight: drawWeight(candidate, history) })));
    if (!choice) break;
    picked.push(choice);
    usedMinistries.add(choice.ministry);
  }
  return picked;
};

/**
 * Sorteia de 3 a 4 decisões elegíveis (no máximo 1 por ministério), ponderadas por `weight`,
 * novidade e alinhamento com as metas (`goals`) e promessas pendentes do jogador.
 */
export const selectTurnDecisions = (
  state: SimulationState,
  decisions: readonly Decision[],
  goals: readonly GoalDefinition[] = [],
): DecisionSelection => {
  const pool = decisions
    .filter((decision) => isDecisionEligible(state, decision))
    .map((decision) => ({ decision, aligned: isAlignedDecision(state, decision, goals) }));
  const { result: picked, seed } = withStateRng(state, (rng) => drawDecisions(rng, pool, state.decisionHistory));
  const decisionHistory = { ...state.decisionHistory, ...Object.fromEntries(picked.map((decision) => [decision.id, state.turn])) };
  return { state: { ...state, decisionHistory, seed }, decisionIds: picked.map((decision) => decision.id) };
};

/** Executa a opção: impacto escalado pela dificuldade, efeitos graduais, flags, memória política e desfecho incerto. */
const executeOption = (
  state: SimulationState,
  decision: Decision,
  option: DecisionOption,
  rng: Rng,
  difficulty: DifficultyConfig,
): StateWithNews => {
  const scaling = { positive: difficulty.positiveImpactMultiplier, negative: difficulty.negativeImpactMultiplier };
  const delayed = option.delayed?.map((entry) => ({ ...entry, impact: scaleImpactByPolarity(entry.impact, scaling) }));
  const applied = applyImpact(state, option.impact, scaling);
  const scheduled = scheduleDelayedImpacts(applied, decision.id, decision.title, delayed);
  const executed = imprintPolicyMemory(setFlags(scheduled, option.flags), option.impact);
  return rollOutcomeRisk(executed, option.risk, decision.id, decision.title, rng, scaling);
};

const negotiate = (state: SimulationState): SimulationState => {
  const paid = applyImpact(state, getNegotiationCost(state.modifiers));
  return setFlags({ ...paid, stats: { ...paid.stats, negotiations: paid.stats.negotiations + 1 } }, [FLAG_RECENT_NEGOTIATION]);
};

const recordVote = (state: SimulationState, vote: VoteRecord): SimulationState => ({
  ...state,
  congress: { ...state.congress, votes: [...state.congress.votes, vote].slice(-MAX_VOTE_RECORDS) },
  stats: {
    ...state.stats,
    lawsApproved: state.stats.lawsApproved + (vote.approved ? 1 : 0),
    lawsRejected: state.stats.lawsRejected + (vote.approved ? 0 : 1),
  },
});

/**
 * Aplica a escolha do jogador. Opções legislativas passam por votação (chance
 * de `calculateVoteChance`); negociar cobra o custo antes da votação.
 */
export const applyDecisionChoice = (
  state: SimulationState,
  decision: Decision,
  option: DecisionOption,
  negotiateVotes: boolean,
  rng: Rng,
  difficulty: DifficultyConfig,
): DecisionResult => {
  const key = `decision:${decision.id}`;
  if (!option.legislative) {
    const news: NewsItem = createNewsItem(state.turn, option.headline, toneFromImpact(option.impact), 'decision', key);
    const executed = executeOption(state, decision, option, rng, difficulty);
    return { state: executed.state, news: [news, ...executed.news], vote: null };
  }
  const before = negotiateVotes ? negotiate(state) : state;
  const chance = calculateVoteChance({
    type: option.legislative,
    support: state.congress.support,
    approval: state.approval,
    negotiate: negotiateVotes,
    voteChanceBonus: getVoteBonus(state),
    provisionalMeasure: hasProvisionalMeasure(state),
  });
  const approved = rng.next() < chance;
  const vote: VoteRecord = {
    turn: state.turn,
    decisionId: decision.id,
    optionId: option.id,
    title: decision.title,
    type: option.legislative,
    chance,
    approved,
    negotiated: negotiateVotes,
  };
  const voted = recordVote(before, vote);
  if (approved) {
    const executed = executeOption(voted, decision, option, rng, difficulty);
    return { state: executed.state, news: [createNewsItem(state.turn, option.headline, 'positive', 'congress', key), ...executed.news], vote };
  }
  const failureImpact = option.failureImpact ?? {};
  const failed = applyImpact(voted, failureImpact, { positive: difficulty.positiveImpactMultiplier, negative: difficulty.negativeImpactMultiplier });
  const headline = option.failureHeadline ?? `Congresso rejeita proposta do governo: ${decision.title}`;
  return { state: failed, news: [createNewsItem(state.turn, headline, 'negative', 'congress', key)], vote };
};
