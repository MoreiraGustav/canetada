import type { Impact } from './impact';

export type FiscalStanceId = 'expansao-forte' | 'expansao' | 'neutra' | 'ajuste' | 'ajuste-forte';

/**
 * Política fiscal escolhida pelo presidente (orçamento): para onde o resultado
 * primário caminha mês a mês e quem sente no bolso enquanto ela vigora.
 */
export interface FiscalStance {
  id: FiscalStanceId;
  label: string;
  icon: string;
  /** Trade-off em linguagem simples (≤ 120 caracteres). */
  description: string;
  /** Flag de estado enquanto a política vigora (null = seguir a regra fiscal, o padrão). */
  flag: string | null;
  /** Meta de resultado primário (% do PIB) — null = regra fiscal (só corrige déficits). */
  primaryTarget: number | null;
  /** Fração anual da distância à meta percorrida pelo primário. */
  convergencePerYear: number;
  /** Efeito contínuo aplicado todo mês enquanto a política vigora (setores, ideologia). */
  monthly: Impact;
  /** Manchete ao adotar (≤ 85 caracteres). */
  headline: string;
}

/** Custo fiscal estimado de uma escolha, em reais (preços de 2026). */
export interface FiscalCost {
  /** Variação no resultado primário anual, em R$ bi/ano (negativo = gasto novo ou receita perdida). */
  annual: number;
  /** Gasto pontual que vira dívida, em R$ bi (positivo = mais dívida). */
  oneOff: number;
  /** Diferença na dívida projetada em 4 anos, em p.p. do PIB (positivo = mais dívida). */
  debtIn4Years: number;
}

/** Composição da variação anual da dívida (p.p. do PIB por ano). */
export interface DebtDrivers {
  /** Juros reais e nominais da dívida (aumentam a dívida). */
  interest: number;
  /** Crescimento nominal do PIB (dilui a dívida). */
  growth: number;
  /** Resultado primário (déficit aumenta, superávit reduz). */
  primary: number;
  /** Soma: variação anual da dívida no ritmo atual. */
  total: number;
}

/** Fotografia das contas públicas em reais. */
export interface PublicAccounts {
  /** Dívida bruta em R$ tri. */
  debtTrillions: number;
  /** Resultado primário em R$ bi/ano. */
  primaryBillions: number;
  /** Juros da dívida em R$ bi/ano. */
  interestBillions: number;
  /** Juro efetivo médio da dívida (% a.a.). */
  effectiveRate: number;
  /** Resultado nominal (primário − juros) em R$ bi/ano. */
  nominalBillions: number;
  drivers: DebtDrivers;
}

/** Ponto da projeção da dívida (mês à frente → % do PIB). */
export interface DebtProjectionPoint {
  monthsAhead: number;
  debt: number;
  primaryBalance: number;
}
