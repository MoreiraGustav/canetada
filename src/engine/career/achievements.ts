/**
 * Conquistas: contadores derivados da carreira (`careerStats`) e a conferência dos
 * critérios. As novas entram em `CareerState.achievements` com o semestre e viram notícia.
 */
import { SEMESTERS_PER_YEAR } from '@/constants/career';
import type { Achievement, AchievementCriterion, CareerContent, CareerElectionRecord, CareerNews, CareerPosition, CareerState, CareerStats } from '@/types';
import { ageAt, findOffice, getCharacter } from './helpers';
import { createCareerNews } from './text';

const MILLION = 1_000_000;

const allPositions = (state: CareerState): CareerPosition[] => [...state.pastPositions, ...(state.position ? [state.position] : [])];

const officeYears = (state: CareerState): number =>
  allPositions(state)
    .filter((position) => position.kind === 'office')
    .reduce((acc, position) => acc + (Math.min(position.endTurn ?? state.turn, state.turn) - position.startTurn + 1) / SEMESTERS_PER_YEAR, 0);

/** Venceu o 2º turno depois de terminar o 1º atrás de alguém. */
const isComeback = (record: CareerElectionRecord): boolean => {
  if (!record.won || !record.runoff || !record.firstRound) return false;
  const player = record.firstRound.candidates.find((candidate) => candidate.isPlayer)?.share ?? 0;
  return record.firstRound.candidates.some((candidate) => !candidate.isPlayer && candidate.share > player);
};

const firstTurnOf = (state: CareerState, kind: CareerState['timeline'][number]['kind']): number | null =>
  state.timeline.find((entry) => entry.kind === kind)?.turn ?? null;

const winsAfter = (state: CareerState, turn: number | null): number =>
  turn === null ? 0 : state.elections.filter((record) => record.won && record.turn > turn).length;

const levelsHeld = (state: CareerState, content: CareerContent): number =>
  new Set(allPositions(state).flatMap((position) => (position.kind === 'office' ? [findOffice(content, position.id)?.level] : [])).filter(Boolean)).size;

const adversaryDefeats = (state: CareerState): number => {
  const names = new Set(state.cast.filter((character) => character.role === 'adversario').map((character) => character.name));
  return state.elections.filter((record) => record.won && record.opponent !== null && names.has(record.opponent.name)).length;
};

/** Contadores da carreira para as conquistas. */
export const careerStats = (state: CareerState, content: CareerContent): CareerStats => {
  const won = state.elections.filter((record) => record.won).length;
  const firstPresidencyEnd = state.presidencies[0]?.endTurn ?? null;
  return {
    electionsWon: won,
    electionsLost: state.elections.length - won,
    appointmentsHeld: allPositions(state).filter((position) => position.kind === 'appointment').length,
    lawsPassed: state.legislature.billHistory.filter((record) => record.outcome === 'lei').length,
    worksDelivered: state.worksHistory.filter((record) => record.outcome === 'entregue').length,
    worksOnTime: state.worksHistory.filter((record) => record.outcome === 'entregue' && record.late === 0).length,
    partySwitches: state.timeline.filter((entry) => entry.kind === 'troca-partido').length,
    maxConsecutiveTerms: Math.max(0, ...allPositions(state).filter((position) => position.kind === 'office').map((position) => position.consecutiveTerms)),
    runoffComebacks: state.elections.filter(isComeback).length,
    primariesWon: state.elections.filter((record) => record.primary?.won).length,
    adversaryDefeats: adversaryDefeats(state),
    levelsHeld: levelsHeld(state, content),
    amendmentsMillions: state.legislature.amendmentsTotal / MILLION,
    missionsDone: Object.keys(state.missionLog).length,
    votesAgainstParty: state.legislature.votesAgainstParty,
    yearsInOffice: officeYears(state),
    generation: state.dynasty?.generation ?? 1,
    presidentialTerms: state.presidencies.reduce((acc, record) => acc + record.terms, 0),
    impeachments: state.presidencies.filter((record) => record.ending === 'impeached').length,
    winsAfterIneligibility: winsAfter(state, firstTurnOf(state, 'inelegivel')),
    winsAfterPresidency: winsAfter(state, firstPresidencyEnd),
  };
};

type CriterionOf<K extends AchievementCriterion['kind']> = Extract<AchievementCriterion, { kind: K }>;
type Check<K extends AchievementCriterion['kind']> = (state: CareerState, stats: CareerStats, criterion: CriterionOf<K>) => boolean;

const heldOffice: Check<'office'> = (state, _stats, criterion) =>
  allPositions(state).some(
    (position) =>
      position.kind === 'office' &&
      criterion.offices.some((id) => id === position.id) &&
      (criterion.maxAge === undefined || ageAt(state, position.startTurn) <= criterion.maxAge),
  );

const CHECKS: { [K in AchievementCriterion['kind']]: Check<K> } = {
  office: heldOffice,
  stat: (_state, stats, criterion) => stats[criterion.stat] >= criterion.min,
  metric: (state, _stats, criterion) => state.metrics[criterion.metric] >= criterion.min,
  relation: (state, _stats, criterion) => (getCharacter(state, criterion.role)?.relation ?? -Infinity) >= criterion.min,
  'admin-approval': (state, _stats, criterion) => (state.administration?.approval ?? 0) >= criterion.min,
  unbeaten: (_state, stats, criterion) => stats.electionsWon >= criterion.wins && stats.electionsLost === 0,
  all: (state, stats, criterion) => criterion.criteria.every((entry) => meetsCriterion(state, stats, entry)),
};

/** O critério está cumprido agora? */
export const meetsCriterion = (state: CareerState, stats: CareerStats, criterion: AchievementCriterion): boolean =>
  (CHECKS[criterion.kind] as Check<typeof criterion.kind>)(state, stats, criterion);

/** Confere as conquistas que ainda faltam; as novas ganham o semestre e uma notícia. */
export const unlockAchievements = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[]; unlocked: Achievement[] } => {
  const pending = content.achievements.filter((achievement) => state.achievements[achievement.id] === undefined);
  if (pending.length === 0) return { state, news: [], unlocked: [] };
  const stats = careerStats(state, content);
  const unlocked = pending.filter((achievement) => meetsCriterion(state, stats, achievement.criterion));
  if (unlocked.length === 0) return { state, news: [], unlocked };
  const achievements = { ...state.achievements, ...Object.fromEntries(unlocked.map((achievement) => [achievement.id, state.turn])) };
  const news = unlocked.map((achievement) => createCareerNews(state.turn, `🏆 Conquista: ${achievement.name}`, 'positive', `conquista-${achievement.id}`));
  return { state: { ...state, achievements }, news, unlocked };
};
