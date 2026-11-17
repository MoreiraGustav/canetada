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
import { fillCareerText } from './text';

const METRIC_MAX = 100;

/** Soma pontos de confiança do chefe ou do titular (sem efeito fora de um cargo de nomeação ou de vice). */
export const withTrust = (state: CareerState, delta: number): CareerState =>
  state.post && delta !== 0 ? { ...state, post: { ...state.post, trust: clamp(state.post.trust + delta, 0, METRIC_MAX) } } : state;

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
  return { ...administration, approval: clamp(administration.approval + (impact.approval ?? 0), 0, METRIC_MAX), indicators };
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
    withTrust({ ...state, metrics, administration }, impact.trust ?? 0),
  );
};

/** Soma vários impactos num só (para as dicas de uma escolha com efeitos combinados). */
export const sumCareerImpacts = (impacts: readonly CareerImpact[]): CareerImpact => {
  const add = <K extends string>(a: Partial<Record<K, number>> | undefined, b: Partial<Record<K, number>> | undefined): Partial<Record<K, number>> | undefined => {
    if (!a && !b) return undefined;
    const merged: Partial<Record<K, number>> = { ...a };
    (Object.entries(b ?? {}) as Array<[K, number]>).forEach(([key, value]) => {
      merged[key] = (merged[key] ?? 0) + value;
    });
    return merged;
  };
  return impacts.reduce<CareerImpact>((acc, impact) => {
    const metrics = Object.fromEntries(CAREER_METRIC_KEYS.flatMap((key) => (acc[key] === undefined && impact[key] === undefined ? [] : [[key, (acc[key] ?? 0) + (impact[key] ?? 0)]])));
    const approval = acc.approval === undefined && impact.approval === undefined ? undefined : (acc.approval ?? 0) + (impact.approval ?? 0);
    const trust = acc.trust === undefined && impact.trust === undefined ? undefined : (acc.trust ?? 0) + (impact.trust ?? 0);
    return {
      ...metrics,
      admin: add(acc.admin, impact.admin),
      relations: add(acc.relations, impact.relations),
      ...(approval === undefined ? {} : { approval }),
      ...(trust === undefined ? {} : { trust }),
    };
  }, {});
};

/** Multiplica todos os pontos de um impacto (indicadores, gestão, aprovação, relações e confiança). */
export const scaleCareerImpact = (impact: CareerImpact, factor: number): CareerImpact => {
  const scaleRecord = <K extends string>(record: Partial<Record<K, number>> | undefined): Partial<Record<K, number>> | undefined =>
    record ? (Object.fromEntries(Object.entries(record).map(([key, value]) => [key, (value as number) * factor])) as Partial<Record<K, number>>) : undefined;
  const metrics = Object.fromEntries(CAREER_METRIC_KEYS.flatMap((key) => (impact[key] === undefined ? [] : [[key, (impact[key] ?? 0) * factor]])));
  return {
    ...metrics,
    ...(impact.admin ? { admin: scaleRecord(impact.admin) } : {}),
    ...(impact.approval !== undefined ? { approval: impact.approval * factor } : {}),
    ...(impact.relations ? { relations: scaleRecord(impact.relations) } : {}),
    ...(impact.trust !== undefined ? { trust: impact.trust * factor } : {}),
  };
};

/**
 * Define flags no semestre atual. `note` diz o que as marcou (a escolha ou o desfecho):
 * é o que a tela mostra quando um caso na Justiça chega a uma nova etapa.
 */
export const setCareerFlags = (state: CareerState, flags: readonly string[] | undefined, note = ''): CareerState => {
  if (!flags || flags.length === 0) return state;
  const flagNotes = note === '' ? state.flagNotes : { ...state.flagNotes, ...Object.fromEntries(flags.map((flag) => [flag, note])) };
  return { ...state, flags: { ...state.flags, ...Object.fromEntries(flags.map((flag) => [flag, state.turn])) }, flagNotes };
};

/**
 * Rola um risco: devolve o estado (com o desfecho aplicado, se ocorreu) e se ocorreu.
 * `source` (ex.: o nome da ação) entra na nota das flags do desfecho.
 */
export const rollCareerRisk = (
  state: CareerState,
  content: CareerContent,
  risk: CareerRisk | undefined,
  rng: Rng,
  source = '',
): { state: CareerState; happened: boolean } => {
  if (!risk) return { state, happened: false };
  if (rng.next() >= risk.chance) return { state, happened: false };
  const outcome = fillCareerText(risk.headline, state, content);
  const note = source === '' ? outcome : `${source}: ${outcome}`;
  return { state: setCareerFlags(applyCareerImpact(state, content, risk.impact), risk.flags, note), happened: true };
};

/** Indicadores iniciais de uma gestão. */
export const createAdministration = (): CareerAdministration => ({
  approval: CAREER.admin.initialApproval,
  indicators: Object.fromEntries(ADMIN_INDICATOR_KEYS.map((key) => [key, CAREER.admin.initialIndicator])) as Record<AdminIndicatorKey, number>,
  works: [],
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
