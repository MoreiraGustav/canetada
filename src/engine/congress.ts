/**
 * Congresso (GDD §4.2): votações, negociação, base aliada, CPIs e impeachment.
 */
import {
  CONGRESS,
  CPI_SUPPORT_THRESHOLD,
  IDEOLOGY,
  MAX_VOTE_CHANCE,
  MIN_VOTE_CHANCE,
  NEGOTIATION_SUPPORT_BONUS,
  ORDINARY_LAW_THRESHOLD,
  PEC_THRESHOLD,
  STABLE_APPROVAL_THRESHOLD,
} from '@/constants/balance';
import type {
  CpiTopic,
  DifficultyConfig,
  Impact,
  ModifierSet,
  NewsItem,
  PoliticalStatus,
  Rng,
  SimulationState,
  StateWithNews,
  VoteChanceParams,
} from '@/types';
import { clamp } from '@/utils/math';
import { isFlagActive } from './conditions';
import { applyImpact, clearFlag, scaleImpact, setFlags } from './impacts';
import { createNewsItem } from './news';
import { randomInt } from './random';

export const FLAG_RECENT_NEGOTIATION = 'negociacao-recente';
export const FLAG_CPI = 'cpi-instalada';
export const FLAG_IMPEACHMENT = 'impeachment-aberto';
export const FLAG_REMOVED = 'presidente-afastado';
/** Definida por dados quando um crime de responsabilidade vem à tona (ex.: esquema grave exposto). */
export const FLAG_CRIME = 'crime-de-responsabilidade';
const SCANDAL_FLAGS = ['escandalo-ministerial', 'vazamento-audio'] as const;

/**
 * Chance de aprovação: logística em torno do limiar (50 lei / 60 PEC),
 * deslocada pela aprovação popular, + bônus da negociação e da habilidade.
 */
export const calculateVoteChance = (params: VoteChanceParams): number => {
  const threshold = params.type === 'pec' ? PEC_THRESHOLD : ORDINARY_LAW_THRESHOLD;
  const effectiveSupport = params.support + (params.negotiate ? NEGOTIATION_SUPPORT_BONUS : 0);
  const logOdds =
    (effectiveSupport - threshold) / CONGRESS.voteLogisticScale +
    CONGRESS.voteApprovalWeight * (params.approval - CONGRESS.voteApprovalReference);
  const probability = 1 / (1 + Math.exp(-logOdds)) + params.voteChanceBonus;
  // Medida provisória tem força de lei imediata: lei ordinária ganha chance mínima (a Constituição veda MP para PEC).
  const floor = params.provisionalMeasure && params.type === 'ordinary' ? IDEOLOGY.provisionalMeasureFloor : MIN_VOTE_CHANCE;
  return clamp(probability, floor, MAX_VOTE_CHANCE);
};

/** Medida provisória editada neste mês. */
export const hasProvisionalMeasure = (state: SimulationState): boolean => isFlagActive(state, FLAG_PROVISIONAL_MEASURE, 0);

/** Flags (definidas por ações da agenda) que reforçam as votações do mês. */
export const FLAG_PROVISIONAL_MEASURE = 'medida-provisoria';
export const FLAG_STREET_PRESSURE = 'militancia-nas-ruas';

/**
 * Bônus total na chance de aprovar leis neste mês: habilidade do presidente +
 * medida provisória editada no mês + militância nas ruas no mês.
 */
export const getVoteBonus = (state: SimulationState): number =>
  state.modifiers.voteChanceBonus +
  (isFlagActive(state, FLAG_PROVISIONAL_MEASURE, 0) ? IDEOLOGY.provisionalMeasureVoteBonus : 0) +
  (isFlagActive(state, FLAG_STREET_PRESSURE, 0) ? IDEOLOGY.streetPressureVoteBonus : 0);

/** Custo político de negociar cargos/emendas (dívida, classe média, aprovação). */
export const getNegotiationCost = (modifiers: ModifierSet): Impact =>
  scaleImpact(
    {
      debt: CONGRESS.negotiationDebt,
      approval: CONGRESS.negotiationApproval,
      sectors: { middleClass: CONGRESS.negotiationMiddleClass },
    },
    modifiers.negotiationCostMultiplier,
  );

/** Base aliada deriva rumo a f(aprovação). */
const driftSupport = (state: SimulationState): SimulationState => {
  const target = CONGRESS.supportIntercept + CONGRESS.supportApprovalWeight * state.approval;
  const support = clamp(state.congress.support + CONGRESS.supportSpeed * (target - state.congress.support), 0, 100);
  return { ...state, congress: { ...state.congress, support } };
};

const cpiChance = (state: SimulationState): number => {
  const support = state.congress.support;
  const lowSupport =
    support < CPI_SUPPORT_THRESHOLD ? CONGRESS.cpiLowSupportChance + CONGRESS.cpiChancePerPoint * (CPI_SUPPORT_THRESHOLD - support) : 0;
  const scandal = SCANDAL_FLAGS.some((flag) => isFlagActive(state, flag, CONGRESS.cpiScandalWindow)) ? CONGRESS.cpiScandalBonus : 0;
  return CONGRESS.cpiBaseChance + lowSupport + scandal;
};

const openCpi = (state: SimulationState, rng: Rng, topics: readonly CpiTopic[]): StateWithNews => {
  const topic = topics[Math.floor(rng.next() * topics.length)];
  const duration = randomInt(rng, CONGRESS.cpiMinDuration, CONGRESS.cpiMaxDuration);
  const cpi = { topicId: topic.id, name: topic.name, startTurn: state.turn, endTurn: state.turn + duration - 1 };
  const next = setFlags({ ...state, congress: { ...state.congress, cpi, cpisOpened: state.congress.cpisOpened + 1 } }, [FLAG_CPI]);
  const news = createNewsItem(state.turn, `Congresso instala ${topic.name} e oposição promete investigar o governo`, 'negative', 'congress', 'cpi-aberta');
  return { state: next, news: [news] };
};

/** CPI: abre conforme o risco; enquanto dura, drena aprovação e base; ao fim, conta como sobrevivida. */
const stepCpi = (state: SimulationState, rng: Rng, topics: readonly CpiTopic[]): StateWithNews => {
  const { cpi } = state.congress;
  if (!cpi) {
    if (topics.length === 0 || rng.next() >= cpiChance(state)) return { state, news: [] };
    return openCpi(state, rng, topics);
  }
  const drained = applyImpact(state, { approval: CONGRESS.cpiApprovalDrain, congressSupport: CONGRESS.cpiSupportDrain });
  if (state.turn < cpi.endTurn) return { state: drained, news: [] };
  const closed = clearFlag(
    { ...drained, congress: { ...drained.congress, cpi: null, cpisSurvived: drained.congress.cpisSurvived + 1 } },
    FLAG_CPI,
  );
  const news = createNewsItem(state.turn, `${cpi.name} encerra os trabalhos sem pedir o afastamento do presidente`, 'positive', 'congress', 'cpi-encerrada');
  return { state: closed, news: [news] };
};

/** Zona de impeachment: aprovação e base abaixo dos limiares (mais altos com crime de responsabilidade). */
const inImpeachmentZone = (state: SimulationState, difficulty: DifficultyConfig, margin = 0): boolean => {
  const crime = state.flags[FLAG_CRIME] !== undefined;
  const approvalLimit = difficulty.impeachmentApprovalThreshold + (crime ? CONGRESS.crimeApprovalBonus : 0) + margin;
  const supportLimit = difficulty.impeachmentSupportThreshold + (crime ? CONGRESS.crimeSupportBonus : 0) + margin;
  return state.approval < approvalLimit && state.congress.support < supportLimit;
};

const archiveImpeachment = (state: SimulationState): StateWithNews => {
  const next = clearFlag(
    { ...state, congress: { ...state.congress, impeachment: null, impeachmentsSurvived: state.congress.impeachmentsSurvived + 1 } },
    FLAG_IMPEACHMENT,
  );
  const news = createNewsItem(state.turn, 'Câmara arquiva pedido de impeachment e governo respira', 'positive', 'congress', 'impeachment-arquivado');
  return { state: next, news: [news] };
};

/** Impeachment: abre com aprovação e base abaixo dos limiares; no prazo, afasta se as condições persistirem. */
const stepImpeachment = (state: SimulationState, difficulty: DifficultyConfig): StateWithNews => {
  const { impeachment } = state.congress;
  if (!impeachment) {
    if (!inImpeachmentZone(state, difficulty)) return { state, news: [] };
    const opened = { startTurn: state.turn, deadlineTurn: state.turn + CONGRESS.impeachmentDuration };
    const next = setFlags(
      { ...state, congress: { ...state.congress, impeachment: opened, impeachmentsOpened: state.congress.impeachmentsOpened + 1 } },
      [FLAG_IMPEACHMENT],
    );
    const news = createNewsItem(state.turn, 'Presidente da Câmara aceita pedido de impeachment contra o presidente', 'negative', 'congress', 'impeachment-aberto');
    return { state: next, news: [news] };
  }
  if (!inImpeachmentZone(state, difficulty, CONGRESS.impeachmentRecoveryMargin)) return archiveImpeachment(state);
  if (state.turn < impeachment.deadlineTurn) return { state, news: [] };
  if (!inImpeachmentZone(state, difficulty)) return archiveImpeachment(state);
  const removed = setFlags(state, [FLAG_REMOVED]);
  const news = createNewsItem(state.turn, 'Senado aprova impeachment e presidente é afastado do cargo', 'negative', 'congress', 'impeachment-aprovado');
  return { state: removed, news: [news] };
};

/** Etapa mensal do Congresso: deriva da base, CPI e impeachment. */
export const stepCongress = (
  state: SimulationState,
  rng: Rng,
  difficulty: DifficultyConfig,
  cpiTopics: readonly CpiTopic[],
): { state: SimulationState; news: NewsItem[] } => {
  const drifted = driftSupport(state);
  const cpi = stepCpi(drifted, rng, cpiTopics);
  const impeachment = stepImpeachment(cpi.state, difficulty);
  return { state: impeachment.state, news: [...cpi.news, ...impeachment.news] };
};

/** O presidente foi afastado (processo chegou ao prazo com as condições mantidas). */
export const isImpeached = (state: SimulationState): boolean => state.flags[FLAG_REMOVED] !== undefined;

export const getPoliticalStatus = (state: SimulationState): PoliticalStatus => {
  if (state.congress.impeachment) return 'impeachment';
  if (state.congress.cpi) return 'cpi';
  if (state.approval < STABLE_APPROVAL_THRESHOLD || state.congress.support < CPI_SUPPORT_THRESHOLD) return 'crisis';
  return 'stable';
};
