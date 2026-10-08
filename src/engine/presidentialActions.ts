/**
 * Iniciativas livres do jogador, cada uma em sua "vaga" mensal:
 * - agenda presidencial (`AGENDA_SLOT`): gestos políticos, uma por mês;
 * - programas de governo (`PROGRAM_SLOT`): políticas públicas ligadas às metas, um por mês.
 * Cada ação tem seu cooldown. Usa `decisionHistory` com chaves prefixadas pela vaga.
 */
import type { DifficultyConfig, InitiativeSlot, NewsCategory, NewsItem, PresidentialAction, SimulationState } from '@/types';
import { evaluateConditions } from './conditions';
import { applyImpact, imprintPolicyMemory, scaleImpactByPolarity, scheduleDelayedImpacts, setFlags, toneFromImpact } from './impacts';
import { createNewsItem } from './news';
import { rollOutcomeRisk } from './outcomes';
import { createRng } from './random';

export const AGENDA_SLOT: InitiativeSlot = 'acao-presidencial';
export const PROGRAM_SLOT: InitiativeSlot = 'programa';

/** Categoria da manchete por vaga (lookup, sem switch). */
const SLOT_NEWS_CATEGORY: Record<InitiativeSlot, NewsCategory> = {
  'acao-presidencial': 'politics',
  programa: 'decision',
};

/** Chave do histórico que guarda o turno da última iniciativa da vaga. */
const monthlyKey = (slot: InitiativeSlot): string => `${slot}:ultima`;

const actionKey = (action: PresidentialAction, slot: InitiativeSlot): string => `${slot}:${action.id}`;

/** A vaga mensal (agenda ou programa) ainda está livre neste mês. */
export const canTakePresidentialAction = (state: SimulationState, slot: InitiativeSlot = AGENDA_SLOT): boolean =>
  state.decisionHistory[monthlyKey(slot)] !== state.turn;

/** Turnos até a ação poder ser usada de novo (0 = disponível quanto ao cooldown). */
export const getActionCooldownLeft = (state: SimulationState, action: PresidentialAction, slot: InitiativeSlot = AGENDA_SLOT): number => {
  const last = state.decisionHistory[actionKey(action, slot)];
  return last === undefined ? 0 : Math.max(0, action.cooldown - (state.turn - last));
};

export const isPresidentialActionAvailable = (
  state: SimulationState,
  action: PresidentialAction,
  slot: InitiativeSlot = AGENDA_SLOT,
): boolean =>
  canTakePresidentialAction(state, slot) && getActionCooldownLeft(state, action, slot) === 0 && evaluateConditions(state, action.conditions);

/** Executa a ação: impacto escalado pela dificuldade, efeitos graduais, flags, risco e registro do uso. */
export const applyPresidentialAction = (
  state: SimulationState,
  action: PresidentialAction,
  difficulty: DifficultyConfig,
  slot: InitiativeSlot = AGENDA_SLOT,
): { state: SimulationState; news: NewsItem[] } => {
  const key = actionKey(action, slot);
  const scaling = { positive: difficulty.positiveImpactMultiplier, negative: difficulty.negativeImpactMultiplier };
  const delayed = action.delayed?.map((entry) => ({ ...entry, impact: scaleImpactByPolarity(entry.impact, scaling) }));
  const applied = applyImpact(state, action.impact, scaling);
  const scheduled = scheduleDelayedImpacts(applied, key, action.name, delayed);
  const recorded: SimulationState = {
    ...imprintPolicyMemory(setFlags(scheduled, action.flags), action.impact),
    decisionHistory: { ...scheduled.decisionHistory, [key]: state.turn, [monthlyKey(slot)]: state.turn },
  };
  const rng = createRng(state.seed);
  const risk = rollOutcomeRisk(recorded, action.risk, key, action.name, rng, scaling);
  const news = createNewsItem(state.turn, action.headline, toneFromImpact(action.impact), SLOT_NEWS_CATEGORY[slot], key);
  return { state: { ...risk.state, seed: rng.getSeed() }, news: [news, ...risk.news] };
};
