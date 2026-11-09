/**
 * Candidaturas: requisitos (idade, filiação, legenda, Ficha Limpa, reeleição)
 * e a chance de vitória, com o "porquê" em pontos de força eleitoral.
 */
import { CAREER } from '@/constants/balance';
import { AFFILIATION_MIN_SEMESTERS, BALLOT_DIGITS, CAREER_METRIC_INFO, PARTY_NUMBER_DIGITS } from '@/constants/career';
import type {
  CandidacyCheck,
  CandidacyFactor,
  CandidacyOption,
  CareerCharacter,
  CareerContent,
  CareerMetricKey,
  CareerOffice,
  CareerPerson,
  CareerState,
  FaceSex,
  Party,
} from '@/types';
import { formatCareerTurn, getCareerDate, getElectionAt } from '@/utils/careerCalendar';
import { clamp } from '@/utils/math';
import { deriveSeed, generateName } from '../cast';
import { createRng } from '../random';
import { characterTarget } from './characters';
import { arePartiesAllied, findCity, findOffice, findParty, getCharacter, hasMunicipalElections, referenceSeats, shortName } from './helpers';
import { hasRunoff } from './rounds';
import { electorateFit, electorateLean } from './world';

/** Turnos em que a legenda garantida por um convite de troca de partido vale. */
const GUARANTEED_NOMINATION_TURNS = 3;
const FEMALE_SHARE = 0.5;
const THOUSAND = 1000;
const DECIMAL_BASE = 10;

/** Cargos em disputa no semestre (vazio fora de eleição). No DF não há eleição municipal. */
export const getElectionOffices = (state: CareerState, content: CareerContent): CareerOffice[] => {
  const cycle = getElectionAt(state.turn);
  if (cycle === null) return [];
  return content.offices.filter((office) => office.cycle === cycle && (office.level !== 'municipal' || hasMunicipalElections(state, content)));
};

/** Chance de vitória (logística) para uma força e uma dificuldade. */
export const chanceFor = (strength: number, difficulty: number): number => {
  const { spread, minChance, maxChance } = CAREER.election;
  return clamp(1 / (1 + Math.exp(-(strength - difficulty) / spread)), minChance, maxChance);
};

// ─── Requisitos ───────────────────────────────────────────────────────────

const check = (label: string, ok: boolean, detail: string): CandidacyCheck => ({ label, ok, detail: ok ? null : detail });

const ageCheck = (state: CareerState, office: CareerOffice): CandidacyCheck => {
  const { year } = getCareerDate(state.turn);
  // Vereador: idade no registro (ano da eleição); demais: na posse (ano seguinte).
  const checkYear = office.ageCheck === 'registro' ? year : year + 1;
  const age = checkYear - state.profile.birthYear;
  const moment = office.ageCheck === 'registro' ? 'no registro' : 'na posse';
  return check(`Idade mínima: ${office.minAge} anos`, age >= office.minAge, `Você terá ${age} anos ${moment}.`);
};

const affiliationCheck = (state: CareerState): CandidacyCheck =>
  check(
    'Filiação 6 meses antes',
    state.partyJoinedTurn !== null && state.turn - state.partyJoinedTurn >= AFFILIATION_MIN_SEMESTERS,
    'Filiou-se (ou trocou de partido) há menos de 6 meses.',
  );

export const hasGuaranteedNomination = (state: CareerState): boolean => {
  const at = state.flags['legenda-garantida'];
  return at !== undefined && state.turn - at <= GUARANTEED_NOMINATION_TURNS;
};

const nominationCheck = (state: CareerState, office: CareerOffice): CandidacyCheck => {
  const influence = Math.round(state.metrics.partyInfluence);
  const label = office.headOffice ? `Convite para a chapa (influência ${office.nominationInfluence})` : `Legenda do partido (influência ${office.nominationInfluence})`;
  const ok = influence >= office.nominationInfluence || (!office.headOffice && hasGuaranteedNomination(state));
  return check(label, ok, `Sua influência no partido é ${influence}.`);
};

const eligibilityCheck = (state: CareerState): CandidacyCheck =>
  check(
    'Ficha limpa',
    state.ineligibleUntil === null || state.ineligibleUntil < state.turn,
    `Inelegível até o ${formatCareerTurn(state.ineligibleUntil ?? state.turn)}.`,
  );

/** Reeleição além do limite e mandato que ainda não terminou. */
const mandateCheck = (state: CareerState, office: CareerOffice): CandidacyCheck | null => {
  const { position } = state;
  if (position?.kind !== 'office' || position.id !== office.id) return null;
  if (position.endTurn !== null && position.endTurn > state.turn) return check('Mandato em curso', false, 'Seu mandato neste cargo ainda não terminou.');
  const limit = office.maxConsecutiveTerms;
  return check('Limite de reeleição', limit === null || position.consecutiveTerms < limit, 'Já está no segundo mandato seguido.');
};

const buildChecks = (state: CareerState, office: CareerOffice): CandidacyCheck[] => [
  ageCheck(state, office),
  affiliationCheck(state),
  nominationCheck(state, office),
  eligibilityCheck(state),
  ...[mandateCheck(state, office)].filter((entry): entry is CandidacyCheck => entry !== null),
];

/** Quem tem outro cargo se licencia dele na campanha e volta a ele se perder. */
export const takesLeaveFor = (state: CareerState, office: CareerOffice): boolean => {
  const { position } = state;
  return position !== null && !(position.kind === 'office' && position.id === office.id);
};

// ─── Força eleitoral ──────────────────────────────────────────────────────

const metricFactors = (state: CareerState, office: CareerOffice, scale: number): CandidacyFactor[] =>
  (Object.entries(office.weights) as Array<[CareerMetricKey, number]>).map(([key, weight]) => ({
    key,
    label: CAREER_METRIC_INFO[key].label,
    points: weight * state.metrics[key] * scale,
  }));

/** Bancada acima da média: votos de legenda, tempo de TV e fundo eleitoral. */
const partySizeFactor = (content: CareerContent, party: Party | undefined, office: CareerOffice): CandidacyFactor => {
  const { partySizeProportional, partySizeMajoritarian, partySizeCap } = CAREER.election;
  const relative = party ? clamp(party.seats / referenceSeats(content) - 1, -1, partySizeCap) : -1;
  const weight = office.system === 'proporcional' ? partySizeProportional : partySizeMajoritarian;
  return { key: 'partido', label: party ? `Tamanho do ${party.acronym}` : 'Sem partido', points: relative * weight };
};

const fitFactor = (state: CareerState, content: CareerContent, office: CareerOffice): CandidacyFactor => {
  const fit = electorateFit(state.profile, electorateLean(state, content, office.level));
  return { key: 'eleitorado', label: 'Afinidade com o eleitorado', points: (fit * 2 - 1) * CAREER.election.electorateFitPoints };
};

/** Reeleição: parlamentar tem bônus fixo; chefe do Executivo depende da aprovação da gestão. */
const incumbencyFactor = (state: CareerState, office: CareerOffice): CandidacyFactor | null => {
  if (state.position?.kind !== 'office' || state.position.id !== office.id) return null;
  const { incumbentLegislative, incumbentExecutiveBase, incumbentApprovalWeight } = CAREER.election;
  if (office.branch === 'legislativo') return { key: 'reeleicao', label: 'Reeleição (mandato atual)', points: incumbentLegislative };
  const approval = state.administration?.approval ?? 50;
  return { key: 'gestao', label: `Aprovação da gestão (${Math.round(approval)}%)`, points: incumbentExecutiveBase + (approval - 50) * incumbentApprovalWeight };
};

/** Rejeição: com a reputação no chão, parte do eleitorado não vota "de jeito nenhum". */
const rejectionFactor = (state: CareerState): CandidacyFactor | null => {
  const { threshold, perPoint } = CAREER.election.rejection;
  const gap = threshold - state.metrics.reputation;
  return gap > 0 ? { key: 'rejeicao', label: 'Rejeição (reputação baixa)', points: -gap * perPoint } : null;
};

const governingFactor = (state: CareerState, office: CareerOffice, incumbent: boolean): CandidacyFactor | null =>
  office.branch === 'executivo' && !incumbent && state.partyId !== null && state.governments[office.level].partyId === state.partyId
    ? { key: 'governo', label: 'Seu partido governa', points: CAREER.election.governingPartyBonus }
    : null;

/** Dificuldade do cargo: base, nível de jogo e tamanho da cidade (prefeitura). */
export const officeDifficulty = (state: CareerState, content: CareerContent, office: CareerOffice): number => {
  const { difficultyOffset, cityDifficultyPerLog, cityDifficultyReferenceLog } = CAREER.election;
  const base = office.difficulty + difficultyOffset[state.difficulty];
  if (office.level !== 'municipal' || office.branch !== 'executivo') return base;
  const thousandVoters = (findCity(content, state.profile.baseCityId)?.voters ?? THOUSAND) / THOUSAND;
  return base + (Math.log10(Math.max(1, thousandVoters)) - cityDifficultyReferenceLog) * cityDifficultyPerLog;
};

const scaled = (factor: CandidacyFactor, scale: number): CandidacyFactor => ({ ...factor, points: factor.points * scale });

/** Força do jogador para um cargo (sem estratégia de campanha), com os fatores. `scale` < 1 na chapa de vice. */
const playerStrength = (state: CareerState, content: CareerContent, office: CareerOffice, scale: number): CandidacyFactor[] => {
  const incumbency = incumbencyFactor(state, office);
  const extras = [incumbency, governingFactor(state, office, incumbency !== null), rejectionFactor(state)].filter(
    (entry): entry is CandidacyFactor => entry !== null,
  );
  return [
    ...metricFactors(state, office, scale),
    scaled(partySizeFactor(content, findParty(content, state.partyId), office), scale),
    scaled(fitFactor(state, content, office), scale),
    ...extras,
  ];
};

/** Cabeça de chapa (fictício) do maior partido entre o seu e os aliados; estável no semestre. */
export const runningMateFor = (state: CareerState, content: CareerContent, office: CareerOffice): CareerPerson & { strength: number } => {
  const rng = createRng(deriveSeed(state.profile.portraitSeed, `chapa:${office.id}:${state.turn}`));
  const allies = content.parties.filter((party) => arePartiesAllied(content, state.partyId, party.id));
  const party = [...allies].sort((a, b) => b.seats - a.seats)[0] ?? findParty(content, state.partyId) ?? content.parties[0];
  const sex: FaceSex = rng.next() < FEMALE_SHARE ? 'f' : 'm';
  const name = generateName(rng, content.names, sex);
  const noise = (rng.next() * 2 - 1) * CAREER.election.headStrengthNoise;
  const head = office.headOffice ? findOffice(content, office.headOffice) : undefined;
  return { name, partyId: party.id, sex, strength: officeDifficulty(state, content, head ?? office) + noise };
};

/**
 * Número na urna: o do partido (o do cabeça de chapa, nos vices) mais os dígitos do candidato,
 * estáveis na carreira (sorteados pela semente do rosto). Null se o partido não tem número.
 */
export const ballotNumber = (state: CareerState, content: CareerContent, office: CareerOffice, ticketPartyId: string | null = null): string | null => {
  const partyNumber = findParty(content, ticketPartyId ?? state.partyId)?.number;
  if (partyNumber === undefined) return null;
  const extraDigits = (BALLOT_DIGITS[office.id] ?? PARTY_NUMBER_DIGITS) - PARTY_NUMBER_DIGITS;
  const rng = createRng(deriveSeed(state.profile.portraitSeed, `urna:${office.id}`));
  const suffix = Array.from({ length: extraDigits }, (_, index) => Math.floor(rng.next() * (index === 0 ? DECIMAL_BASE - 1 : DECIMAL_BASE)) + (index === 0 ? 1 : 0));
  return `${partyNumber}${suffix.join('')}`;
};

const isHeadMajoritarian = (office: CareerOffice): boolean => office.system === 'majoritario' && !office.headOffice;

const asPerson = (character: CareerCharacter): CareerPerson => ({ name: character.name, partyId: character.partyId, sex: character.sex });

const targetsOffice = (state: CareerState, content: CareerContent, character: CareerCharacter | undefined, office: CareerOffice): boolean =>
  character !== undefined && characterTarget(state, content, character, (entry) => officeDifficulty(state, content, entry))?.id === office.id;

/**
 * Prévia: o rival do partido quer o mesmo cargo (quem já ocupa o cargo tem a legenda; uma
 * trégua recente também evita a disputa). Chance pela influência, pelo padrinho e pela relação.
 */
export const primaryFor = (state: CareerState, content: CareerContent, office: CareerOffice): { rival: CareerCharacter; chance: number } | null => {
  if (!isHeadMajoritarian(office) || (state.position?.kind === 'office' && state.position.id === office.id)) return null;
  const truce = state.flags['tregua-rival'];
  if (truce !== undefined && state.turn - truce <= CAREER.cast.truceTurns) return null;
  const rival = getCharacter(state, 'rival');
  if (!rival || !targetsOffice(state, content, rival, office)) return null;
  const { primarySpread, rivalRelationWeight, padrinhoPrimaryWeight, primaryMinChance, primaryMaxChance } = CAREER.cast;
  const padrinho = getCharacter(state, 'padrinho')?.relation ?? 0;
  const points = state.metrics.partyInfluence + padrinho * padrinhoPrimaryWeight + rival.relation * rivalRelationWeight - rival.strength;
  return { rival, chance: clamp(1 / (1 + Math.exp(-points / primarySpread)), primaryMinChance, primaryMaxChance) };
};

/** Adversário recorrente que mira o mesmo cargo: vira o seu oponente na urna. */
export const adversaryFor = (state: CareerState, content: CareerContent, office: CareerOffice): CareerCharacter | null => {
  const adversary = getCharacter(state, 'adversario');
  return isHeadMajoritarian(office) && adversary && targetsOffice(state, content, adversary, office) ? adversary : null;
};

/** Adversário forte tira pontos de força; fraco, dá. */
const adversaryFactor = (adversary: CareerCharacter | null): CandidacyFactor | null => {
  if (!adversary) return null;
  const { adversaryReference, adversaryWeight } = CAREER.cast;
  return { key: 'adversario', label: `Adversário: ${shortName(adversary.name)} (força ${Math.round(adversary.strength)})`, points: -(adversary.strength - adversaryReference) * adversaryWeight };
};

/** Avalia uma candidatura: requisitos, força, dificuldade e chance. */
export const evaluateCandidacy = (state: CareerState, content: CareerContent, office: CareerOffice): CandidacyOption => {
  const checks = buildChecks(state, office);
  const head = office.headOffice ? findOffice(content, office.headOffice) : undefined;
  const mate = head ? runningMateFor(state, content, office) : null;
  const weight = CAREER.election.runningMateWeight;
  // Vice: a chapa soma o titular (fictício) e uma fração da força do jogador.
  const factors: CandidacyFactor[] = mate
    ? [{ key: 'titular', label: `Força de ${mate.name}`, points: (1 - weight) * mate.strength }, ...playerStrength(state, content, office, weight)]
    : playerStrength(state, content, office, 1);
  const adversary = adversaryFor(state, content, office);
  const primary = primaryFor(state, content, office);
  const opposed = [...factors, ...[adversaryFactor(adversary)].filter((entry): entry is CandidacyFactor => entry !== null)];
  const strength = opposed.reduce((acc, factor) => acc + factor.points, 0);
  const difficulty = officeDifficulty(state, content, head ?? office);
  return {
    officeId: office.id,
    eligible: checks.every((entry) => entry.ok),
    checks,
    chance: chanceFor(strength, difficulty),
    strength,
    difficulty,
    factors: opposed,
    takesLeave: takesLeaveFor(state, office),
    ballotNumber: ballotNumber(state, content, office, mate?.partyId ?? null),
    runningMate: mate ? { name: mate.name, partyId: mate.partyId, sex: mate.sex } : null,
    primary: primary ? { rival: asPerson(primary.rival), chance: primary.chance } : null,
    adversary: adversary ? asPerson(adversary) : null,
    runoffPossible: hasRunoff(state, content, office),
  };
};

/** Todas as candidaturas do semestre de eleição. */
export const listCandidacies = (state: CareerState, content: CareerContent): CandidacyOption[] =>
  getElectionOffices(state, content).map((office) => evaluateCandidacy(state, content, office));
