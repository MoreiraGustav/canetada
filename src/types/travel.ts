import type { DelayedImpact, Impact, OutcomeRisk } from './impact';
import type { SectorKey } from './metrics';

export type RegionId = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

/**
 * Perfil de uma cidade, que define o tipo de agenda presidencial possível lá
 * (o efeito da visita vem do modelo do perfil em `data/visitKinds.ts`).
 */
export type CityKind =
  | 'capital'
  | 'periferia'
  | 'industrial'
  | 'agro'
  | 'sertao'
  | 'amazonia'
  | 'porto'
  | 'turismo'
  | 'tecnologia'
  | 'fronteira'
  | 'mineracao'
  | 'fe';

export interface BrazilianCity {
  /** Único global (kebab-case): `${uf}-${cidade}`, ex.: "sp-campinas". */
  id: string;
  name: string;
  kind: CityKind;
  /** Gancho local da agenda (≤ 75 caracteres), ex.: "Polo de tecnologia e sede da Unicamp". */
  hook: string;
}

/** Unidade da federação visitável no mapa. */
export interface BrazilianState {
  /** UF em minúsculas, ex.: "sp" (casa com o mapa em `data/brazilMap.ts`). */
  id: string;
  /** Sigla, ex.: "SP". */
  uf: string;
  name: string;
  capital: string;
  region: RegionId;
  /** População em milhões (IBGE, Censo 2022). */
  population: number;
  /** Deputados federais da bancada (total da Câmara: 513). */
  seats: number;
  /**
   * Inclinação média do eleitorado no espectro do jogo:
   * econômica (-100 esquerda … 100 direita) e costumes (-100 progressista … 100 conservador).
   */
  lean: { economic: number; social: number };
  /** Três cidades: a primeira é a capital (perfil "capital"). */
  cities: BrazilianCity[];
}

/** Modelo de agenda por perfil de cidade: o que a visita faz e o que pode dar errado. */
export interface VisitKind {
  id: CityKind;
  /** Nome da agenda com `{city}`, ex.: "Caminhada na periferia de {city}". */
  name: string;
  icon: string;
  /** Trade-off em linguagem simples (≤ 75 caracteres). */
  description: string;
  impact: Impact;
  delayed?: DelayedImpact[];
  /** Risco base (vaias, protestos, gafe); um eleitorado hostil ao governo aumenta a chance. */
  risk: OutcomeRisk;
  /** Manchete com `{city}` e `{uf}` (≤ 85 caracteres depois de preenchida). */
  headline: string;
  /** Setor que mais sente a visita (exibido no cartão da cidade). */
  audience: SectorKey;
}

/** Contorno de uma UF no mapa (SVG). */
export interface StateShape {
  /** UF em minúsculas (casa com `BrazilianState.id`). */
  id: string;
  /** Ponto para o rótulo (centroide do maior polígono). */
  label: readonly [number, number];
  /** Caminho SVG. */
  d: string;
}

/** Popularidade estimada do governo em um estado (mapa). */
export interface StateApprovalView {
  stateId: string;
  approval: number;
  /** Bônus local de uma visita recente (pontos, já decaído). */
  visitBonus: number;
  /** Turnos até poder visitar o estado de novo (0 = livre). */
  cooldownLeft: number;
}
