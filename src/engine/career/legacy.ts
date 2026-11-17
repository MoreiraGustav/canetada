/**
 * Legado da carreira: anos em cada cargo × hierarquia, eleições vencidas, leis,
 * obras, conquistas, reputação final e as passagens pelo Planalto (com a
 * aprovação final). Herdeiros somam o legado da família.
 */
import { CAREER } from '@/constants/balance';
import { SEMESTERS_PER_YEAR } from '@/constants/career';
import type { CareerContent, CareerLegacy, CareerOfficeId, CareerPosition, CareerState } from '@/types';
import { findAppointment, findOffice } from './helpers';

const PRESIDENT: CareerOfficeId = 'presidente';

const allPositions = (state: CareerState): CareerPosition[] => [...state.pastPositions, ...(state.position ? [state.position] : [])];

const yearsIn = (position: CareerPosition, currentTurn: number): number =>
  (Math.max(position.startTurn, position.endTurn !== null ? Math.min(position.endTurn, currentTurn) : currentTurn) - position.startTurn + 1) / SEMESTERS_PER_YEAR;

const rankOf = (content: CareerContent, position: CareerPosition): number =>
  (position.kind === 'office' ? findOffice(content, position.id)?.rank : findAppointment(content, position.id)?.rank) ?? 0;

/** Maior cargo eletivo e maior cargo de nomeação já ocupados. */
const highest = (content: CareerContent, positions: readonly CareerPosition[], kind: CareerPosition['kind']): string | null =>
  positions
    .filter((position) => position.kind === kind)
    .sort((a, b) => rankOf(content, b) - rankOf(content, a))[0]?.id ?? null;

/** Planalto: bônus por chegar, mais (ou menos) pela aprovação final de cada passagem; impeachment desconta. */
const presidencyPoints = (state: CareerState, positions: readonly CareerPosition[]): number => {
  const { presidencyBonus, presidencyApprovalPoints, impeachmentPenalty } = CAREER.legacy;
  if (!positions.some((position) => position.id === PRESIDENT)) return 0;
  return state.presidencies.reduce<number>(
    (acc, record) => acc + (record.finalApproval - CAREER.postPresidency.approvalReference) * presidencyApprovalPoints - (record.ending === 'impeached' ? impeachmentPenalty : 0),
    presidencyBonus,
  );
};

export const calculateCareerLegacy = (state: CareerState, content: CareerContent): CareerLegacy => {
  const positions = allPositions(state);
  const rules = CAREER.legacy;
  const positionPoints = positions.reduce((acc, position) => acc + rankOf(content, position) * yearsIn(position, state.turn) * rules.pointsPerRankYear, 0);
  const won = state.elections.filter((record) => record.won).length;
  const laws = state.legislature.billHistory.filter((record) => record.outcome === 'lei').length;
  const works = state.worksHistory.filter((record) => record.outcome === 'entregue').length;
  const achievements = Object.keys(state.achievements).length;
  const score = Math.max(
    0,
    Math.round(
      positionPoints +
        won * rules.electionWonPoints +
        laws * rules.lawPoints +
        works * rules.workPoints +
        achievements * rules.achievementPoints +
        (state.metrics.reputation - 50) * rules.reputationPoints +
        presidencyPoints(state, positions),
    ),
  );
  const tier = [...content.legacyTiers].sort((a, b) => b.minScore - a.minScore).find((entry) => score >= entry.minScore);
  const officeYears = positions.filter((position) => position.kind === 'office').reduce((acc, position) => acc + yearsIn(position, state.turn), 0);
  return {
    highestOfficeId: highest(content, positions, 'office') as CareerOfficeId | null,
    highestAppointmentId: highest(content, positions, 'appointment'),
    yearsInOffice: officeYears,
    electionsWon: won,
    electionsLost: state.elections.length - won,
    lawsPassed: laws,
    worksDelivered: works,
    achievements,
    score,
    title: tier?.title ?? '',
    description: tier?.description ?? '',
    familyScore: state.dynasty ? state.dynasty.ancestors.reduce((acc, member) => acc + member.legacyScore, score) : null,
  };
};
