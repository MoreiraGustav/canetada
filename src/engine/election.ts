/**
 * Eleição e campanha (GDD §2.4): candidato efetivo, perguntas, resultado
 * (o jogador sempre vence; a margem define o capital político), estado
 * inicial do governo e reeleição.
 */
import { DEFAULT_MODIFIERS, ELECTION, IDEOLOGY_AFFINITY } from '@/constants/balance';
import { CAMPAIGN_QUESTION_COUNT, GAME_MODES } from '@/constants/game';
import { INITIAL_CONGRESS_SUPPORT, INITIAL_METRICS } from '@/constants/metrics';
import { INITIAL_SECTOR_APPROVAL, SECTOR_KEYS } from '@/constants/sectors';
import type {
  CampaignOption,
  CampaignQuestion,
  CampaignQuestionSelection,
  Candidate,
  CandidateSelection,
  CongressState,
  CustomCandidateInput,
  ElectionResult,
  GameContent,
  GameStats,
  ModifierSet,
  NewGameParams,
  PlayerCandidate,
  ReelectionResult,
  Relations,
  SectorAffinity,
  SectorApproval,
  SectorKey,
  SimulationState,
} from '@/types';
import { clamp } from '@/utils/math';
import { calculateApproval } from './approval';
import { getDifficultyConfig } from './difficulty';
import { createGoalProgress } from './goals';
import { applyImpact } from './impacts';
import { createPromises } from './promises';
import { createRng, randomBetween, shuffle } from './random';

const MULTIPLICATIVE_MODIFIERS: ReadonlyArray<keyof ModifierSet> = [
  'negotiationCostMultiplier',
  'approvalDecayMultiplier',
  'scandalWeightMultiplier',
  'diplomacyMultiplier',
  'crisisImpactMultiplier',
];
const IDEOLOGY_RANGE = 200;
const HALF_OF_VOTES = 50;
const DEFAULT_CUSTOM_COLOR = '#1F2937';
const DEFAULT_CUSTOM_EMBLEM = '🏛️';

/** Combina modificadores: multiplicadores se multiplicam, bônus se somam. */
const combineModifiers = (...parts: ReadonlyArray<Partial<ModifierSet>>): ModifierSet =>
  parts.reduce<ModifierSet>((acc, part) => {
    const next = { ...acc };
    (Object.entries(part) as Array<[keyof ModifierSet, number | undefined]>).forEach(([key, value]) => {
      if (value === undefined) return;
      next[key] = MULTIPLICATIVE_MODIFIERS.includes(key) ? acc[key] * value : acc[key] + value;
    });
    return next;
  }, DEFAULT_MODIFIERS);

const sumAffinities = (...parts: readonly SectorAffinity[]): SectorAffinity =>
  parts.reduce<SectorAffinity>((acc, part) => {
    const next = { ...acc };
    (Object.entries(part) as Array<[SectorKey, number | undefined]>).forEach(([key, value]) => {
      next[key] = (next[key] ?? 0) + (value ?? 0);
    });
    return next;
  }, {});

/** Afinidade setorial derivada da ideologia (direita econômica → mercado; conservador → militares…). */
export const deriveIdeologyAffinity = (economicIdeology: number, socialIdeology: number): SectorAffinity =>
  Object.fromEntries(
    SECTOR_KEYS.map((key) => [
      key,
      Math.round(economicIdeology * (IDEOLOGY_AFFINITY.economic[key] ?? 0) + socialIdeology * (IDEOLOGY_AFFINITY.social[key] ?? 0)),
    ]),
  );

const findById = <T extends { id: string }>(items: readonly T[], id: string): T | undefined => items.find((item) => item.id === id);

const buildArchetypeCandidate = (candidateId: string, content: GameContent): PlayerCandidate => {
  const candidate = findById(content.candidates, candidateId) ?? content.candidates[0];
  const background = findById(content.backgrounds, candidate.background);
  const ability = findById(content.abilities, candidate.abilityId);
  return {
    name: candidate.name,
    partyId: candidate.partyId,
    archetypeId: candidate.id,
    economicIdeology: candidate.economicIdeology,
    socialIdeology: candidate.socialIdeology,
    background: candidate.background,
    abilityId: candidate.abilityId,
    sectorAffinity: candidate.sectorAffinity,
    startingImpact: candidate.startingImpact,
    modifiers: combineModifiers(background?.modifiers ?? {}, ability?.modifiers ?? {}),
    color: candidate.color,
    emblem: candidate.emblem,
  };
};

const buildCustomCandidate = (input: CustomCandidateInput, content: GameContent): PlayerCandidate => {
  const background = findById(content.backgrounds, input.background);
  const ability = findById(content.abilities, input.abilityId);
  return {
    name: input.name.trim() || 'Presidente',
    partyId: input.partyId,
    archetypeId: null,
    economicIdeology: input.economicIdeology,
    socialIdeology: input.socialIdeology,
    background: input.background,
    abilityId: input.abilityId,
    sectorAffinity: sumAffinities(deriveIdeologyAffinity(input.economicIdeology, input.socialIdeology), background?.sectorAffinity ?? {}),
    startingImpact: background?.startingImpact ?? {},
    modifiers: combineModifiers(background?.modifiers ?? {}, ability?.modifiers ?? {}),
    color: findById(content.parties, input.partyId)?.color ?? DEFAULT_CUSTOM_COLOR,
    emblem: background?.icon ?? DEFAULT_CUSTOM_EMBLEM,
  };
};

/** Arquétipo: afinidade/impacto do candidato; custom: afinidade da ideologia + background. Modificadores de background e habilidade. */
export const buildPlayerCandidate = (selection: CandidateSelection, content: GameContent): PlayerCandidate =>
  selection.kind === 'archetype' ? buildArchetypeCandidate(selection.candidateId, content) : buildCustomCandidate(selection.input, content);


/** Sorteia CAMPAIGN_QUESTION_COUNT perguntas, obrigatórias primeiro. */
export const selectCampaignQuestions = (questions: readonly CampaignQuestion[], seed: number): CampaignQuestionSelection => {
  const rng = createRng(seed);
  const mandatory = questions.filter((question) => question.mandatory);
  const optional = shuffle(rng, questions.filter((question) => !question.mandatory));
  const picked = [...mandatory, ...optional].slice(0, CAMPAIGN_QUESTION_COUNT);
  return { questionIds: picked.map((question) => question.id), seed: rng.getSeed() };
};

/** Coerência: resposta alinhada à ideologia econômica do candidato rende até ±coherenceBonus p.p. */
const coherenceBonus = (candidate: PlayerCandidate, options: readonly CampaignOption[]): number =>
  options.reduce((acc, option) => {
    if (option.economicLean === undefined) return acc;
    const alignment = 1 - Math.abs(option.economicLean - candidate.economicIdeology) / IDEOLOGY_RANGE;
    return acc + (alignment * 2 - 1) * ELECTION.coherenceBonus;
  }, 0);

/** Adversário no 2º turno: o arquétipo ideologicamente mais distante do jogador. */
const findOpponent = (candidate: PlayerCandidate, candidates: readonly Candidate[]): Candidate | undefined =>
  candidates
    .filter((entry) => entry.id !== candidate.archetypeId)
    .reduce<Candidate | undefined>((best, entry) => {
      const distance = Math.hypot(entry.economicIdeology - candidate.economicIdeology, entry.socialIdeology - candidate.socialIdeology);
      const bestDistance = best
        ? Math.hypot(best.economicIdeology - candidate.economicIdeology, best.socialIdeology - candidate.socialIdeology)
        : -1;
      return distance > bestDistance ? entry : best;
    }, undefined);

const capitalFor = (margin: number): ElectionResult['capital'] => {
  if (margin >= ELECTION.highCapitalMargin) return 'alto';
  if (margin >= ELECTION.mediumCapitalMargin) return 'medio';
  return 'baixo';
};

export const calculateElectionResult = (
  candidate: PlayerCandidate,
  options: readonly CampaignOption[],
  content: GameContent,
  seed: number,
): ElectionResult => {
  const rng = createRng(seed);
  const campaignDelta = options.reduce((acc, option) => acc + option.voteShareDelta, 0);
  const noise = randomBetween(rng, -ELECTION.noise, ELECTION.noise);
  const voteShare = clamp(ELECTION.baseVoteShare + campaignDelta + coherenceBonus(candidate, options) + noise, ELECTION.minVoteShare, ELECTION.maxVoteShare);
  const margin = 2 * voteShare - 100;
  const partyBase = findById(content.parties, candidate.partyId)?.congressBase ?? 0;
  // Margem alta → mais capital político (base aliada inicial maior).
  const support = INITIAL_CONGRESS_SUPPORT + ELECTION.supportMarginWeight * (margin - ELECTION.referenceMargin) + partyBase;
  const opponent = findOpponent(candidate, content.candidates);
  return {
    voteShare,
    margin,
    firstRoundShare: voteShare - randomBetween(rng, ELECTION.firstRoundGapMin, ELECTION.firstRoundGapMax),
    opponentName: opponent?.name ?? 'Candidato da oposição',
    opponentPartyId: opponent?.partyId ?? '',
    initialCongressSupport: clamp(support, ELECTION.minInitialSupport, ELECTION.maxInitialSupport),
    capital: capitalFor(margin),
  };
};

const initialSectors = (affinity: SectorAffinity): SectorApproval =>
  Object.fromEntries(SECTOR_KEYS.map((key) => [key, clamp(INITIAL_SECTOR_APPROVAL[key] + (affinity[key] ?? 0), 0, 100)])) as SectorApproval;

const createCongressState = (support: number): CongressState => ({
  support,
  cpi: null,
  impeachment: null,
  votes: [],
  cpisOpened: 0,
  cpisSurvived: 0,
  impeachmentsOpened: 0,
  impeachmentsSurvived: 0,
});

const createStats = (approval: number): GameStats => ({
  eventsFaced: 0,
  crisesFaced: 0,
  crisesHandled: 0,
  lawsApproved: 0,
  lawsRejected: 0,
  negotiations: 0,
  diplomaticActions: 0,
  peakApproval: approval,
  lowestApproval: approval,
});

/** Estado da posse antes dos impactos do candidato e da campanha. */
const createBaseState = (params: NewGameParams, content: GameContent): SimulationState => {
  const termLength = GAME_MODES[params.mode].turns;
  const sectors = initialSectors(params.candidate.sectorAffinity);
  const approval = calculateApproval(sectors);
  return {
    turn: 1,
    totalTurns: termLength,
    termNumber: 1,
    termStartTurn: 1,
    termLength,
    mode: params.mode,
    difficulty: params.difficulty,
    // O governo começa na posição ideológica do candidato; as escolhas o deslocam depois.
    metrics: { ...INITIAL_METRICS, ideologyEconomic: params.candidate.economicIdeology, ideologySocial: params.candidate.socialIdeology },
    sectors,
    sectorAffinity: { ...params.candidate.sectorAffinity },
    approval,
    congress: createCongressState(params.election.initialCongressSupport),
    relations: Object.fromEntries(content.countries.map((country) => [country.id, country.initialRelation])) as Relations,
    activeEffects: [],
    promises: [],
    goals: [],
    flags: {},
    decisionHistory: {},
    eventHistory: {},
    lastDiplomaticActionTurn: null,
    modifiers: params.candidate.modifiers,
    stats: createStats(approval),
    seed: params.seed,
  };
};

/** Estado da posse: métricas reais, setores com afinidade, impactos de candidato e campanha, promessas e metas. */
export const createInitialState = (params: NewGameParams, content: GameContent): SimulationState => {
  const base = createBaseState(params, content);
  const impacted = [params.candidate.startingImpact, ...params.campaignOptions.map((option) => option.impact)].reduce(
    (acc, impact) => applyImpact(acc, impact),
    base,
  );
  const promiseDefinitions = params.campaignOptions.flatMap((option) => (option.promise ? [option.promise] : []));
  const countryNames = Object.fromEntries(content.countries.map((country) => [country.id, country.name]));
  const scaling = { baseline: impacted, scale: GAME_MODES[params.mode].goalScale, countryNames };
  return {
    ...impacted,
    promises: createPromises(promiseDefinitions, 1, impacted.termLength, scaling),
    goals: createGoalProgress(params.goalIds, content.goals, impacted.metrics, params.mode),
    stats: { ...impacted.stats, peakApproval: impacted.approval, lowestApproval: impacted.approval },
  };
};

/** Reeleição: aprovação ≥ limiar da dificuldade → reeleito; votos proporcionais à folga. */
export const calculateReelection = (state: SimulationState): ReelectionResult => {
  const threshold = getDifficultyConfig(state.difficulty).reelectionThreshold;
  const reelected = state.approval >= threshold;
  const raw = HALF_OF_VOTES + ELECTION.reelectionVoteWeight * (state.approval - threshold);
  // Garante coerência: reeleito sempre acima de 50%, derrotado sempre abaixo.
  const bounded = reelected ? Math.max(raw, ELECTION.minVoteShare) : Math.min(raw, HALF_OF_VOTES - ELECTION.reelectionLoserGap);
  return { reelected, voteShare: clamp(bounded, ELECTION.reelectionMinShare, ELECTION.reelectionMaxShare) };
};

/** Segundo mandato: novo início de mandato (lua de mel, desgaste zerado) e duração extra. */
export const startSecondTerm = (state: SimulationState): SimulationState => {
  const renewed = applyImpact(state, { approval: ELECTION.secondTermApprovalBonus, congressSupport: ELECTION.secondTermSupportBonus });
  return {
    ...renewed,
    termNumber: state.termNumber + 1,
    termStartTurn: state.turn + 1,
    totalTurns: state.totalTurns + state.termLength,
  };
};
