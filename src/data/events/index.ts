import type { GameEvent } from '@/types';

import { CORRUPTION_EVENTS } from './corruption';
import { ECONOMIC_CRISIS_EVENTS } from './economicCrisis';
import { IDEOLOGY_EVENTS } from './ideology';
import { INTERNATIONAL_EVENTS } from './international';
import { NATURAL_DISASTER_EVENTS } from './naturalDisaster';
import { OPPORTUNITY_EVENTS } from './opportunity';
import { POLITICAL_SCANDAL_EVENTS } from './politicalScandal';
import { SCHEDULED_EVENTS } from './scheduled';
import { SECOND_TERM_EVENTS } from './secondTerm';
import { SOCIAL_EVENTS } from './social';

/** Banco completo de eventos (aleatórios, condicionais e programados). */
export const EVENTS: GameEvent[] = [
  ...ECONOMIC_CRISIS_EVENTS,
  ...NATURAL_DISASTER_EVENTS,
  ...POLITICAL_SCANDAL_EVENTS,
  ...OPPORTUNITY_EVENTS,
  ...INTERNATIONAL_EVENTS,
  ...SOCIAL_EVENTS,
  ...SCHEDULED_EVENTS,
  ...SECOND_TERM_EVENTS,
  ...CORRUPTION_EVENTS,
  ...IDEOLOGY_EVENTS,
];
