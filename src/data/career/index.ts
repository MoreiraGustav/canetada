import type { CareerContent } from '@/types';
import { NAME_POOL } from '../names';
import { PARTIES } from '../parties';
import { REAL_PARTIES } from '../real/parties';
import { BRAZILIAN_STATES } from '../states';
import { CAREER_ACHIEVEMENTS } from './achievements';
import { CAREER_ACTIONS } from './actions';
import { CAREER_ADMIN_PROGRAMS } from './adminPrograms';
import { CAREER_AMENDMENT_TARGETS } from './amendments';
import { CAREER_APPOINTMENTS } from './appointments';
import { CAREER_BILLS } from './bills';
import { CAMPAIGN_DECISIONS, RUNOFF_OPTIONS } from './campaign';
import { CAREER_CASES } from './cases';
import { CAST_EVENTS } from './castEvents';
import { CAREER_CITIES } from './cities';
import { CAREER_EVENTS } from './events';
import { EX_PRESIDENT_ACTIONS, EX_PRESIDENT_EVENTS } from './exPresident';
import { CAREER_FLOOR_VOTES } from './floorVotes';
import { CAREER_LEGACY_TIERS } from './legacy';
import { CAREER_MISSIONS } from './missions';
import { VICE_EVENTS, VICE_MISSIONS } from './vice';
import { CAREER_OFFICES } from './offices';
import { CAREER_PROFESSIONS } from './professions';
import { CAMPAIGN_STRATEGIES } from './strategies';
import { CAREER_WORKS } from './works';

/** Eleitorado apto de cada UF: soma dos municípios. */
const STATE_VOTERS: Record<string, number> = Object.fromEntries(
  BRAZILIAN_STATES.map((uf) => [uf.id, CAREER_CITIES.filter((city) => city.stateId === uf.id).reduce((acc, city) => acc + city.voters, 0)]),
);

/**
 * Conteúdo do modo carreira. Traz os partidos dos dois mundos (fictícios e reais, com
 * número de urna); as stores filtram pelo mundo escolhido. As pessoas são sempre inventadas.
 */
export const CAREER_CONTENT: CareerContent = {
  professions: CAREER_PROFESSIONS,
  offices: CAREER_OFFICES,
  appointments: CAREER_APPOINTMENTS,
  actions: [...CAREER_ACTIONS, ...EX_PRESIDENT_ACTIONS],
  adminPrograms: CAREER_ADMIN_PROGRAMS,
  events: [...CAREER_EVENTS, ...CAST_EVENTS, ...EX_PRESIDENT_EVENTS, ...VICE_EVENTS],
  strategies: CAMPAIGN_STRATEGIES,
  campaignDecisions: CAMPAIGN_DECISIONS,
  runoffOptions: RUNOFF_OPTIONS,
  cities: CAREER_CITIES,
  stateVoters: STATE_VOTERS,
  parties: [...PARTIES, ...REAL_PARTIES],
  states: BRAZILIAN_STATES,
  names: NAME_POOL,
  legacyTiers: CAREER_LEGACY_TIERS,
  bills: CAREER_BILLS,
  floorVotes: CAREER_FLOOR_VOTES,
  amendmentTargets: CAREER_AMENDMENT_TARGETS,
  works: CAREER_WORKS,
  achievements: CAREER_ACHIEVEMENTS,
  cases: CAREER_CASES,
  missions: [...CAREER_MISSIONS, ...VICE_MISSIONS],
};
