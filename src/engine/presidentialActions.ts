/**
 * Agenda presidencial: uma iniciativa livre por mês, cada uma com seu cooldown.
 * Usa `decisionHistory` com chaves prefixadas para lembrar o último uso.
 */
import type { DifficultyConfig, NewsItem, PresidentialAction, SimulationState } from '@/types';
import { evaluateConditions } from './conditions';
import { applyImpact, imprintPolicyMemory, scaleImpactByPolarity, scheduleDelayedImpacts, setFlags, toneFromImpact } from './impacts';
import { createNewsItem } from './news';
import { rollOutcomeRisk } from './outcomes';
import { createRng } from './random';

/** Chave do histórico que guarda o turno da última ação presidencial (qualquer uma). */
const MONTHLY_KEY = 'acao-presidencial:ultima';

const actionKey = (action: PresidentialAction): string => `acao-presidencial:${action.id}`;

/** Ainda há ação presidencial disponível neste mês. */
export const canTakePresidentialAction = (state: SimulationState): boolean => state.decisionHistory[MONTHLY_KEY] !== state.turn;

/** Turnos até a ação poder ser usada de novo (0 = disponível quanto ao cooldown). */
export const getActionCooldownLeft = (state: SimulationState, action: PresidentialAction): number => {
  const last = state.decisionHistory[actionKey(action)];
  return last === undefined ? 0 : Math.max(0, action.cooldown - (state.turn - last));
};

export const isPresidentialActionAvailable = (state: SimulationState, action: PresidentialAction): boolean =>
  canTakePresidentialAction(state) && getActionCooldownLeft(state, action) === 0 && evaluateConditions(state, action.conditions);

/** Executa a ação: impacto escalado pela dificuldade, efeitos graduais, flags, risco e registro do uso. */
export const applyPresidentialAction = (
  state: SimulationState,
  action: PresidentialAction,
  difficulty: DifficultyConfig,
): { state: SimulationState; news: NewsItem[] } => {
  const scaling = { positive: difficulty.positiveImpactMultiplier, negative: difficulty.negativeImpactMultiplier };
  const delayed = action.delayed?.map((entry) => ({ ...entry, impact: scaleImpactByPolarity(entry.impact, scaling) }));
  const applied = applyImpact(state, action.impact, scaling);
  const scheduled = scheduleDelayedImpacts(applied, actionKey(action), action.name, delayed);
  const recorded: SimulationState = {
    ...imprintPolicyMemory(setFlags(scheduled, action.flags), action.impact),
    decisionHistory: { ...scheduled.decisionHistory, [actionKey(action)]: state.turn, [MONTHLY_KEY]: state.turn },
  };
  const rng = createRng(state.seed);
  const risk = rollOutcomeRisk(recorded, action.risk, actionKey(action), action.name, rng, scaling);
  const news = createNewsItem(state.turn, action.headline, toneFromImpact(action.impact), 'politics', actionKey(action));
  return { state: { ...risk.state, seed: rng.getSeed() }, news: [news, ...risk.news] };
};
