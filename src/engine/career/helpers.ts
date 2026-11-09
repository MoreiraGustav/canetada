/**
 * Consultas básicas da carreira: cargo atual, papel, idade, partido e a relação
 * com quem governa cada nível. Tudo puro e derivado do `CareerState`.
 */
import { CAREER } from '@/constants/balance';
import type {
  CareerAppointment,
  CareerCharacter,
  CareerCharacterRole,
  CareerCity,
  CareerContent,
  CareerLevel,
  CareerOffice,
  CareerPosition,
  CareerRole,
  CareerState,
  GovernmentRelation,
  Party,
} from '@/types';
import { getCareerDate } from '@/utils/careerCalendar';
import { clamp } from '@/utils/math';

export const findOffice = (content: CareerContent, id: string): CareerOffice | undefined => content.offices.find((office) => office.id === id);

/** Padrinho e rival são do seu partido; o adversário, de outro (entrar no partido dele encerra a rivalidade). */
export const getCharacter = (state: CareerState, role: CareerCharacterRole): CareerCharacter | undefined =>
  (state.cast ?? []).find((character) => character.active && character.role === role && (role === 'adversario') !== (character.partyId === state.partyId));

/** "Paulo Roberto Albuquerque Valadares" → "Paulo Valadares" (para manchetes). */
export const shortName = (name: string): string => {
  const parts = name.split(' ');
  return parts.length <= 2 ? name : `${parts[0]} ${parts[parts.length - 1]}`;
};

export const findAppointment = (content: CareerContent, id: string): CareerAppointment | undefined =>
  content.appointments.find((appointment) => appointment.id === id);

export const findParty = (content: CareerContent, id: string | null): Party | undefined =>
  id === null ? undefined : content.parties.find((party) => party.id === id);

export const findCity = (content: CareerContent, id: string): CareerCity | undefined => content.cities.find((city) => city.id === id);

/** Idade do personagem num semestre (aniversário contado em janeiro). */
export const ageAt = (state: CareerState, turn: number = state.turn): number => getCareerDate(turn).year - state.profile.birthYear;

/** Cargo eletivo atual (null se não tiver mandato). */
export const currentOffice = (state: CareerState, content: CareerContent): CareerOffice | undefined =>
  state.position?.kind === 'office' ? findOffice(content, state.position.id) : undefined;

/** Cargo de nomeação atual (null se não tiver). */
export const currentAppointment = (state: CareerState, content: CareerContent): CareerAppointment | undefined =>
  state.position?.kind === 'appointment' ? findAppointment(content, state.position.id) : undefined;

/** Papel atual: decide as ações e eventos disponíveis. */
export const getCareerRole = (state: CareerState, content: CareerContent): CareerRole => {
  if (!state.position) return 'sem-cargo';
  if (state.position.kind === 'appointment') return 'nomeado';
  const office = findOffice(content, state.position.id);
  if (!office) return 'sem-cargo';
  if (office.headOffice) return 'vice';
  return office.branch === 'legislativo' ? 'legislativo' : 'executivo';
};

/** Nível do cargo atual (eletivo ou de nomeação), ou null. */
export const getCareerLevel = (state: CareerState, content: CareerContent): CareerLevel | null =>
  currentOffice(state, content)?.level ?? currentAppointment(state, content)?.level ?? null;

const ideologyDistance = (a: { economicIdeology: number; socialIdeology: number }, b: { economicIdeology: number; socialIdeology: number }): number =>
  Math.hypot(a.economicIdeology - b.economicIdeology, a.socialIdeology - b.socialIdeology);

/** Dois partidos são aliados se forem o mesmo ou estiverem perto no espectro. */
export const arePartiesAllied = (content: CareerContent, a: string | null, b: string | null): boolean => {
  if (a === null || b === null) return false;
  if (a === b) return true;
  const first = findParty(content, a);
  const second = findParty(content, b);
  return Boolean(first && second && ideologyDistance(first, second) <= CAREER.party.allyDistance);
};

/** Relação do partido do jogador com quem governa um nível. */
export const getGovernmentRelation = (state: CareerState, content: CareerContent, level: CareerLevel): GovernmentRelation => {
  const government = state.governments[level].partyId;
  if (state.partyId !== null && government === state.partyId) return 'own';
  return arePartiesAllied(content, state.partyId, government) ? 'ally' : 'opposition';
};

/** Onde não há Câmara Municipal (Brasília e Fernando de Noronha) não há eleição de prefeito nem de vereador. */
export const hasMunicipalElections = (state: CareerState, content: CareerContent): boolean =>
  (findCity(content, state.profile.baseCityId)?.councilSeats ?? 0) > 0;

/** Bancada média dos partidos com deputados no mundo da carreira (referência de "partido grande"). */
export const referenceSeats = (content: CareerContent): number => {
  const seated = content.parties.filter((party) => party.seats > 0);
  return seated.length > 0 ? seated.reduce((acc, party) => acc + party.seats, 0) / seated.length : 1;
};

/**
 * Multiplicador dos ganhos de influência no partido atual: partido pequeno faz a
 * influência crescer mais rápido; partido distante da sua ideologia, mais devagar.
 */
export const partyInfluenceFactor = (state: CareerState, content: CareerContent): number => {
  const party = findParty(content, state.partyId);
  if (!party) return 1;
  const { party: rules } = CAREER;
  // Tamanho: (bancada de referência / bancada)^expoente, limitado.
  const size = clamp((referenceSeats(content) / Math.max(1, party.seats)) ** rules.influenceSizeExponent, rules.influenceSizeMin, rules.influenceSizeMax);
  // Afinidade: pleno até `fitDistance`, cai linearmente até `misfitFactor` em `misfitDistance`.
  const distance = ideologyDistance(party, state.profile);
  const t = clamp((distance - rules.fitDistance) / (rules.misfitDistance - rules.fitDistance), 0, 1);
  const fit = 1 - t * (1 - rules.misfitFactor);
  return size * fit;
};

/** Partido mais próximo no espectro (exceto o atual): quem faz convites de troca. */
export const closestOtherParty = (state: CareerState, content: CareerContent): Party | undefined =>
  content.parties
    .filter((party) => party.id !== state.partyId)
    .sort((a, b) => ideologyDistance(a, state.profile) - ideologyDistance(b, state.profile))[0];

/** Encerra a posição atual (vai para o histórico, com o último semestre exercido). */
export const closePosition = (state: CareerState, lastTurn: number = state.turn): CareerState => {
  if (!state.position) return state;
  const closed: CareerPosition = { ...state.position, endTurn: Math.max(state.position.startTurn, lastTurn) };
  return { ...state, position: null, administration: null, pastPositions: [...state.pastPositions, closed] };
};
