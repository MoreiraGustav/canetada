import type { GameContent } from '@/types';
import { ABILITIES } from './abilities';
import { BACKGROUNDS } from './backgrounds';
import { CAMPAIGN_QUESTIONS } from './campaign';
import { CANDIDATES } from './candidates';
import { BLOCS, COUNTRIES } from './countries';
import { CPI_TOPICS } from './cpiTopics';
import { DECISIONS } from './decisions';
import { DIPLOMATIC_ACTIONS } from './diplomaticActions';
import { EVENTS } from './events';
import { GOALS } from './goals';
import { HEADLINE_TEMPLATES } from './headlines';
import { LATENT_RISKS } from './latentRisks';
import { LEGACY_TIERS } from './legacy';
import { NEWS_BLIPS } from './newsBlips';
import { PARTIES } from './parties';
import { PRESIDENTIAL_ACTIONS } from './presidentialActions';

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
  candidates: CANDIDATES,
  parties: PARTIES,
  backgrounds: BACKGROUNDS,
  abilities: ABILITIES,
  campaignQuestions: CAMPAIGN_QUESTIONS,
  legacyTiers: LEGACY_TIERS,
  latentRisks: LATENT_RISKS,
  newsBlips: NEWS_BLIPS,
  presidentialActions: PRESIDENTIAL_ACTIONS,
};
