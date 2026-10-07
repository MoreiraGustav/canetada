import { APPROVAL_SATURATION, DEBT_IMPACT_SCALE, MAX_SECTOR_AFFINITY, POLICY_MEMORY_SHARE } from '@/constants/balance';
import { INDICATOR_INFO, METRIC_BOUNDS } from '@/constants/metrics';
import { SECTOR_INFO, SECTOR_KEYS } from '@/constants/sectors';
import type {
  ActiveEffect,
  CountryId,
  DelayedImpact,
  GameMetrics,
  Impact,
  ImpactKey,
  ImpactScaling,
  MetricKey,
  NewsTone,
  SectorAffinity,
  SectorApproval,
  SectorKey,
  SimulationState,
} from '@/types';
import { clamp } from '@/utils/math';
import { calculateApproval } from './approval';

const SCORE_MIN = 0;
const SCORE_MAX = 100;
/** |soma ponderada| mínima para uma manchete ser considerada positiva/negativa. */
const TONE_THRESHOLD = 0.5;

const NO_SCALING: ImpactScaling = { positive: 1, negative: 1 };

const scaleDelta = (delta: number, polarity: number, scaling: ImpactScaling): number => {
  if (polarity === 0 || delta === 0) return delta;
  // Benéfico = delta na direção da polaridade (ex.: inflação ↓, PIB ↑).
  return delta * polarity > 0 ? delta * scaling.positive : delta * scaling.negative;
};

const scaleRecord = <K extends string>(
  record: Partial<Record<K, number>> | undefined,
  fn: (delta: number) => number,
): Partial<Record<K, number>> | undefined => {
  if (!record) return undefined;
  const entries = Object.entries(record) as Array<[K, number | undefined]>;
  return Object.fromEntries(entries.map(([key, value]) => [key, fn(value ?? 0)])) as Partial<Record<K, number>>;
};

const flatKeys = (impact: Impact): ImpactKey[] =>
  (Object.keys(impact) as Array<keyof Impact>).filter((key): key is ImpactKey => key !== 'sectors' && key !== 'relations');

const mapImpact = (impact: Impact, flatFn: (key: ImpactKey, delta: number) => number, nestedFn: (delta: number) => number): Impact => {
  const result: Impact = {};
  flatKeys(impact).forEach((key) => {
    const value = impact[key];
    if (value !== undefined) result[key] = flatFn(key, value);
  });
  const sectors = scaleRecord<SectorKey>(impact.sectors, nestedFn);
  const relations = scaleRecord<CountryId>(impact.relations, nestedFn);
  if (sectors) result.sectors = sectors;
  if (relations) result.relations = relations;
  return result;
};

/** Multiplica todos os deltas de um impacto por `factor`. */
export const scaleImpact = (impact: Impact, factor: number): Impact =>
  mapImpact(impact, (_key, delta) => delta * factor, (delta) => delta * factor);

/** Escala deltas benéficos/prejudiciais conforme a polaridade (setores, relações, aprovação e base: positivo = benéfico). */
export const scaleImpactByPolarity = (impact: Impact, scaling: ImpactScaling): Impact =>
  mapImpact(
    impact,
    (key, delta) => scaleDelta(delta, INDICATOR_INFO[key].polarity, scaling),
    (delta) => scaleDelta(delta, 1, scaling),
  );

const applyMetricDeltas = (metrics: GameMetrics, impact: Impact): GameMetrics => {
  const next = { ...metrics };
  flatKeys(impact).forEach((key) => {
    const delta = impact[key];
    if (delta === undefined || key === 'approval' || key === 'congressSupport') return;
    const metric: MetricKey = key;
    // Gastos pontuais: parte é compensada dentro do orçamento, só o restante vira dívida.
    const effective = metric === 'debt' ? delta * DEBT_IMPACT_SCALE : delta;
    next[metric] = clamp(next[metric] + effective, METRIC_BOUNDS[metric].min, METRIC_BOUNDS[metric].max);
  });
  return next;
};

/** Fator de retornos decrescentes para ganhos de um setor já bem avaliado. */
const saturation = (current: number): number =>
  clamp(1 - (current - APPROVAL_SATURATION.start) / APPROVAL_SATURATION.span, APPROVAL_SATURATION.minFactor, 1);

const applySectorDeltas = (sectors: SectorApproval, impact: Impact): SectorApproval => {
  const uniform = impact.approval ?? 0;
  return Object.fromEntries(
    SECTOR_KEYS.map((key) => {
      const delta = uniform + (impact.sectors?.[key] ?? 0);
      // Perdas valem integralmente; ganhos encolhem conforme o setor já está satisfeito.
      const effective = delta > 0 ? delta * saturation(sectors[key]) : delta;
      return [key, clamp(sectors[key] + effective, SCORE_MIN, SCORE_MAX)];
    }),
  ) as SectorApproval;
};

const applyRelationDeltas = (state: SimulationState, impact: Impact): SimulationState['relations'] => {
  if (!impact.relations) return state.relations;
  const next = { ...state.relations };
  (Object.entries(impact.relations) as Array<[CountryId, number | undefined]>).forEach(([country, delta]) => {
    if (next[country] !== undefined) next[country] = clamp(next[country] + (delta ?? 0), SCORE_MIN, SCORE_MAX);
  });
  return next;
};

/**
 * Aplica um impacto aditivo ao estado: métricas (clamp por METRIC_BOUNDS),
 * setores/relações/base aliada (0–100) e recalcula a aprovação geral.
 */
export const applyImpact = (state: SimulationState, impact: Impact, scaling: ImpactScaling = NO_SCALING): SimulationState => {
  const scaled = scaling === NO_SCALING ? impact : scaleImpactByPolarity(impact, scaling);
  const sectors = applySectorDeltas(state.sectors, scaled);
  return {
    ...state,
    metrics: applyMetricDeltas(state.metrics, scaled),
    sectors,
    approval: calculateApproval(sectors),
    relations: applyRelationDeltas(state, scaled),
    congress: {
      ...state.congress,
      support: clamp(state.congress.support + (scaled.congressSupport ?? 0), SCORE_MIN, SCORE_MAX),
    },
  };
};

/** Agenda efeitos graduais: perTurn = total / duração, a partir de turno + 1 + delay. */
export const scheduleDelayedImpacts = (
  state: SimulationState,
  sourceId: string,
  label: string,
  delayed: readonly DelayedImpact[] | undefined,
): SimulationState => {
  if (!delayed || delayed.length === 0) return state;
  const created: ActiveEffect[] = delayed.map((entry, index) => {
    const duration = Math.max(1, entry.duration);
    const startTurn = state.turn + 1 + Math.max(0, entry.delay);
    return {
      id: `${sourceId}:${state.turn}:${index}`,
      sourceId,
      label: entry.label ?? label,
      perTurn: scaleImpact(entry.impact, 1 / duration),
      startTurn,
      endTurn: startTurn + duration - 1,
    };
  });
  const createdIds = new Set(created.map((effect) => effect.id));
  return { ...state, activeEffects: [...state.activeEffects.filter((effect) => !createdIds.has(effect.id)), ...created] };
};

/** Aplica os efeitos vigentes no turno atual e remove os que terminaram. */
export const applyActiveEffects = (state: SimulationState): SimulationState => {
  const applied = state.activeEffects
    .filter((effect) => effect.startTurn <= state.turn && state.turn <= effect.endTurn)
    .reduce((acc, effect) => applyImpact(acc, effect.perTurn), state);
  return { ...applied, activeEffects: applied.activeEffects.filter((effect) => effect.endTurn > state.turn) };
};

/** Define flags com o turno atual. */
export const setFlags = (state: SimulationState, flags: readonly string[] | undefined): SimulationState => {
  if (!flags || flags.length === 0) return state;
  return { ...state, flags: { ...state.flags, ...Object.fromEntries(flags.map((flag) => [flag, state.turn])) } };
};

export const clearFlag = (state: SimulationState, flag: string): SimulationState => {
  if (state.flags[flag] === undefined) return state;
  return { ...state, flags: Object.fromEntries(Object.entries(state.flags).filter(([key]) => key !== flag)) };
};

/**
 * Memória política: parte dos deltas setoriais (e da aprovação uniforme)
 * vira afinidade persistente, deslocando o equilíbrio de cada setor.
 */
export const imprintPolicyMemory = (state: SimulationState, impact: Impact): SimulationState => {
  const uniform = impact.approval ?? 0;
  if (uniform === 0 && !impact.sectors) return state;
  const affinity: SectorAffinity = { ...state.sectorAffinity };
  SECTOR_KEYS.forEach((key) => {
    const delta = (uniform + (impact.sectors?.[key] ?? 0)) * POLICY_MEMORY_SHARE;
    if (delta !== 0) affinity[key] = clamp((affinity[key] ?? 0) + delta, -MAX_SECTOR_AFFINITY, MAX_SECTOR_AFFINITY);
  });
  return { ...state, sectorAffinity: affinity };
};

/** Tom de manchete a partir do efeito do impacto sobre a aprovação (ponderada por setor). */
export const toneFromImpact = (impact: Impact): NewsTone => {
  const sectorScore = SECTOR_KEYS.reduce((acc, key) => acc + (impact.sectors?.[key] ?? 0) * SECTOR_INFO[key].weight, 0);
  const score = (impact.approval ?? 0) + sectorScore;
  if (score > TONE_THRESHOLD) return 'positive';
  if (score < -TONE_THRESHOLD) return 'negative';
  return 'neutral';
};
