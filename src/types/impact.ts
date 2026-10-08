import type { CountryId } from './diplomacy';
import type { MetricKey, SectorKey } from './metrics';

/** Chaves numéricas planas de um impacto: métricas + aprovação + base aliada. */
export type ImpactKey = MetricKey | 'approval' | 'congressSupport';

/**
 * Impacto declarativo (aditivo) sobre o estado do país.
 *
 * Semântica de cada chave:
 * - Métricas: delta aditivo na unidade da métrica (ex.: `inflation: 0.3` = +0,3 p.p.).
 *   `gdpGrowth` é um choque no crescimento anualizado (reverte ao potencial com o tempo);
 *   `potentialGrowth` é estrutural (persistente). `primaryBalance` é persistente
 *   (ex.: novo programa permanente de R$ 30 bi/ano ≈ -0,27). `debt` é one-off em p.p. do PIB.
 *   `gdp` NÃO deve ser usado em dados (o nível do PIB é consequência do crescimento).
 * - `approval`: delta uniforme aplicado a todos os setores.
 * - `congressSupport`: delta em pontos da base aliada.
 * - `sectors`: delta em pontos na aprovação de setores específicos.
 * - `relations`: delta em pontos na relação com países (0–100).
 *
 * Exemplo: `{ approval: -2, inflation: 0.3, debt: 0.4, sectors: { market: 6 }, relations: { eua: -4 } }`
 */
export type Impact = Partial<Record<ImpactKey, number>> & {
  sectors?: Partial<Record<SectorKey, number>>;
  relations?: Partial<Record<CountryId, number>>;
};

/**
 * Impacto com efeito gradual: o total de `impact` é distribuído igualmente
 * ao longo de `duration` turnos, começando `delay` turnos após o turno atual
 * (delay 0 = começa no próximo turno).
 * Usado para "decisões técnicas demoram a dar resultado mas são sustentáveis".
 */
export interface DelayedImpact {
  impact: Impact;
  delay: number;
  duration: number;
  /** Rótulo exibido em "efeitos em andamento" (ex.: "Obras do Novo PAC"). */
  label?: string;
}

/** Efeito gradual em andamento (estado serializável). */
export interface ActiveEffect {
  /** Único: `${sourceId}:${turnoDeCriação}:${índice}`. */
  id: string;
  /** ID da decisão/evento/ação que originou o efeito. */
  sourceId: string;
  label: string;
  /** Impacto aplicado a cada turno ativo. */
  perTurn: Impact;
  /** Primeiro turno (inclusive) em que o efeito é aplicado. */
  startTurn: number;
  /** Último turno (inclusive) em que o efeito é aplicado. */
  endTurn: number;
}

/** Dica qualitativa de efeito exibida nas opções (ex.: "Inflação ↑↑"). */
export interface ImpactHint {
  key: string;
  label: string;
  direction: 'up' | 'down';
  /** 1 = leve, 2 = moderado, 3 = forte. */
  intensity: 1 | 2 | 3;
  tone: 'positive' | 'negative' | 'neutral';
  /** Indicador de uma meta escolhida pelo jogador (destacado). */
  goal?: boolean;
}

/**
 * Desfecho incerto de uma opção: com probabilidade `chance`, algo sai diferente
 * do planejado (ex.: operação policial termina em tragédia). Aplicado além do
 * impacto normal da opção. Pode ser negativo (o comum) ou uma surpresa positiva.
 */
export interface OutcomeRisk {
  /** Probabilidade (0–1) de o desfecho acontecer. */
  chance: number;
  impact: Impact;
  delayed?: DelayedImpact[];
  /** Manchete quando o desfecho acontece (≤ 85 caracteres). */
  headline: string;
  flags?: string[];
}

/**
 * Escala de impactos conforme a dificuldade: deltas benéficos são multiplicados
 * por `positive` e prejudiciais por `negative` (segundo a polaridade do indicador).
 */
export interface ImpactScaling {
  positive: number;
  negative: number;
}
