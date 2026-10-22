/**
 * Elenco político: ministros (sempre fictícios), líder da oposição e governadores.
 * Ministros técnicos entregam mais na pasta; políticos trazem votos do partido e
 * aumentam o risco de escândalo. Tudo determinístico pela semente do elenco.
 */
import { CABINET, POLITICAL_MINISTRIES } from '@/constants/balance';
import { MINISTRY_INFO } from '@/constants/game';
import type {
  BrazilianState,
  ElectionResult,
  FaceSex,
  Governor,
  Minister,
  MinisterProfile,
  MinistryId,
  NamePool,
  OppositionLeader,
  Party,
  PlayerCandidate,
  PoliticalCast,
  Rng,
  SimulationState,
  StateWithNews,
} from '@/types';
import { applyImpact } from './impacts';
import { createNewsItem } from './news';
import { createRng } from './random';

const MINISTRIES = Object.keys(MINISTRY_INFO) as MinistryId[];
const HISTORY_PREFIX = 'ministro:';
const SEED_MODULUS = 2 ** 31 - 1;
const HASH_MULTIPLIER = 31;

/** Semente derivada de uma base e de uma chave de texto (hash simples, estável). */
export const deriveSeed = (base: number, key: string): number =>
  [...key].reduce((acc, char) => (acc * HASH_MULTIPLIER + char.charCodeAt(0)) % SEED_MODULUS, base % SEED_MODULUS) || 1;

const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng.next() * items.length)];

/** Nome fictício: prenome + dois sobrenomes distintos. */
export const generateName = (rng: Rng, pool: NamePool, sex: FaceSex): string => {
  const first = pick(rng, sex === 'f' ? pool.femaleFirst : pool.maleFirst);
  const middle = pick(rng, pool.surnames);
  const last = pick(rng, pool.surnames.filter((name) => name !== middle));
  return `${first} ${middle} ${last}`;
};

const ideologyDistance = (party: Party, economic: number, social: number): number =>
  Math.hypot(party.economicIdeology - economic, party.socialIdeology - social);

/** Partidos que dividem as pastas políticas: o do presidente e os mais próximos no espectro. */
export const alliedParties = (parties: readonly Party[], candidate: Pick<PlayerCandidate, 'partyId' | 'economicIdeology' | 'socialIdeology'>): Party[] => {
  const own = parties.find((party) => party.id === candidate.partyId);
  const others = parties
    .filter((party) => party.id !== candidate.partyId && party.seats > 0)
    .sort((a, b) => ideologyDistance(a, candidate.economicIdeology, candidate.socialIdeology) - ideologyDistance(b, candidate.economicIdeology, candidate.socialIdeology));
  return [...(own ? [own] : []), ...others].slice(0, CABINET.alliedParties);
};

interface MinisterSpec {
  ministry: MinistryId;
  profile: MinisterProfile;
  partyId: string | null;
  turn: number;
}

const createMinister = (rng: Rng, pool: NamePool, spec: MinisterSpec): Minister => {
  const sex: FaceSex = rng.next() < 0.5 ? 'f' : 'm';
  return {
    ministry: spec.ministry,
    name: generateName(rng, pool, sex),
    sex,
    profile: spec.profile,
    partyId: spec.partyId,
    portraitSeed: Math.floor(rng.next() * SEED_MODULUS) + 1,
    since: spec.turn,
  };
};

/** Gabinete inicial: pastas técnicas e políticas (divididas entre os partidos aliados). */
const createCabinet = (rng: Rng, pool: NamePool, allies: readonly Party[], turn: number): Minister[] => {
  let politicalIndex = 0;
  return MINISTRIES.map((ministry) => {
    const political = (POLITICAL_MINISTRIES as readonly string[]).includes(ministry) && allies.length > 0;
    const partyId = political ? allies[politicalIndex++ % allies.length].id : null;
    return createMinister(rng, pool, { ministry, profile: political ? 'politico' : 'tecnico', partyId, turn });
  });
};

/** O adversário derrotado vira o líder da oposição. */
const createOpposition = (election: ElectionResult, real: boolean): OppositionLeader | null =>
  election.opponentPartyId
    ? { name: election.opponentName, partyId: election.opponentPartyId, candidateId: election.opponentId ?? null, real }
    : null;

/** Elenco da posse: gabinete e oposição. `opponentIsReal` = o adversário é uma pessoa real. */
export const createCast = (
  seed: number,
  candidate: PlayerCandidate,
  election: ElectionResult,
  parties: readonly Party[],
  pool: NamePool,
  opponentIsReal: boolean,
  turn: number,
): PoliticalCast => {
  const castSeed = deriveSeed(seed, `elenco:${candidate.name}`);
  const rng = createRng(castSeed);
  return {
    seed: castSeed,
    cabinet: createCabinet(rng, pool, alliedParties(parties, candidate), turn),
    opposition: createOpposition(election, opponentIsReal),
  };
};

// ─── Efeitos do gabinete ──────────────────────────────────────────────────

export const getMinister = (cast: PoliticalCast, ministry: MinistryId): Minister | undefined =>
  cast.cabinet.find((minister) => minister.ministry === ministry);

const politicalCount = (cast: PoliticalCast): number => cast.cabinet.filter((minister) => minister.profile === 'politico').length;

/** Multiplicador dos ganhos de decisões e programas da pasta (ministro técnico entrega mais). */
export const ministryGainMultiplier = (state: SimulationState, ministry: MinistryId | undefined): number =>
  ministry && getMinister(state.cast, ministry)?.profile === 'tecnico' ? 1 + CABINET.technicalBonus : 1;

/** Deslocamento da base aliada de equilíbrio pelos ministros políticos além da composição padrão. */
export const cabinetSupportShift = (state: SimulationState): number =>
  state.cast.cabinet.length === 0 ? 0 : CABINET.politicalSupport * (politicalCount(state.cast) - CABINET.baselinePolitical);

/** Multiplicador do peso de escândalos políticos: mais políticos no gabinete, mais exposição. */
export const cabinetScandalMultiplier = (state: SimulationState): number =>
  state.cast.cabinet.length === 0 ? 1 : Math.max(0, 1 + CABINET.scandalPerPolitical * (politicalCount(state.cast) - CABINET.baselinePolitical));

/** Meses até poder trocar o ministro da pasta (0 = livre). */
export const getMinisterCooldownLeft = (state: SimulationState, ministry: MinistryId): number => {
  const last = state.decisionHistory[`${HISTORY_PREFIX}${ministry}`];
  return last === undefined ? 0 : Math.max(0, CABINET.replaceCooldown - (state.turn - last));
};

/**
 * Troca o ministro da pasta por alguém do perfil escolhido (técnico ou de um partido
 * aliado). Custa um pouco de aprovação e abre um intervalo até a próxima troca na pasta.
 */
export const replaceMinister = (
  state: SimulationState,
  ministry: MinistryId,
  profile: MinisterProfile,
  partyId: string | null,
  pool: NamePool,
): StateWithNews => {
  const current = getMinister(state.cast, ministry);
  if (!current || getMinisterCooldownLeft(state, ministry) > 0) return { state, news: [] };
  const rng = createRng(deriveSeed(state.cast.seed, `${ministry}:${state.turn}`));
  const next = createMinister(rng, pool, { ministry, profile, partyId: profile === 'politico' ? partyId : null, turn: state.turn });
  const cabinet = state.cast.cabinet.map((minister) => (minister.ministry === ministry ? next : minister));
  const paid = applyImpact({ ...state, cast: { ...state.cast, cabinet } }, { approval: CABINET.replaceApprovalCost });
  const replaced: SimulationState = { ...paid, decisionHistory: { ...paid.decisionHistory, [`${HISTORY_PREFIX}${ministry}`]: state.turn } };
  const pasta = MINISTRY_INFO[ministry].shortName;
  const headline = `${current.name} deixa ${pasta}; ${next.name} assume a pasta`;
  return { state: replaced, news: [createNewsItem(state.turn, headline, 'neutral', 'politics', `ministro:${ministry}`)] };
};

/** Escândalo político: a oposição pede a cabeça de um ministro político (sempre fictício). */
export const scandalTargetNews = (state: SimulationState, rng: Rng): StateWithNews['news'] => {
  const political = state.cast.cabinet.filter((minister) => minister.profile === 'politico');
  if (political.length === 0) return [];
  const target = pick(rng, political);
  const headline = `Oposição pede a saída de ${target.name}, da pasta de ${MINISTRY_INFO[target.ministry].shortName}`;
  return [createNewsItem(state.turn, headline, 'negative', 'politics', `escandalo-ministro:${target.ministry}`)];
};

// ─── Governadores ─────────────────────────────────────────────────────────

/** Partido do governador: o mais próximo do eleitorado do estado, com uma pitada de acaso. */
const governorParty = (rng: Rng, uf: BrazilianState, parties: readonly Party[]): Party => {
  const ranked = parties
    .filter((party) => party.seats > 0)
    .map((party) => ({ party, score: ideologyDistance(party, uf.lean.economic, uf.lean.social) - Math.sqrt(party.seats) * 2 }))
    .sort((a, b) => a.score - b.score);
  return pick(rng, ranked.slice(0, 3)).party;
};

/** Governadores fictícios de cada estado e a relação com o governo federal. */
export const getGovernors = (
  state: SimulationState,
  states: readonly BrazilianState[],
  parties: readonly Party[],
  pool: NamePool,
  playerPartyId: string | null,
): Governor[] =>
  states.map((uf) => {
    const rng = createRng(deriveSeed(state.cast.seed, `governador:${uf.id}`));
    const sex: FaceSex = rng.next() < 0.3 ? 'f' : 'm';
    const name = generateName(rng, pool, sex);
    const party = governorParty(rng, uf, parties);
    const distance = ideologyDistance(party, state.metrics.ideologyEconomic, state.metrics.ideologySocial);
    const stance: Governor['stance'] =
      party.id === playerPartyId || distance < CABINET.governorAllyDistance
        ? 'aliado'
        : distance > CABINET.governorOppositionDistance
          ? 'oposicao'
          : 'neutro';
    return { stateId: uf.id, name, sex, partyId: party.id, stance, portraitSeed: Math.floor(rng.next() * SEED_MODULUS) + 1 };
  });
