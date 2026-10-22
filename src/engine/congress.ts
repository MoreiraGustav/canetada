/**
 * Congresso (GDD §4.2): votações, negociação, base aliada, CPIs e impeachment.
 */
import { CONGRESS, CPI_SUPPORT_THRESHOLD, STABLE_APPROVAL_THRESHOLD } from '@/constants/balance';
import { MAX_VOTE_RECORDS } from '@/constants/game';
import type {
  Chamber,
  CpiTopic,
  DifficultyConfig,
  ImpeachmentFacts,
  Impact,
  ModifierSet,
  NewsItem,
  PoliticalStatus,
  Rng,
  SimulationState,
  StateWithNews,
  VoteKind,
  VoteRecord,
} from '@/types';
import { clamp } from '@/utils/math';
import { cabinetSupportShift } from './cast';
import { isFlagActive } from './conditions';
import { applyImpact, clearFlag, scaleImpact, setFlags } from './impacts';
import { createNewsItem } from './news';
import { tallyImpeachment } from './plenary';
import { randomInt } from './random';
import { calculateVoteChance, FLAG_PROVISIONAL_MEASURE, FLAG_STREET_PRESSURE, getVoteBonus, hasProvisionalMeasure } from './voteChance';

// A chance de voto mora em voteChance.ts (o plenário a usa sem depender do Congresso).
export { calculateVoteChance, FLAG_PROVISIONAL_MEASURE, FLAG_STREET_PRESSURE, getVoteBonus, hasProvisionalMeasure };

export const FLAG_RECENT_NEGOTIATION = 'negociacao-recente';
export const FLAG_CPI = 'cpi-instalada';
export const FLAG_IMPEACHMENT = 'impeachment-aberto';
export const FLAG_REMOVED = 'presidente-afastado';
/** Definida por dados quando um crime de responsabilidade vem à tona (ex.: esquema grave exposto). */
export const FLAG_CRIME = 'crime-de-responsabilidade';
const SCANDAL_FLAGS = ['escandalo-ministerial', 'vazamento-audio'] as const;

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

/** Base aliada deriva rumo a f(aprovação) + partidos com ministérios além da composição padrão. */
const driftSupport = (state: SimulationState): SimulationState => {
  const target = CONGRESS.supportIntercept + CONGRESS.supportApprovalWeight * state.approval + cabinetSupportShift(state);
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

/** Aprovação e base de hoje diante dos limites do impeachment (mais altos com crime de responsabilidade). */
const impeachmentFacts = (state: SimulationState, difficulty: DifficultyConfig): ImpeachmentFacts => {
  const crime = state.flags[FLAG_CRIME] !== undefined;
  return {
    approval: state.approval,
    approvalLimit: difficulty.impeachmentApprovalThreshold + (crime ? CONGRESS.crimeApprovalBonus : 0),
    support: state.congress.support,
    supportLimit: difficulty.impeachmentSupportThreshold + (crime ? CONGRESS.crimeSupportBonus : 0),
    crime,
  };
};

/** Zona de impeachment: aprovação e base abaixo dos limiares (com folga `margin` para o arquivamento). */
const inImpeachmentZone = (state: SimulationState, difficulty: DifficultyConfig, margin = 0): boolean => {
  const facts = impeachmentFacts(state, difficulty);
  return facts.approval < facts.approvalLimit + margin && facts.support < facts.supportLimit + margin;
};

interface StateWithVotes extends StateWithNews {
  votes: VoteRecord[];
}

const IMPEACHMENT_TITLE = 'Impeachment do presidente';

/** Sessão de impeachment registrada como votação: a Câmara autoriza (2/3) e o Senado julga (2/3). */
const recordImpeachmentVote = (state: SimulationState, kind: VoteKind, chamber: Chamber, approved: boolean, facts: ImpeachmentFacts): StateWithVotes => {
  const vote: VoteRecord = {
    turn: state.turn,
    decisionId: 'impeachment',
    optionId: kind,
    title: IMPEACHMENT_TITLE,
    type: 'ordinary',
    chance: approved ? 1 : 0,
    approved,
    negotiated: false,
    tally: tallyImpeachment(chamber, approved, facts, state.turn),
    support: facts.support,
    approval: facts.approval,
    ideology: { economic: state.metrics.ideologyEconomic, social: state.metrics.ideologySocial },
    kind,
    senateTally: null,
    impeachment: facts,
  };
  const next = { ...state, congress: { ...state.congress, votes: [...state.congress.votes, vote].slice(-MAX_VOTE_RECORDS) } };
  return { state: next, news: [], votes: [vote] };
};

/** O Senado absolve: o processo é arquivado e conta como sobrevivido. */
const acquit = (state: SimulationState, difficulty: DifficultyConfig): StateWithVotes => {
  const session = recordImpeachmentVote(state, 'impeachment-trial', 'senado', false, impeachmentFacts(state, difficulty));
  const next = clearFlag(
    { ...session.state, congress: { ...session.state.congress, impeachment: null, impeachmentsSurvived: session.state.congress.impeachmentsSurvived + 1 } },
    FLAG_IMPEACHMENT,
  );
  const yes = session.votes[0].tally?.yes ?? 0;
  const news = createNewsItem(state.turn, `Senado rejeita o impeachment com só ${yes} votos a favor e governo respira`, 'positive', 'congress', 'impeachment-arquivado');
  return { ...session, state: next, news: [news] };
};

/** A Câmara autoriza a abertura do processo (2/3 dos deputados). */
const openImpeachment = (state: SimulationState, difficulty: DifficultyConfig): StateWithVotes => {
  const session = recordImpeachmentVote(state, 'impeachment-opening', 'camara', true, impeachmentFacts(state, difficulty));
  const opened = { startTurn: state.turn, deadlineTurn: state.turn + CONGRESS.impeachmentDuration };
  const next = setFlags(
    { ...session.state, congress: { ...session.state.congress, impeachment: opened, impeachmentsOpened: session.state.congress.impeachmentsOpened + 1 } },
    [FLAG_IMPEACHMENT],
  );
  const yes = session.votes[0].tally?.yes ?? 0;
  const news = createNewsItem(state.turn, `Câmara autoriza processo de impeachment contra o presidente por ${yes} votos`, 'negative', 'congress', 'impeachment-aberto');
  return { ...session, state: next, news: [news] };
};

/** O Senado condena: o presidente é afastado. */
const remove = (state: SimulationState, difficulty: DifficultyConfig): StateWithVotes => {
  const session = recordImpeachmentVote(state, 'impeachment-trial', 'senado', true, impeachmentFacts(state, difficulty));
  const yes = session.votes[0].tally?.yes ?? 0;
  const news = createNewsItem(state.turn, `Senado aprova impeachment por ${yes} votos e presidente é afastado`, 'negative', 'congress', 'impeachment-aprovado');
  return { ...session, state: setFlags(session.state, [FLAG_REMOVED]), news: [news] };
};

/** Impeachment: abre com aprovação e base abaixo dos limiares; no prazo, afasta se as condições persistirem. */
const stepImpeachment = (state: SimulationState, difficulty: DifficultyConfig): StateWithVotes => {
  const { impeachment } = state.congress;
  if (!impeachment) return inImpeachmentZone(state, difficulty) ? openImpeachment(state, difficulty) : { state, news: [], votes: [] };
  if (!inImpeachmentZone(state, difficulty, CONGRESS.impeachmentRecoveryMargin)) return acquit(state, difficulty);
  if (state.turn < impeachment.deadlineTurn) return { state, news: [], votes: [] };
  return inImpeachmentZone(state, difficulty) ? remove(state, difficulty) : acquit(state, difficulty);
};

/** Etapa mensal do Congresso: deriva da base, CPI e impeachment (com as sessões votadas no mês). */
export const stepCongress = (
  state: SimulationState,
  rng: Rng,
  difficulty: DifficultyConfig,
  cpiTopics: readonly CpiTopic[],
): { state: SimulationState; news: NewsItem[]; votes: VoteRecord[] } => {
  const drifted = driftSupport(state);
  const cpi = stepCpi(drifted, rng, cpiTopics);
  const impeachment = stepImpeachment(cpi.state, difficulty);
  return { state: impeachment.state, news: [...cpi.news, ...impeachment.news], votes: impeachment.votes };
};

/** O presidente foi afastado (processo chegou ao prazo com as condições mantidas). */
export const isImpeached = (state: SimulationState): boolean => state.flags[FLAG_REMOVED] !== undefined;

export const getPoliticalStatus = (state: SimulationState): PoliticalStatus => {
  if (state.congress.impeachment) return 'impeachment';
  if (state.congress.cpi) return 'cpi';
  if (state.approval < STABLE_APPROVAL_THRESHOLD || state.congress.support < CPI_SUPPORT_THRESHOLD) return 'crisis';
  return 'stable';
};
