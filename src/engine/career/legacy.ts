/**
 * Legado da carreira: anos em cada cargo × hierarquia, eleições vencidas,
 * reputação final e o bônus de quem chegou ao Planalto.
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

/** `presidencyYears`: anos de Presidência jogados no modo presidencial (substitui a estimativa da carreira). */
export const calculateCareerLegacy = (state: CareerState, content: CareerContent, presidencyYears: number | null = null): CareerLegacy => {
  const positions = allPositions(state);
  const { pointsPerRankYear, electionWonPoints, reputationPoints, presidencyBonus } = CAREER.legacy;
  const positionPoints = positions.reduce((acc, position) => {
    const years = position.id === PRESIDENT && presidencyYears !== null ? presidencyYears : yearsIn(position, state.turn);
    return acc + rankOf(content, position) * years * pointsPerRankYear;
  }, 0);
  const won = state.elections.filter((record) => record.won).length;
  const reachedPresidency = positions.some((position) => position.id === PRESIDENT);
  const score = Math.max(
    0,
    Math.round(positionPoints + won * electionWonPoints + (state.metrics.reputation - 50) * reputationPoints + (reachedPresidency ? presidencyBonus : 0)),
  );
  const tier = [...content.legacyTiers].sort((a, b) => b.minScore - a.minScore).find((entry) => score >= entry.minScore);
  const officeYears = positions
    .filter((position) => position.kind === 'office')
    .reduce((acc, position) => acc + (position.id === PRESIDENT && presidencyYears !== null ? presidencyYears : yearsIn(position, state.turn)), 0);
  return {
    highestOfficeId: highest(content, positions, 'office') as CareerOfficeId | null,
    highestAppointmentId: highest(content, positions, 'appointment'),
    yearsInOffice: officeYears,
    electionsWon: won,
    electionsLost: state.elections.length - won,
    score,
    title: tier?.title ?? '',
    description: tier?.description ?? '',
  };
};
