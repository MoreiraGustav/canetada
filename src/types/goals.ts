import type { MetricKey } from './metrics';

/**
 * Tipo de alvo de uma meta:
 * - `absolute`: atingir o valor `target` (ex.: desemprego ≤ 5).
 * - `relative`: variar `target`% a partir do valor inicial (ex.: -30% desmatamento → target 30).
 * - `delta`: variar `target` unidades a partir do valor inicial (ex.: Gini -0,03 → target 0.03).
 * Em `relative`/`delta`, `target` é sempre positivo; o sentido vem de `direction`.
 * O engine escala a variação pelo modo de jogo (Blitz/Padrão/Completo).
 */
export type GoalTargetType = 'absolute' | 'relative' | 'delta';

export interface GoalDefinition {
  id: string;
  title: string;
  icon: string;
  description: string;
  /**
   * Critério exibido; `{target}` é substituído pelo alvo efetivo formatado.
   * Ex.: "Desemprego abaixo de {target}".
   */
  criteria: string;
  metric: MetricKey;
  direction: 'increase' | 'decrease';
  targetType: GoalTargetType;
  target: number;
}

export interface GoalProgress {
  goalId: string;
  /** Valor da métrica no início do mandato. */
  baseline: number;
  /** Valor-alvo efetivo (já escalado pelo modo). */
  targetValue: number;
  /** Progresso 0–100 do baseline até o alvo. */
  progress: number;
  achieved: boolean;
}
