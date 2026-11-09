/**
 * Agenda do semestre (duas ações) e programa de gestão (um por semestre, para
 * prefeitos e governadores).
 */
import { CAREER_ACTIONS_PER_TURN } from '@/constants/career';
import type { CareerAction, CareerContent, CareerNews, CareerState } from '@/types';
import { createRng } from '../random';
import { evaluateCareerConditions } from './conditions';
import { currentOffice, getCareerRole } from './helpers';
import { applyCareerImpact, impactTone, rollCareerRisk, setCareerFlags } from './impacts';
import { createCareerNews, fillCareerText } from './text';

/** Semestres que ainda faltam para poder repetir a ação (0 = livre). */
export const actionCooldownLeft = (state: CareerState, action: CareerAction): number => {
  const last = state.actionHistory[action.id];
  return last === undefined ? 0 : Math.max(0, last + action.cooldown - state.turn);
};

/** A ação cabe na situação atual (papel, cargo, profissão e condições), sem olhar a espera. */
export const isActionOpen = (state: CareerState, content: CareerContent, action: CareerAction): boolean => {
  const office = currentOffice(state, content);
  return (
    (action.roles === undefined || action.roles.includes(getCareerRole(state, content))) &&
    (action.offices === undefined || (office !== undefined && action.offices.includes(office.id))) &&
    (action.professions === undefined || action.professions.includes(state.profile.professionId)) &&
    evaluateCareerConditions(state, content, action.conditions)
  );
};

/** Ações da agenda que fazem sentido agora (inclusive as em espera, para a UI mostrar). */
export const getOpenActions = (state: CareerState, content: CareerContent): CareerAction[] =>
  content.actions.filter((action) => isActionOpen(state, content, action));

/** Programas de gestão do cargo atual (vazio para quem não governa). */
export const getOpenAdminPrograms = (state: CareerState, content: CareerContent): CareerAction[] =>
  state.administration ? content.adminPrograms.filter((program) => isActionOpen(state, content, program)) : [];

/** Escolhas válidas: ações abertas, fora da espera, no máximo `CAREER_ACTIONS_PER_TURN`. */
const validChoices = (state: CareerState, pool: readonly CareerAction[], ids: readonly string[], max: number): CareerAction[] =>
  ids
    .map((id) => pool.find((action) => action.id === id))
    .filter((action): action is CareerAction => action !== undefined && actionCooldownLeft(state, action) === 0)
    .slice(0, max);

const applyOne = (state: CareerState, content: CareerContent, action: CareerAction, news: CareerNews[]): CareerState => {
  const rng = createRng(state.seed);
  const impacted = setCareerFlags(applyCareerImpact(state, content, action.impact, action.name), action.flags);
  const { state: risked, happened } = rollCareerRisk(impacted, content, action.risk, rng);
  const outcome = happened && action.risk ? action.risk : action;
  news.push(createCareerNews(state.turn, fillCareerText(outcome.headline, state, content), impactTone(outcome.impact), `acao-${action.id}`));
  return { ...risked, actionHistory: { ...risked.actionHistory, [action.id]: state.turn }, seed: rng.getSeed() };
};

/** Executa a agenda e o programa de gestão escolhidos para o semestre. */
export const applyCareerAgenda = (
  state: CareerState,
  content: CareerContent,
  actionIds: readonly string[],
  programId: string | null,
): { state: CareerState; news: CareerNews[] } => {
  const news: CareerNews[] = [];
  const actions = validChoices(state, getOpenActions(state, content), actionIds, CAREER_ACTIONS_PER_TURN);
  const programs = programId ? validChoices(state, getOpenAdminPrograms(state, content), [programId], 1) : [];
  const next = [...actions, ...programs].reduce((acc, action) => applyOne(acc, content, action, news), state);
  return { state: next, news };
};
