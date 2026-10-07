/**
 * Riscos latentes (ex.: esquemas de corrupção aceitos): a cada mês podem vir à
 * tona, com chance crescente desde a ativação; o que nunca veio à tona ainda
 * pode ser revelado depois do mandato, manchando o legado.
 */
import type { LatentRisk, Rng, SimulationState, StateWithNews } from '@/types';
import { clamp } from '@/utils/math';
import { isFlagActive } from './conditions';
import { applyImpact, setFlags } from './impacts';
import { createNewsItem } from './news';
import { withStateRng } from './random';

/** Risco ativo (flag de origem presente) e ainda não revelado. */
export const isRiskPending = (state: SimulationState, risk: LatentRisk): boolean =>
  state.flags[risk.sourceFlag] !== undefined && state.flags[risk.exposedFlag] === undefined;

/** Chance mensal atual: inicial + crescimento × turnos desde a ativação, × modificadores, limitada ao teto. */
export const getRiskChance = (state: SimulationState, risk: LatentRisk): number => {
  const activatedAt = state.flags[risk.sourceFlag];
  if (activatedAt === undefined) return 0;
  const base = risk.monthlyChance + risk.growthPerTurn * Math.max(0, state.turn - activatedAt);
  const multiplier = (risk.modifiers ?? []).reduce((acc, modifier) => (isFlagActive(state, modifier.flag) ? acc * modifier.multiplier : acc), 1);
  return clamp(Math.min(base, risk.maxChance) * multiplier, 0, 1);
};

const expose = (state: SimulationState, risk: LatentRisk): StateWithNews => {
  const flagged = setFlags(state, [risk.exposedFlag, ...(risk.exposureFlags ?? [])]);
  const next = applyImpact(flagged, risk.exposureImpact);
  return { state: next, news: [createNewsItem(state.turn, risk.headline, 'negative', 'politics', `exposed:${risk.id}`)] };
};

/** Etapa mensal: cada risco pendente pode vir à tona. */
export const stepLatentRisks = (state: SimulationState, rng: Rng, risks: readonly LatentRisk[]): StateWithNews =>
  risks.reduce<StateWithNews>(
    (acc, risk) => {
      if (!isRiskPending(acc.state, risk) || acc.state.flags[risk.sourceFlag] === acc.state.turn) return acc;
      if (rng.next() >= getRiskChance(acc.state, risk)) return acc;
      const result = expose(acc.state, risk);
      return { state: result.state, news: [...acc.news, ...result.news] };
    },
    { state, news: [] },
  );

/** Investigações após o mandato: riscos pendentes podem ser revelados (marca as flags de exposição). */
export const resolvePostTermRisks = (state: SimulationState, risks: readonly LatentRisk[]): { state: SimulationState; revealed: LatentRisk[] } => {
  const { result, seed } = withStateRng(state, (rng) => risks.filter((risk) => isRiskPending(state, risk) && rng.next() < risk.postTermChance));
  const flagged = setFlags(state, result.map((risk) => risk.exposedFlag));
  return { state: { ...flagged, seed }, revealed: result };
};

/** Riscos que vieram à tona (durante ou depois do mandato). */
export const getExposedRisks = (state: SimulationState, risks: readonly LatentRisk[]): LatentRisk[] =>
  risks.filter((risk) => state.flags[risk.exposedFlag] !== undefined);
