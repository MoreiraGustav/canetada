import type { MinistryId } from './decisions';
import type { IndicatorKey } from './metrics';
import type { FaceSex, Portrait } from './world';

/** Ministro técnico (sem partido, entrega mais) ou político (de um partido aliado, traz votos). */
export type MinisterProfile = 'tecnico' | 'politico';

/** Ministro de uma pasta: sempre um personagem fictício (escândalos nunca atingem pessoas reais). */
export interface Minister {
  ministry: MinistryId;
  name: string;
  sex: FaceSex;
  profile: MinisterProfile;
  /** Partido do ministro político (null no técnico). */
  partyId: string | null;
  /** Semente do retrato ilustrado. */
  portraitSeed: number;
  /** Turno em que assumiu a pasta. */
  since: number;
}

/** Líder da oposição: o adversário derrotado na eleição. */
export interface OppositionLeader {
  name: string;
  partyId: string;
  /** ID do candidato (para o retrato), se veio da lista de candidatos. */
  candidateId: string | null;
  /** Pessoa real: as manchetes falam da oposição (o partido), nunca citam a pessoa. */
  real: boolean;
}

/** Personagens da política em torno do presidente (estado serializável). */
export interface PoliticalCast {
  /** Semente estável dos personagens (governadores, novos ministros). */
  seed: number;
  cabinet: Minister[];
  opposition: OppositionLeader | null;
}

/** Governador de um estado (fictício, derivado da semente do elenco). */
export interface Governor {
  stateId: string;
  name: string;
  sex: FaceSex;
  partyId: string;
  /** Relação com o governo federal. */
  stance: 'aliado' | 'neutro' | 'oposicao';
  portraitSeed: number;
}

/** Banco de nomes para personagens fictícios. */
export interface NamePool {
  femaleFirst: string[];
  maleFirst: string[];
  surnames: string[];
}

/**
 * Reação da oposição a um indicador que se moveu no mês (manchete).
 * `{oposicao}` vira o nome do líder (fictício) ou "a oposição liderada pelo PARTIDO" (pessoa real).
 */
export interface OppositionLine {
  indicator: IndicatorKey;
  direction: 'up' | 'down';
  /** Variação mínima no mês para a oposição reagir. */
  threshold: number;
  templates: string[];
}

/** Retrato pronto para a UI (pessoa real com foto ou personagem ilustrado). */
export interface CharacterView {
  name: string;
  portrait: Portrait;
  /** Linha abaixo do nome (ex.: "Fazenda · técnica"). */
  caption: string;
}
