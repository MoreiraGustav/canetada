import type { DelayedImpact, Impact } from './impact';

export type CountryId = 'eua' | 'china' | 'uniao-europeia' | 'argentina' | 'russia' | 'india' | 'africa';

export type BlocId = 'brics' | 'mercosul';

export interface Country {
  id: CountryId;
  name: string;
  /** Emoji de bandeira/representação. */
  flag: string;
  /** Relação inicial (0–100), conforme GDD §4.3. */
  initialRelation: number;
  /** Interesses principais (texto exibido). */
  interests: string[];
  blocs: BlocId[];
  /**
   * Peso relativo do país no comércio/investimento com o Brasil (0–1).
   * Usado no cálculo de IDE e balança comercial.
   */
  economicWeight: number;
  description: string;
}

export interface Bloc {
  id: BlocId;
  name: string;
  icon: string;
  members: CountryId[];
  description: string;
}

/** Relação (0–100) com cada país. */
export type Relations = Record<CountryId, number>;

/**
 * Ação diplomática disponível 1x por turno (visita de Estado, missão comercial…).
 * A ação mira um país; `relationDelta` vai para o país-alvo.
 */
export interface DiplomaticAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  /** Delta imediato na relação com o país-alvo. */
  relationDelta: number;
  /** Impacto imediato adicional (ex.: prestígio, balança comercial). */
  impact: Impact;
  /** Efeitos graduais adicionais (não relacionados ao país-alvo). */
  delayed?: DelayedImpact[];
  /**
   * Parte do ganho de relação que se dissipa ao longo dos turnos seguintes
   * ("boost temporário"). Ex.: 5 com relationDelta 8 → ganho permanente de 3.
   */
  targetRelationDecay: number;
  /** Turnos ao longo dos quais `targetRelationDecay` se dissipa. */
  decayDuration: number;
  /** Texto da manchete; `{country}` é substituído pelo nome do país. */
  headline: string;
}
