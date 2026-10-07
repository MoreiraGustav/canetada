import type { CountryId } from './diplomacy';
import type { IndicatorKey, SectorKey } from './metrics';

export type Comparator = 'lt' | 'lte' | 'gt' | 'gte';

/** Compara um indicador (métrica, aprovação ou base aliada) com um valor. */
export interface IndicatorCondition {
  kind: 'indicator';
  indicator: IndicatorKey;
  comparator: Comparator;
  value: number;
}

/** Compara a aprovação de um setor com um valor. */
export interface SectorCondition {
  kind: 'sector';
  sector: SectorKey;
  comparator: Comparator;
  value: number;
}

/** Compara a relação com um país com um valor. */
export interface RelationCondition {
  kind: 'relation';
  country: CountryId;
  comparator: Comparator;
  value: number;
}

/**
 * Verifica a presença (ou ausência) de uma flag de estado — definida por
 * opções de decisões/eventos. Com `withinTurns`, a flag só conta se tiver
 * sido definida nos últimos N turnos.
 */
export interface FlagCondition {
  kind: 'flag';
  flag: string;
  present: boolean;
  withinTurns?: number;
}

/** Compara o turno absoluto atual (1-based) com um valor. */
export interface TurnCondition {
  kind: 'turn';
  comparator: Comparator;
  value: number;
}

/**
 * Compara o número do mandato atual (1 ou 2) com um valor.
 * Ex.: `{ kind: 'term', comparator: 'gte', value: 2 }` = conteúdo exclusivo do 2º mandato.
 */
export interface TermCondition {
  kind: 'term';
  comparator: Comparator;
  value: number;
}

export type Condition =
  | IndicatorCondition
  | SectorCondition
  | RelationCondition
  | FlagCondition
  | TurnCondition
  | TermCondition;
