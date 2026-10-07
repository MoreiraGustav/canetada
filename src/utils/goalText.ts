import { INDICATOR_INFO } from '@/constants/metrics';
import type { GoalDefinition } from '@/types';
import { formatIndicator, formatIndicatorValue, formatNumber, interpolate } from './format';

const DIRECTION_NOUN: Record<GoalDefinition['direction'], string> = {
  increase: 'aumento',
  decrease: 'redução',
};

/**
 * Critério de referência de uma meta antes da posse (alvo do Mandato Completo):
 * - absoluto: "Desemprego de 5,0% ou menos";
 * - relativo: "Desmatamento na Amazônia: redução de 50% em relação à posse";
 * - delta: "Índice de Gini: redução de 0,030 em relação à posse".
 */
export const describeGoalTarget = (definition: GoalDefinition): string => {
  const label = INDICATOR_INFO[definition.metric].label;
  const noun = DIRECTION_NOUN[definition.direction];
  switch (definition.targetType) {
    case 'absolute':
      return interpolate(definition.criteria, { target: formatIndicator(definition.metric, definition.target) });
    case 'relative':
      return `${label}: ${noun} de ${formatNumber(definition.target)}% em relação à posse`;
    case 'delta':
      return `${label}: ${noun} de ${formatIndicatorValue(definition.metric, definition.target)} em relação à posse`;
  }
};
