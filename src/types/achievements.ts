/**
 * Conquistas do modo carreira: marcos da trajetória que ficam guardados neste
 * navegador (a galeria sobrevive ao fim da carreira e ao save apagado).
 */
import type { CareerCharacterRole, CareerMetricKey, CareerOfficeId } from './career';

/** Contadores da carreira que as conquistas consultam (derivados do estado). */
export type CareerStatKey =
  | 'electionsWon'
  | 'electionsLost'
  | 'appointmentsHeld'
  | 'lawsPassed'
  | 'worksDelivered'
  | 'worksOnTime'
  | 'partySwitches'
  | 'maxConsecutiveTerms'
  | 'runoffComebacks'
  | 'primariesWon'
  | 'adversaryDefeats'
  | 'levelsHeld'
  | 'amendmentsMillions'
  | 'missionsDone'
  | 'votesAgainstParty'
  | 'yearsInOffice'
  | 'generation'
  | 'presidentialTerms'
  | 'impeachments'
  | 'winsAfterIneligibility'
  | 'winsAfterPresidency';

export type CareerStats = Record<CareerStatKey, number>;

export type AchievementCriterion =
  /** Ocupou (ou ocupa) um destes cargos; com `maxAge`, assumiu até essa idade. */
  | { kind: 'office'; offices: CareerOfficeId[]; maxAge?: number }
  | { kind: 'stat'; stat: CareerStatKey; min: number }
  | { kind: 'metric'; metric: CareerMetricKey; min: number }
  | { kind: 'relation'; role: CareerCharacterRole; min: number }
  /** Aprovação da gestão (prefeito ou governador) em algum momento. */
  | { kind: 'admin-approval'; min: number }
  /** Venceu ao menos `wins` eleições sem nenhuma derrota. */
  | { kind: 'unbeaten'; wins: number }
  /** Todos os critérios ao mesmo tempo. */
  | { kind: 'all'; criteria: AchievementCriterion[] };

export type AchievementTier = 'bronze' | 'prata' | 'ouro';

export interface Achievement {
  /** kebab-case. */
  id: string;
  name: string;
  icon: string;
  /** Como conquistar (≤ 100 caracteres). */
  description: string;
  criterion: AchievementCriterion;
  tier: AchievementTier;
  /** Descrição escondida na galeria até a conquista. */
  secret?: boolean;
}

/** Registro na galeria (persistida fora do save). */
export interface AchievementUnlock {
  /** Data ISO em que foi conquistada pela primeira vez. */
  unlockedAt: string;
  /** Nome de urna de quem conquistou. */
  politicalName: string;
}

export interface AchievementGalleryData {
  unlocked: Record<string, AchievementUnlock>;
}
