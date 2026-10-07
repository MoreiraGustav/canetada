import type { Impact } from './impact';
import type { SectorAffinity } from './metrics';

export type BackgroundId = 'politico-veterano' | 'empresario' | 'militar' | 'academico' | 'ativista';

export type AbilityId =
  | 'articulador-nato'
  | 'negociador-habil'
  | 'carisma-popular'
  | 'ficha-limpa'
  | 'diplomata'
  | 'gestor-de-crises'
  | 'credibilidade-economica';

/**
 * Modificadores passivos do jogador (habilidade + background).
 * Valores neutros em `DEFAULT_MODIFIERS` (constants/balance.ts).
 */
export interface ModifierSet {
  /** Somado à chance de aprovar leis (0.10 = +10 p.p.). */
  voteChanceBonus: number;
  /** Multiplica o custo político da negociação no Congresso. */
  negotiationCostMultiplier: number;
  /** Multiplica o desgaste natural de aprovação por turno. */
  approvalDecayMultiplier: number;
  /** Multiplica o peso de sorteio de escândalos políticos. */
  scandalWeightMultiplier: number;
  /** Multiplica deltas positivos de relações diplomáticas. */
  diplomacyMultiplier: number;
  /** Pontos somados à aprovação de equilíbrio do mercado e empresários. */
  economicConfidenceBonus: number;
  /** Multiplica impactos negativos de eventos de crise. */
  crisisImpactMultiplier: number;
}

export interface Party {
  /** kebab-case, ex.: "partido-social-trabalhista". */
  id: string;
  name: string;
  acronym: string;
  /** Cor hex para UI. */
  color: string;
  /** -100 (esquerda) … 100 (direita). */
  economicIdeology: number;
  /** -100 (progressista) … 100 (conservador). */
  socialIdeology: number;
  description: string;
  /** Pontos somados à base aliada inicial (tamanho da bancada). */
  congressBase: number;
}

export interface BackgroundDefinition {
  id: BackgroundId;
  name: string;
  icon: string;
  description: string;
  /** Afinidade setorial (aplicada apenas a candidatos customizados). */
  sectorAffinity: SectorAffinity;
  /** Impacto inicial (aplicado apenas a candidatos customizados). */
  startingImpact: Impact;
  /** Modificadores passivos (aplicados a todos os candidatos). */
  modifiers: Partial<ModifierSet>;
}

export interface Ability {
  id: AbilityId;
  name: string;
  icon: string;
  description: string;
  modifiers: Partial<ModifierSet>;
}

/** Candidato-arquétipo pré-definido (GDD §2.4, Opção A). */
export interface Candidate {
  id: string;
  name: string;
  /** Rótulo do arquétipo, ex.: "Centro-Direita". */
  archetype: string;
  partyId: string;
  profile: string;
  economicIdeology: number;
  socialIdeology: number;
  background: BackgroundId;
  abilityId: AbilityId;
  /** Bônus/penalidades persistentes por setor (ex.: { market: 15, lowerClass: -10 }). */
  sectorAffinity: SectorAffinity;
  /** Impacto aplicado na posse (ex.: { congressSupport: -15 }). */
  startingImpact: Impact;
  bonusText: string;
  penaltyText: string;
  /** Cor hex para UI. */
  color: string;
  emblem: string;
  /** Slogan de campanha. */
  slogan: string;
}

/** Dados do formulário de criação de candidato (GDD §2.4, Opção B). */
export interface CustomCandidateInput {
  name: string;
  partyId: string;
  economicIdeology: number;
  socialIdeology: number;
  background: BackgroundId;
  abilityId: AbilityId;
}

export type CandidateSelection =
  | { kind: 'archetype'; candidateId: string }
  | { kind: 'custom'; input: CustomCandidateInput };

/** Candidato efetivo do jogador, com afinidades e modificadores já resolvidos. */
export interface PlayerCandidate {
  name: string;
  partyId: string;
  /** ID do arquétipo, ou null se customizado. */
  archetypeId: string | null;
  economicIdeology: number;
  socialIdeology: number;
  background: BackgroundId;
  abilityId: AbilityId;
  sectorAffinity: SectorAffinity;
  startingImpact: Impact;
  modifiers: ModifierSet;
  color: string;
  emblem: string;
}
