/**
 * Composição do turno mensal. Ordem: decisões → evento → efeitos ativos →
 * economia → política fiscal → social → diplomacia → setores → Congresso → promessas → metas →
 * estatísticas → notícias de indicadores → desfecho.
 */
import { CRISIS_HANDLED_MAX_APPROVAL_DROP } from '@/constants/balance';
import { EVENT_CATEGORY_INFO } from '@/constants/game';
import { INDICATOR_INFO } from '@/constants/metrics';
import { SECTOR_KEYS } from '@/constants/sectors';
import type {
  DecisionChoice,
  DifficultyConfig,
  GameContent,
  IndicatorDeltas,
  IndicatorKey,
  NewsItem,
  Rng,
  SimulationState,
  StateWithNews,
  TurnEventChoice,
  TurnInput,
  TurnOutcome,
  TurnResult,
  VoteRecord,
} from '@/types';
import { scandalTargetNews } from './cast';
import { getIndicatorValue } from './conditions';
import { isImpeached, stepCongress } from './congress';
import { applyDecisionChoice, selectTurnDecisions } from './decisions';
import { getDifficultyConfig } from './difficulty';
import { stepDiplomacy } from './diplomacy';
import { resolveEventOption, selectEvent } from './events';
import { stepFiscalPolicy } from './fiscal';
import { updateGoalProgress } from './goals';
import { applyActiveEffects } from './impacts';
import { stepLatentRisks } from './latentRisks';
import { generateIndicatorNews } from './news';
import { generateOppositionNews } from './opposition';
import { stepNewsBlips } from './newsBlips';
import { stepPromises } from './promises';
import { createRng } from './random';
import { stepEconomy, stepSectors, stepSocial } from './simulation';

const DELTA_PRECISION = 1e6;

const round = (value: number): number => Math.round(value * DELTA_PRECISION) / DELTA_PRECISION;

const applyDecisions = (
  state: SimulationState,
  choices: readonly DecisionChoice[],
  content: GameContent,
  rng: Rng,
  difficulty: DifficultyConfig,
): StateWithNews & { votes: VoteRecord[] } =>
  choices.reduce<StateWithNews & { votes: VoteRecord[] }>(
    (acc, choice) => {
      const decision = content.decisions.find((entry) => entry.id === choice.decisionId);
      const option = decision?.options.find((entry) => entry.id === choice.optionId);
      if (!decision || !option) return acc;
      const result = applyDecisionChoice(acc.state, decision, option, choice.negotiate, rng, difficulty);
      return { state: result.state, news: [...acc.news, ...result.news], votes: result.vote ? [...acc.votes, result.vote] : acc.votes };
    },
    { state, news: [], votes: [] },
  );

/** Resolve o evento do mês; num escândalo político, a oposição mira um ministro político (fictício). */
const applyEvent = (
  state: SimulationState,
  choice: TurnEventChoice | null,
  content: GameContent,
  rng: Rng,
  difficulty: DifficultyConfig,
): StateWithNews => {
  const event = choice ? content.events.find((entry) => entry.id === choice.eventId) : undefined;
  const option = event?.options.find((entry) => entry.id === choice?.optionId);
  if (!event || !option) return { state, news: [] };
  const resolved = resolveEventOption(state, event, option, difficulty, rng);
  const target = event.category === 'political-scandal' ? scandalTargetNews(resolved.state, rng) : [];
  return { state: resolved.state, news: [...resolved.news, ...target] };
};

/** Pico/vale de aprovação e crises bem conduzidas (aprovação não despencou no turno). */
const updateStats = (before: SimulationState, after: SimulationState, choice: TurnEventChoice | null, content: GameContent): SimulationState => {
  const event = choice ? content.events.find((entry) => entry.id === choice.eventId) : undefined;
  const handled = event !== undefined && EVENT_CATEGORY_INFO[event.category].isCrisis && before.approval - after.approval < CRISIS_HANDLED_MAX_APPROVAL_DROP;
  return {
    ...after,
    stats: {
      ...after.stats,
      peakApproval: Math.max(after.stats.peakApproval, after.approval),
      lowestApproval: Math.min(after.stats.lowestApproval, after.approval),
      crisesHandled: after.stats.crisesHandled + (handled ? 1 : 0),
    },
  };
};

const computeDeltas = (before: SimulationState, after: SimulationState): IndicatorDeltas =>
  Object.fromEntries(
    (Object.keys(INDICATOR_INFO) as IndicatorKey[]).map((key) => [key, round(getIndicatorValue(after, key) - getIndicatorValue(before, key))]),
  );

const computeOutcome = (state: SimulationState): TurnOutcome => {
  if (isImpeached(state)) return 'impeached';
  if (state.turn >= state.termStartTurn + state.termLength - 1) return 'term-ended';
  return 'continue';
};

/**
 * Simulação do mês após as escolhas: efeitos, macro, social, diplomacia, setores,
 * riscos latentes (escândalos), Congresso (com as sessões de impeachment), promessas,
 * metas e fatos do mês.
 */
const simulateMonth = (
  state: SimulationState,
  content: GameContent,
  rng: Rng,
  difficulty: DifficultyConfig,
): StateWithNews & { votes: VoteRecord[] } => {
  const effects = applyActiveEffects(state);
  const economy = stepEconomy(effects, rng, difficulty, content.countries);
  const fiscal = stepFiscalPolicy(economy, content.fiscalStances);
  const social = stepSocial(fiscal, rng);
  const diplomacy = stepDiplomacy(social, content.countries);
  const sectors = stepSectors(diplomacy, difficulty);
  const exposures = stepLatentRisks(sectors, rng, content.latentRisks);
  const congress = stepCongress(exposures.state, rng, difficulty, content.cpiTopics);
  const promises = stepPromises(congress.state);
  const goals = updateGoalProgress(promises.state.goals, content.goals, promises.state.metrics);
  const blips = stepNewsBlips({ ...promises.state, goals }, rng, content.newsBlips);
  return { state: blips.state, news: [...exposures.news, ...congress.news, ...promises.news, ...blips.news], votes: congress.votes };
};

/** Processa o turno completo (NÃO incrementa o turno). */
export const processTurn = (input: TurnInput): TurnResult => {
  const { state: before, content } = input;
  const difficulty = getDifficultyConfig(before.difficulty);
  const rng = createRng(before.seed);
  const decided = applyDecisions(before, input.decisions, content, rng, difficulty);
  const evented = applyEvent(decided.state, input.event, content, rng, difficulty);
  const month = simulateMonth(evented.state, content, rng, difficulty);
  const withStats = updateStats(before, month.state, input.event, content);
  const indicatorNews: NewsItem[] = generateIndicatorNews(before, withStats, content.headlines, rng);
  const oppositionNews = generateOppositionNews(before, withStats, content.oppositionLines, content.parties, rng);
  const state: SimulationState = { ...withStats, seed: rng.getSeed() };
  return {
    state,
    report: {
      turn: before.turn,
      news: [...decided.news, ...evented.news, ...month.news, ...indicatorNews, ...oppositionNews],
      deltas: computeDeltas(before, state),
      sectorDeltas: Object.fromEntries(SECTOR_KEYS.map((key) => [key, round(state.sectors[key] - before.sectors[key])])),
      relationDeltas: Object.fromEntries(
        (Object.keys(state.relations) as Array<keyof SimulationState['relations']>).map((id) => [id, round(state.relations[id] - before.relations[id])]),
      ),
      votes: [...decided.votes, ...month.votes],
      eventId: input.event?.eventId ?? null,
      eventOptionId: input.event?.optionId ?? null,
      outcome: computeOutcome(state),
    },
  };
};

export const advanceTurn = (state: SimulationState): SimulationState => ({ ...state, turn: state.turn + 1 });

export const prepareTurn = (state: SimulationState, content: GameContent): { state: SimulationState; decisionIds: string[] } =>
  selectTurnDecisions(state, content.decisions, content.goals);

export const drawEvent = (state: SimulationState, content: GameContent): { state: SimulationState; eventId: string | null } =>
  selectEvent(state, content.events, getDifficultyConfig(state.difficulty));
