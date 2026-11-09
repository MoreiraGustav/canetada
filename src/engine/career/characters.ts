/**
 * Elenco da carreira: padrinho (cacique do seu partido), rival (disputa as mesmas
 * vagas dentro do partido) e adversário recorrente (a oposição a você). Cada um tem
 * relação com o jogador (com memória dos episódios), força política e carreira própria.
 */
import { CAREER } from '@/constants/balance';
import type { CareerCharacter, CareerCharacterRole, CareerContent, CareerNews, CareerOffice, CareerState, FaceSex, Rng } from '@/types';
import { getCareerDate, getElectionAt, getNextElectionTurn } from '@/utils/careerCalendar';
import { clamp } from '@/utils/math';
import { generateName } from '../cast';
import { createRng, randomInt } from '../random';
import { arePartiesAllied, findOffice, findParty, getCharacter, getGovernmentRelation, hasMunicipalElections, shortName } from './helpers';

export { getCharacter, shortName };
import { createCareerNews } from './text';

const FEMALE_SHARE = 0.5;
const SEED_RANGE = 2 ** 31 - 2;
const ROLES: readonly CareerCharacterRole[] = ['padrinho', 'rival', 'adversario'];
/** Idades no início do elenco: padrinho bem mais velho; rival da sua geração; adversário um pouco mais velho. */
const PADRINHO_AGE_GAP = { min: 18, max: 32 } as const;
const PADRINHO_MIN_AGE = 48;
const RIVAL_AGE_GAP = 5;
const ADVERSARY_AGE_GAP = { min: 0, max: 15 } as const;
const PERCENT = 100;

export const characterAge = (character: CareerCharacter, turn: number): number => getCareerDate(turn).year - character.birthYear;

interface CharacterSpec {
  role: CareerCharacterRole;
  partyId: string;
  strength: number;
  birthYear: number;
  officeId?: CareerOffice['id'] | null;
  officeEndTurn?: number | null;
  name?: string;
  sex?: FaceSex;
}

const createCharacter = (rng: Rng, content: CareerContent, state: CareerState, spec: CharacterSpec): CareerCharacter => {
  const sex: FaceSex = spec.sex ?? (rng.next() < FEMALE_SHARE ? 'f' : 'm');
  return {
    id: `${spec.role}-${state.turn}-${randomInt(rng, 1, SEED_RANGE)}`,
    role: spec.role,
    name: spec.name ?? generateName(rng, content.names, sex),
    sex,
    portraitSeed: randomInt(rng, 1, SEED_RANGE),
    partyId: spec.partyId,
    birthYear: spec.birthYear,
    relation: CAREER.cast.initialRelation[spec.role],
    strength: clamp(spec.strength, CAREER.cast.minStrength, CAREER.cast.maxStrength),
    officeId: spec.officeId ?? null,
    officeEndTurn: spec.officeEndTurn ?? null,
    memory: [],
    active: true,
  };
};

/** Padrinho: veterano do seu partido, com mandato federal. */
const createPadrinho = (rng: Rng, content: CareerContent, state: CareerState): CareerCharacter => {
  const { min, max } = CAREER.cast.padrinhoStrength;
  const strength = randomInt(rng, min, max);
  const year = getCareerDate(state.turn).year;
  const birthYear = Math.min(year - PADRINHO_MIN_AGE, state.profile.birthYear - randomInt(rng, PADRINHO_AGE_GAP.min, PADRINHO_AGE_GAP.max));
  const officeId = strength >= (min + max) / 2 ? 'senador' : 'deputado-federal';
  return createCharacter(rng, content, state, {
    role: 'padrinho',
    partyId: state.partyId ?? content.parties[0].id,
    strength,
    birthYear,
    officeId,
    officeEndTurn: getNextElectionTurn(state.turn, 'geral'),
  });
};

/** Rival: da sua geração e um pouco à frente na influência. */
const createRival = (rng: Rng, content: CareerContent, state: CareerState): CareerCharacter =>
  createCharacter(rng, content, state, {
    role: 'rival',
    partyId: state.partyId ?? content.parties[0].id,
    strength: state.metrics.partyInfluence + randomInt(rng, CAREER.cast.rivalLead.min, CAREER.cast.rivalLead.max),
    birthYear: state.profile.birthYear + randomInt(rng, -RIVAL_AGE_GAP, RIVAL_AGE_GAP),
  });

/**
 * Adversário: se a prefeitura é de oposição, é o próprio prefeito; senão, uma liderança do
 * maior partido de oposição ao seu.
 */
const createAdversary = (rng: Rng, content: CareerContent, state: CareerState): CareerCharacter => {
  const mayor = state.governments.municipal;
  const birthYear = state.profile.birthYear - randomInt(rng, ADVERSARY_AGE_GAP.min, ADVERSARY_AGE_GAP.max);
  if (hasMunicipalElections(state, content) && !mayor.isPlayer && getGovernmentRelation(state, content, 'municipal') === 'opposition') {
    return createCharacter(rng, content, state, {
      role: 'adversario',
      partyId: mayor.partyId,
      strength: CAREER.cast.incumbentAdversaryStrength,
      birthYear,
      officeId: 'prefeito',
      officeEndTurn: getNextElectionTurn(state.turn, 'municipal'),
      name: mayor.leaderName,
      sex: mayor.leaderSex,
    });
  }
  const opposition = [...content.parties]
    .filter((party) => !arePartiesAllied(content, state.partyId, party.id))
    .sort((a, b) => b.seats - a.seats)[0] ?? content.parties[0];
  const { min, max } = CAREER.cast.adversaryStrength;
  return createCharacter(rng, content, state, { role: 'adversario', partyId: opposition.id, strength: randomInt(rng, min, max), birthYear });
};

const CREATORS: Record<CareerCharacterRole, (rng: Rng, content: CareerContent, state: CareerState) => CareerCharacter> = {
  padrinho: createPadrinho,
  rival: createRival,
  adversario: createAdversary,
};

/** Garante um personagem em cena em cada papel (carreira nova, troca de partido, aposentadoria). */
export const ensureCareerCast = (state: CareerState, content: CareerContent): CareerState => {
  if (state.partyId === null) return { ...state, cast: state.cast ?? [] };
  const missing = ROLES.filter((role) => !getCharacter(state, role));
  if (missing.length === 0) return state.cast ? state : { ...state, cast: [] };
  const rng = createRng(state.seed);
  const base = { ...state, cast: state.cast ?? [] };
  const cast = missing.reduce((acc, role) => [...acc, CREATORS[role](rng, content, { ...base, cast: acc })], base.cast);
  return { ...base, cast, seed: rng.getSeed() };
};

// ─── Relação e memória ────────────────────────────────────────────────────

const remember = (character: CareerCharacter, turn: number, text: string, delta: number): CareerCharacter => {
  if (Math.abs(delta) < CAREER.cast.memoryMinDelta || text === '') return character;
  return { ...character, memory: [...character.memory, { turn, text, delta }].slice(-CAREER.cast.memorySize) };
};

const updateCharacter = (state: CareerState, id: string, update: (character: CareerCharacter) => CareerCharacter): CareerState => ({
  ...state,
  cast: state.cast.map((character) => (character.id === id ? update(character) : character)),
});

/** Muda a relação com quem está no papel e guarda o episódio na memória dele. */
export const changeRelation = (state: CareerState, role: CareerCharacterRole, delta: number, text: string): CareerState => {
  const character = getCharacter(state, role);
  if (!character || delta === 0) return state;
  return updateCharacter(state, character.id, (current) =>
    remember({ ...current, relation: clamp(current.relation + delta, -PERCENT, PERCENT) }, state.turn, text, delta),
  );
};

/** Multiplicador dos ganhos de influência pela relação com o padrinho. */
export const padrinhoInfluenceMultiplier = (state: CareerState): number => {
  const padrinho = getCharacter(state, 'padrinho');
  if (!padrinho) return 1;
  const { padrinhoFriendly, padrinhoHostile, padrinhoInfluenceBonus } = CAREER.cast;
  if (padrinho.relation >= padrinhoFriendly) return 1 + padrinhoInfluenceBonus;
  return padrinho.relation <= padrinhoHostile ? 1 - padrinhoInfluenceBonus : 1;
};

/** Troca de partido: padrinho e rival ficam para trás (e não gostam). */
export const leaveCastBehind = (state: CareerState, text: string): CareerState => ({
  ...state,
  cast: (state.cast ?? []).map((character) =>
    character.active && character.role !== 'adversario' && character.partyId === state.partyId
      ? remember({ ...character, active: false, relation: clamp(character.relation + CAREER.cast.switchRelationCost, -PERCENT, PERCENT) }, state.turn, text, CAREER.cast.switchRelationCost)
      : character,
  ),
});

/** Tira um personagem de cena (o substituto entra no próximo `ensureCareerCast`). */
export const retireCharacter = (state: CareerState, role: CareerCharacterRole): CareerState => {
  const character = getCharacter(state, role);
  return character ? updateCharacter(state, character.id, (current) => ({ ...current, active: false })) : state;
};

// ─── Semestre ─────────────────────────────────────────────────────────────

/**
 * A cada semestre: a memória esfria (relação volta um pouco ao neutro), quem tem mandato
 * ganha força, mandatos vencidos acabam e os mais velhos podem se aposentar.
 */
export const stepCareerCast = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  if (!state.cast || state.cast.length === 0) return { state, news: [] };
  const rng = createRng(state.seed);
  const rules = CAREER.cast;
  const news: CareerNews[] = [];
  const cast = state.cast.map((character) => {
    if (!character.active) return character;
    const officeOver = character.officeEndTurn !== null && state.turn > character.officeEndTurn;
    const officeId = officeOver ? null : character.officeId;
    const strength = clamp(character.strength + (officeId ? rules.strengthInOffice : rules.strengthOutOfOffice), rules.minStrength, rules.maxStrength);
    const retires = characterAge(character, state.turn) >= rules.retirementAge && rng.next() < rules.retirementChance;
    if (retires) news.push(createCareerNews(state.turn, `${character.name} anuncia que vai deixar a vida pública`, 'neutral', `aposentadoria-${character.id}`));
    return {
      ...character,
      relation: character.relation * (1 - rules.relationDecay),
      strength,
      officeId,
      officeEndTurn: officeOver ? null : character.officeEndTurn,
      active: !retires,
    };
  });
  return { state: ensureCareerCast({ ...state, cast, seed: rng.getSeed() }, content), news };
};

// ─── Eleições ─────────────────────────────────────────────────────────────

const characterCanRun = (state: CareerState, content: CareerContent, character: CareerCharacter, office: CareerOffice, turn: number): boolean => {
  const ageYear = getCareerDate(turn).year + (office.ageCheck === 'posse' ? 1 : 0);
  if (ageYear - character.birthYear < office.minAge) return false;
  if (office.level === 'municipal' && !hasMunicipalElections(state, content)) return false;
  // Mandato que continua depois desta eleição: só arrisca um cargo maior.
  const current = character.officeId ? findOffice(content, character.officeId) : undefined;
  const continuing = current && character.officeEndTurn !== null && character.officeEndTurn > turn;
  return !continuing || office.rank > current.rank;
};

/**
 * Cargo que o personagem disputa na eleição deste semestre: o de maior hierarquia cuja
 * dificuldade não passe da força dele + margem (vices e Presidência ficam de fora).
 */
export const characterTarget = (
  state: CareerState,
  content: CareerContent,
  character: CareerCharacter,
  difficultyOf: (office: CareerOffice) => number,
): CareerOffice | undefined => {
  const cycle = getElectionAt(state.turn);
  if (cycle === null || !character.active) return undefined;
  return content.offices
    .filter((office) => office.cycle === cycle && !office.headOffice && office.id !== 'presidente')
    .filter((office) => characterCanRun(state, content, character, office, state.turn))
    .filter((office) => difficultyOf(office) <= character.strength + CAREER.cast.targetMargin)
    .sort((a, b) => b.rank - a.rank)[0];
};

/** Chance de um personagem vencer a eleição dele (mesma curva logística do jogador). */
export const characterChance = (character: CareerCharacter, difficulty: number): number =>
  1 / (1 + Math.exp(-(character.strength - difficulty) / CAREER.cast.electionSpread));

/** Resultado da eleição de um personagem: mandato novo e força. */
export const settleCharacterElection = (
  state: CareerState,
  content: CareerContent,
  character: CareerCharacter,
  office: CareerOffice,
  won: boolean,
): { state: CareerState; news: CareerNews | null } => {
  const party = findParty(content, character.partyId)?.acronym ?? '';
  const title = office.titles[character.sex];
  const next = updateCharacter(state, character.id, (current) => ({
    ...current,
    strength: clamp(current.strength + (won ? CAREER.cast.winStrength : CAREER.cast.lossStrength), CAREER.cast.minStrength, CAREER.cast.maxStrength),
    officeId: won ? office.id : current.officeId,
    officeEndTurn: won ? state.turn + office.termYears * 2 : current.officeEndTurn,
  }));
  const text = won ? `${shortName(character.name)} (${party}) se elege ${title}` : `${shortName(character.name)} (${party}) perde a disputa para ${title}`;
  return { state: next, news: createCareerNews(state.turn, text, 'neutral', `elenco-${character.id}`) };
};
