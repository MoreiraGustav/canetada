/**
 * Herdeiro(a) político(a): quem se aposenta passa o bastão. O(a) herdeiro(a) começa no
 * semestre seguinte, na mesma cidade e no mesmo partido, com parte do capital político
 * (o filho herda o nome; o afilhado, a rede no partido). Quem passou o bastão vira o
 * padrinho, e o adversário da família continua de olho.
 */
import { CAREER } from '@/constants/balance';
import { CAREER_METRIC_KEYS } from '@/constants/career';
import type { CareerCharacter, CareerContent, CareerDynasty, CareerLegacy, CareerMetrics, CareerState, DynastyMember, HeirBond, HeirInput } from '@/types';
import { getCareerDate } from '@/utils/careerCalendar';
import { clamp } from '@/utils/math';
import { ensureCareerCast, getCharacter } from './characters';
import { findOffice, findParty } from './helpers';
import { createCareer } from './setup';

const METRIC_MAX = 100;
/** O(a) herdeiro(a) já era filiado(a): pode disputar a eleição do mesmo ano. */
const INHERITED_AFFILIATION = 2;

/** Semestre em que a carreira do(a) herdeiro(a) começa. */
export const heirStartTurn = (parent: CareerState): number => parent.turn + 1;

/** Indicadores iniciais: base + profissão (já em `base`) + a parte herdada, com teto. */
export const heirMetrics = (parent: CareerState, base: CareerMetrics, bond: HeirBond): CareerMetrics => {
  const { inheritance, reputationInheritance, maxStart } = CAREER.heir;
  const shares = inheritance[bond];
  const inherited = Object.fromEntries(
    CAREER_METRIC_KEYS.map((key) => {
      if (key === 'reputation') return [key, clamp(base.reputation + (parent.metrics.reputation - base.reputation) * reputationInheritance[bond], 0, METRIC_MAX)];
      const share = (shares as Partial<Record<typeof key, number>>)[key] ?? 0;
      return [key, Math.max(base[key], Math.min(maxStart, base[key] + parent.metrics[key] * share))];
    }),
  );
  return inherited as CareerMetrics;
};

const parentMember = (parent: CareerState, legacy: CareerLegacy): DynastyMember => ({
  name: parent.profile.name,
  politicalName: parent.profile.politicalName,
  sex: parent.profile.sex,
  portraitSeed: parent.profile.portraitSeed,
  birthYear: parent.profile.birthYear,
  highestOfficeId: legacy.highestOfficeId,
  legacyTitle: legacy.title,
  legacyScore: legacy.score,
  fromTurn: parent.timeline[0]?.turn ?? 1,
  toTurn: parent.turn,
});

export const nextDynasty = (parent: CareerState, legacy: CareerLegacy, bond: HeirBond): CareerDynasty => ({
  generation: (parent.dynasty?.generation ?? 1) + 1,
  ancestors: [...(parent.dynasty?.ancestors ?? []), parentMember(parent, legacy)],
  bond,
});

/** Quem passou o bastão vira o padrinho: aconselha, abre portas e não disputa mais eleições. */
const parentAsPadrinho = (parent: CareerState, content: CareerContent, legacy: CareerLegacy, bond: HeirBond, turn: number): CareerCharacter => {
  const rules = CAREER.heir;
  const rank = legacy.highestOfficeId ? findOffice(content, legacy.highestOfficeId)?.rank ?? 0 : 0;
  const relation = rules.relation[bond];
  const office = parent.position?.kind === 'office' ? parent.position : null;
  return {
    id: `padrinho-heranca-${turn}`,
    role: 'padrinho',
    name: parent.profile.politicalName,
    sex: parent.profile.sex,
    portraitSeed: parent.profile.portraitSeed,
    partyId: parent.partyId ?? content.parties[0].id,
    birthYear: parent.profile.birthYear,
    relation,
    strength: clamp(rules.parentStrengthBase + rank * rules.parentStrengthPerRank, CAREER.cast.minStrength, CAREER.cast.maxStrength),
    officeId: office ? (office.id as CareerCharacter['officeId']) : null,
    officeEndTurn: office?.endTurn ?? null,
    memory: [{ turn, text: bond === 'filho' ? 'Passou o bastão para a família' : 'Escolheu você como herdeiro(a) político(a)', delta: relation }],
    active: true,
    retiredFromPolitics: true,
  };
};

/** O adversário da família segue em cena, com parte da hostilidade. */
const inheritedAdversary = (parent: CareerState, turn: number): CareerCharacter | null => {
  const adversary = getCharacter(parent, 'adversario');
  if (!adversary) return null;
  const relation = adversary.relation * CAREER.heir.adversaryRelationKept;
  return { ...adversary, relation, memory: [...adversary.memory, { turn, text: `Rival de ${parent.profile.politicalName}`, delta: relation }].slice(-CAREER.cast.memorySize) };
};

const bondLabel = (input: HeirInput): string => {
  if (input.bond === 'filho') return input.sex === 'f' ? 'filha' : 'filho';
  return input.sex === 'f' ? 'afilhada política' : 'afilhado político';
};

/** Carreira nova do(a) herdeiro(a), a partir de quem se aposenta. */
export const createHeirCareer = (parent: CareerState, content: CareerContent, input: HeirInput, legacy: CareerLegacy, seed: number): CareerState => {
  const turn = heirStartTurn(parent);
  const base = createCareer(
    { ...input, baseCityId: parent.profile.baseCityId, difficulty: parent.difficulty, presidencyMode: parent.presidencyMode, world: parent.world },
    content,
    seed,
  );
  const name = base.profile.politicalName;
  const party = findParty(content, parent.partyId)?.acronym ?? 'partido';
  const governments = Object.fromEntries(Object.entries(parent.governments).map(([level, government]) => [level, { ...government, isPlayer: false }])) as CareerState['governments'];
  const adversary = inheritedAdversary(parent, turn);
  const heir: CareerState = {
    ...base,
    profile: { ...base.profile, birthYear: getCareerDate(turn).year - input.startingAge },
    turn,
    partyId: parent.partyId,
    partyJoinedTurn: turn - INHERITED_AFFILIATION,
    metrics: heirMetrics(parent, base.metrics, input.bond),
    governments,
    cast: [parentAsPadrinho(parent, content, legacy, input.bond, turn), ...(adversary ? [adversary] : [])],
    dynasty: nextDynasty(parent, legacy, input.bond),
    timeline: [
      { turn, kind: 'heranca', text: `${name}, ${bondLabel(input)} de ${parent.profile.politicalName}, entra para a política aos ${input.startingAge} anos` },
      { turn, kind: 'filiacao', text: `${name} herda a legenda da família no ${party}` },
    ],
  };
  return ensureCareerCast(heir, content);
};
