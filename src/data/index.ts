import type { GameContent } from '@/types';
import { ABILITIES } from './abilities';
import { BACKGROUNDS } from './backgrounds';
import { CAMPAIGN_QUESTIONS } from './campaign';
import { CANDIDATES } from './candidates';
import { BLOCS, COUNTRIES } from './countries';
import { CPI_TOPICS } from './cpiTopics';
import { CRISIS_ACTIONS } from './crisisActions';
import { DECISIONS } from './decisions';
import { DIPLOMATIC_ACTIONS } from './diplomaticActions';
import { EVENTS } from './events';
import { FISCAL_STANCES } from './fiscalStances';
import { GOALS } from './goals';
import { HEADLINE_TEMPLATES } from './headlines';
import { LATENT_RISKS } from './latentRisks';
import { LEGACY_TIERS } from './legacy';
import { NAME_POOL } from './names';
import { NEWS_BLIPS } from './newsBlips';
import { OPPOSITION_LINES } from './oppositionLines';
import { PARTIES } from './parties';
import { PRESIDENTIAL_ACTIONS } from './presidentialActions';
import { PROGRAMS } from './programs';
import { REAL_CANDIDATES } from './real/candidates';
import { REAL_PARTIES } from './real/parties';
import { BRAZILIAN_STATES } from './states';
import { VISIT_KINDS } from './visitKinds';

/** Registro central de todo o conteúdo do jogo (data-driven). */
export const GAME_CONTENT: GameContent = {
  decisions: DECISIONS,
  events: EVENTS,
  headlines: HEADLINE_TEMPLATES,
  countries: COUNTRIES,
  blocs: BLOCS,
  diplomaticActions: DIPLOMATIC_ACTIONS,
  cpiTopics: CPI_TOPICS,
  goals: GOALS,
  // Brasil fictício (padrão) e Brasil real: as stores filtram por `world`.
  candidates: [...CANDIDATES, ...REAL_CANDIDATES],
  parties: [...PARTIES, ...REAL_PARTIES],
  backgrounds: BACKGROUNDS,
  abilities: ABILITIES,
  campaignQuestions: CAMPAIGN_QUESTIONS,
  legacyTiers: LEGACY_TIERS,
  latentRisks: LATENT_RISKS,
  newsBlips: NEWS_BLIPS,
  presidentialActions: PRESIDENTIAL_ACTIONS,
  programs: PROGRAMS,
  fiscalStances: FISCAL_STANCES,
  crisisActions: CRISIS_ACTIONS,
  states: BRAZILIAN_STATES,
  visitKinds: VISIT_KINDS,
  names: NAME_POOL,
  oppositionLines: OPPOSITION_LINES,
};
