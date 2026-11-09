/**
 * Aplicação de impactos na carreira: indicadores (0–100) com retornos
 * decrescentes, influência ajustada ao partido, gestão e riscos.
 */
import { CAREER } from '@/constants/balance';
import { ADMIN_INDICATOR_KEYS, CAREER_METRIC_KEYS } from '@/constants/career';
import type { AdminIndicatorKey, CareerAdministration, CareerCharacterRole, CareerContent, CareerImpact, CareerOffice, CareerMetricKey, CareerMetrics, CareerRisk, CareerState, NewsTone, Rng } from '@/types';
import { clamp } from '@/utils/math';
import { changeRelation, padrinhoInfluenceMultiplier } from './characters';
import { partyInfluenceFactor } from './helpers';

const METRIC_MAX = 100;

/** Fração do ganho que sobra conforme o indicador já está alto (1 até `start`, `minFactor` em 100). */
export const saturationFactor = (current: number): number => {
  const { start, minFactor } = CAREER.saturation;
  if (current <= start) return 1;
  return 1 - ((current - start) / (METRIC_MAX - start)) * (1 - minFactor);
};

/** Escala dos efeitos negativos conforme a dificuldade. */
export const negativeScale = (state: CareerState): number => CAREER.events.negativeScale[state.difficulty];

const scaleDelta = (state: CareerState, content: CareerContent, key: CareerMetricKey, delta: number): number => {
  if (delta < 0) return delta * negativeScale(state);
  // Ganho de influência depende do tamanho do partido e da afinidade com ele.
  const partyFactor = key === 'partyInfluence' ? partyInfluenceFactor(state, content) * padrinhoInfluenceMultiplier(state) : 1;
  return delta * saturationFactor(state.metrics[key]) * partyFactor;
};

const applyAdmin = (administration: CareerAdministration, impact: CareerImpact): CareerAdministration => {
  const indicators = { ...administration.indicators };
  (Object.entries(impact.admin ?? {}) as Array<[AdminIndicatorKey, number | undefined]>).forEach(([key, delta]) => {
    indicators[key] = clamp(indicators[key] + (delta ?? 0), 0, METRIC_MAX);
  });
  return { approval: clamp(administration.approval + (impact.approval ?? 0), 0, METRIC_MAX), indicators };
};

/**
 * Soma o impacto aos indicadores (e à gestão, se houver). Ganhos encolhem perto de 100.
 * `memoryText` é o episódio que os personagens guardam quando a relação muda.
 */
export const applyCareerImpact = (state: CareerState, content: CareerContent, impact: CareerImpact, memoryText = ''): CareerState => {
  const metrics: CareerMetrics = { ...state.metrics };
  CAREER_METRIC_KEYS.forEach((key) => {
    const delta = impact[key];
    if (delta === undefined || delta === 0) return;
    metrics[key] = clamp(metrics[key] + scaleDelta(state, content, key, delta), 0, METRIC_MAX);
  });
  const administration = state.administration ? applyAdmin(state.administration, impact) : null;
  return (Object.entries(impact.relations ?? {}) as Array<[CareerCharacterRole, number]>).reduce(
    (acc, [role, delta]) => changeRelation(acc, role, delta, memoryText),
    { ...state, metrics, administration },
  );
};

/** Define flags no semestre atual. */
export const setCareerFlags = (state: CareerState, flags: readonly string[] | undefined): CareerState =>
  flags && flags.length > 0 ? { ...state, flags: { ...state.flags, ...Object.fromEntries(flags.map((flag) => [flag, state.turn])) } } : state;

/** Rola um risco: devolve o estado (com o desfecho aplicado, se ocorreu) e se ocorreu. */
export const rollCareerRisk = (
  state: CareerState,
  content: CareerContent,
  risk: CareerRisk | undefined,
  rng: Rng,
): { state: CareerState; happened: boolean } => {
  if (!risk) return { state, happened: false };
  if (rng.next() >= risk.chance) return { state, happened: false };
  return { state: setCareerFlags(applyCareerImpact(state, content, risk.impact), risk.flags), happened: true };
};

/** Indicadores iniciais de uma gestão. */
export const createAdministration = (): CareerAdministration => ({
  approval: CAREER.admin.initialApproval,
  indicators: Object.fromEntries(ADMIN_INDICATOR_KEYS.map((key) => [key, CAREER.admin.initialIndicator])) as Record<AdminIndicatorKey, number>,
});

/** Gestão nova para chefes do Executivo municipal e estadual (a Presidência é o jogo presidencial). */
export const administrationFor = (office: CareerOffice): CareerAdministration | null =>
  office.branch === 'executivo' && !office.headOffice && office.level !== 'federal' ? createAdministration() : null;

/** Variação de cada indicador entre dois estados (só os que mudaram). */
export const metricDeltas = (before: CareerMetrics, after: CareerMetrics): Partial<CareerMetrics> =>
  Object.fromEntries(
    CAREER_METRIC_KEYS.map((key) => [key, after[key] - before[key]] as const).filter(([, delta]) => Math.abs(delta) >= 0.05),
  );

/** Tom de um impacto para a manchete: soma dos indicadores e da aprovação da gestão. */
export const impactTone = (impact: CareerImpact): NewsTone => {
  const total = CAREER_METRIC_KEYS.reduce((acc, key) => acc + (impact[key] ?? 0), impact.approval ?? 0);
  if (total > 0) return 'positive';
  return total < 0 ? 'negative' : 'neutral';
};
