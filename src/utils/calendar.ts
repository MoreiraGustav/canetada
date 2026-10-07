import { GAME_START_MONTH, GAME_START_YEAR, MONTH_NAMES, MONTH_SHORT_NAMES, MONTHS_PER_YEAR } from '@/constants/game';

export interface TurnDate {
  /** Mês do calendário (1–12). */
  month: number;
  year: number;
}

/** Converte um turno (1-based) em mês/ano. Turno 1 = Jan/2027. */
export const getTurnDate = (turn: number): TurnDate => {
  const monthIndex = GAME_START_MONTH - 1 + (turn - 1);
  return {
    month: (monthIndex % MONTHS_PER_YEAR) + 1,
    year: GAME_START_YEAR + Math.floor(monthIndex / MONTHS_PER_YEAR),
  };
};

/** Converte mês/ano no turno correspondente (pode ser ≤ 0 se anterior ao início). */
export const getTurnFromDate = (year: number, month: number): number =>
  (year - GAME_START_YEAR) * MONTHS_PER_YEAR + (month - GAME_START_MONTH) + 1;

/** "Mar/2027" */
export const formatTurnShort = (turn: number): string => {
  const { month, year } = getTurnDate(turn);
  return `${MONTH_SHORT_NAMES[month - 1]}/${year}`;
};

/** "Mar/27" — para eixos de gráfico. */
export const formatTurnAxis = (turn: number): string => {
  const { month, year } = getTurnDate(turn);
  return `${MONTH_SHORT_NAMES[month - 1]}/${String(year).slice(-2)}`;
};

/** "Março de 2027" */
export const formatTurnLong = (turn: number): string => {
  const { month, year } = getTurnDate(turn);
  return `${MONTH_NAMES[month - 1]} de ${year}`;
};
