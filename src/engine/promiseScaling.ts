/**
 * Escala os alvos numéricos das promessas conforme o modo de jogo: em mandatos
 * curtos (Blitz/Padrão) exige-se só uma fração da variação até o alvo, como nas metas.
 */
import { INDICATOR_INFO } from '@/constants/metrics';
import type { Comparator, Condition, IndicatorCondition, RelationCondition, SimulationState } from '@/types';
import { formatIndicator, formatNumber } from '@/utils/format';
import { roundTo } from '@/utils/math';
import { evaluateCondition, getIndicatorValue } from './conditions';

export interface PromiseScaling {
  /** Estado da posse (valores de referência). */
  baseline: SimulationState;
  /** Fração da variação exigida (GAME_MODES[mode].goalScale). */
  scale: number;
  /** ID do país → nome, para o texto do alvo ajustado. */
  countryNames: Readonly<Record<string, string>>;
}

const COMPARATOR_SYMBOLS: Record<Comparator, string> = { lt: '<', lte: '≤', gt: '>', gte: '≥' };

type NumericCondition = IndicatorCondition | RelationCondition;

const isNumeric = (condition: Condition): condition is NumericCondition => condition.kind === 'indicator' || condition.kind === 'relation';

const baselineValue = (condition: NumericCondition, baseline: SimulationState): number =>
  condition.kind === 'indicator' ? getIndicatorValue(baseline, condition.indicator) : baseline.relations[condition.country];

const decimalsOf = (condition: NumericCondition): number => (condition.kind === 'indicator' ? INDICATOR_INFO[condition.indicator].decimals : 0);

/** Alvo = referência + (alvo − referência) × escala, se a promessa ainda não estiver cumprida na posse. */
const scaleCondition = (condition: Condition, scaling: PromiseScaling): Condition => {
  if (!isNumeric(condition) || scaling.scale >= 1 || evaluateCondition(scaling.baseline, condition)) return condition;
  const reference = baselineValue(condition, scaling.baseline);
  const value = roundTo(reference + (condition.value - reference) * scaling.scale, decimalsOf(condition));
  return { ...condition, value };
};

const describeCondition = (condition: NumericCondition, countryNames: Readonly<Record<string, string>>): string => {
  const symbol = COMPARATOR_SYMBOLS[condition.comparator];
  if (condition.kind === 'relation') return `relação com ${countryNames[condition.country] ?? condition.country} ${symbol} ${formatNumber(condition.value)}`;
  return `${INDICATOR_INFO[condition.indicator].shortLabel} ${symbol} ${formatIndicator(condition.indicator, condition.value)}`;
};

/** Condições escaladas e o texto da promessa com o alvo ajustado (se mudou). */
export const scalePromise = (
  text: string,
  conditions: readonly Condition[],
  scaling: PromiseScaling | undefined,
): { text: string; conditions: Condition[] } => {
  if (!scaling) return { text, conditions: [...conditions] };
  const scaled = conditions.map((condition) => scaleCondition(condition, scaling));
  const changed = scaled.filter((condition, index): condition is NumericCondition => isNumeric(condition) && condition !== conditions[index]);
  if (changed.length === 0) return { text, conditions: scaled };
  const targets = changed.map((condition) => describeCondition(condition, scaling.countryNames)).join('; ');
  return { text: `${text} (meta ajustada ao mandato: ${targets})`, conditions: scaled };
};
