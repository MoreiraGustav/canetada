import {
  CAREER_START_YEAR,
  ELECTION_INTERVAL_YEARS,
  ELECTION_SEMESTER,
  MUNICIPAL_ELECTION_REFERENCE_YEAR,
  SEMESTERS_PER_YEAR,
} from '@/constants/career';
import type { ElectionCycle } from '@/types';
import { getTurnFromDate } from './calendar';

const FIRST_MONTH_OF_SEMESTER = [1, 7] as const;

export interface CareerDate {
  year: number;
  /** 1 = janeiro a junho; 2 = julho a dezembro (eleições em outubro). */
  semester: number;
}

/** Turno da carreira (1-based) → ano e semestre. Turno 1 = 1º semestre de 2027. */
export const getCareerDate = (turn: number): CareerDate => ({
  year: CAREER_START_YEAR + Math.floor((turn - 1) / SEMESTERS_PER_YEAR),
  semester: ((turn - 1) % SEMESTERS_PER_YEAR) + 1,
});

/** Ano e semestre → turno da carreira. */
export const getCareerTurn = (year: number, semester: number): number => (year - CAREER_START_YEAR) * SEMESTERS_PER_YEAR + semester;

/** Ciclo eleitoral do ano: municipais em 2028, 2032...; gerais em 2030, 2034...; nada nos ímpares. */
export const getElectionCycle = (year: number): ElectionCycle | null => {
  if (year % ELECTION_INTERVAL_YEARS !== 0) return null;
  return (year - MUNICIPAL_ELECTION_REFERENCE_YEAR) % (2 * ELECTION_INTERVAL_YEARS) === 0 ? 'municipal' : 'geral';
};

/** Ciclo da eleição que acontece neste turno (2º semestre de ano par), ou null. */
export const getElectionAt = (turn: number): ElectionCycle | null => {
  const { year, semester } = getCareerDate(turn);
  return semester === ELECTION_SEMESTER ? getElectionCycle(year) : null;
};

/** Próximo turno de eleição a partir de `turn` (inclusive), opcionalmente de um ciclo. */
export const getNextElectionTurn = (turn: number, cycle?: ElectionCycle): number => {
  let candidate = turn;
  while (getElectionAt(candidate) === null || (cycle !== undefined && getElectionAt(candidate) !== cycle)) candidate += 1;
  return candidate;
};

/** "1º sem. 2027" */
export const formatCareerTurn = (turn: number): string => {
  const { year, semester } = getCareerDate(turn);
  return `${semester}º sem. ${year}`;
};

/** "1º semestre de 2027" */
export const formatCareerTurnLong = (turn: number): string => {
  const { year, semester } = getCareerDate(turn);
  return `${semester}º semestre de ${year}`;
};

/** Turno mensal do jogo presidencial (jan/2027 = 1) em que começa um semestre da carreira. */
export const careerTurnToMonthTurn = (turn: number): number => {
  const { year, semester } = getCareerDate(turn);
  return getTurnFromDate(year, FIRST_MONTH_OF_SEMESTER[semester - 1]);
};
