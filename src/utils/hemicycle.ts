/**
 * Geometria do plenário em hemiciclo: cadeiras em fileiras concêntricas, com
 * número de lugares proporcional ao raio, ordenadas da esquerda para a direita.
 */
import type { PartyVoteView } from '@/types';

export interface Seat {
  x: number;
  y: number;
  /** Ângulo em radianos (π = extrema esquerda, 0 = extrema direita). */
  angle: number;
}

export type SeatVote = 'yes' | 'no' | 'other';

export interface SeatAssignment extends Seat {
  partyId: string;
  vote: SeatVote;
  /** Ordem em que o voto acende no painel (0 = primeiro). */
  revealOrder: number;
}

export const HEMICYCLE = {
  width: 400,
  height: 214,
  centerX: 200,
  centerY: 206,
  innerRadius: 70,
  outerRadius: 194,
  /** Fileiras na Câmara (513) e numa Casa pequena como o Senado (81). */
  rows: 11,
  smallRows: 5,
  /** Até quantas cadeiras a Casa usa poucas fileiras. */
  smallChamberSeats: 100,
  /** Fração do espaçamento entre fileiras ocupada pelo diâmetro da cadeira. */
  seatFill: 0.78,
} as const;

const rowsFor = (total: number): number => (total <= HEMICYCLE.smallChamberSeats ? HEMICYCLE.smallRows : HEMICYCLE.rows);

/** Raio de cada cadeira (px) numa Casa com `total` cadeiras. */
export const seatRadius = (total: number): number =>
  (((HEMICYCLE.outerRadius - HEMICYCLE.innerRadius) / (rowsFor(total) - 1)) * HEMICYCLE.seatFill) / 2;

const rowRadius = (row: number, rows: number): number =>
  HEMICYCLE.innerRadius + (row * (HEMICYCLE.outerRadius - HEMICYCLE.innerRadius)) / (rows - 1);

/** Lugares por fileira, proporcionais ao raio, somando exatamente `total`. */
const seatsPerRow = (total: number): number[] => {
  const rows = rowsFor(total);
  const radii = Array.from({ length: rows }, (_, row) => rowRadius(row, rows));
  const sum = radii.reduce((acc, radius) => acc + radius, 0);
  const counts = radii.map((radius) => Math.floor((total * radius) / sum));
  let missing = total - counts.reduce((acc, count) => acc + count, 0);
  for (let row = rows - 1; missing > 0; row = (row - 1 + rows) % rows) {
    counts[row] += 1;
    missing -= 1;
  }
  return counts;
};

/** Posições de todas as cadeiras, da esquerda para a direita (ângulo decrescente). */
export const computeSeats = (total: number): Seat[] =>
  seatsPerRow(total)
    .flatMap((count, row, counts) => {
      const radius = rowRadius(row, counts.length);
      return Array.from({ length: count }, (_, index) => {
        const angle = Math.PI - (index * Math.PI) / Math.max(1, count - 1);
        return { x: HEMICYCLE.centerX + radius * Math.cos(angle), y: HEMICYCLE.centerY - radius * Math.sin(angle), angle };
      });
    })
    .sort((a, b) => b.angle - a.angle);

/** Constantes do hash clássico fract(sin(x)·k), usado só para espalhar visualmente a ordem dos votos. */
const HASH = { frequency: 12.9898, phase: 78.233, amplitude: 43758.5453 } as const;

/** Embaralhamento determinístico para os votos acenderem espalhados pelo plenário. */
const scatter = (index: number): number => {
  const value = Math.sin(index * HASH.frequency + HASH.phase) * HASH.amplitude;
  return value - Math.floor(value);
};

/**
 * Distribui as cadeiras entre as bancadas (em blocos, na ordem recebida — da
 * esquerda para a direita) e, dentro de cada bloco, os votos: sim, não e o resto.
 */
export const assignSeats = (seats: readonly Seat[], parties: readonly PartyVoteView[]): SeatAssignment[] => {
  const votes = parties.flatMap((party) => [
    ...Array.from({ length: party.yes }, () => ({ partyId: party.partyId, vote: 'yes' as const })),
    ...Array.from({ length: party.no }, () => ({ partyId: party.partyId, vote: 'no' as const })),
    ...Array.from({ length: party.other }, () => ({ partyId: party.partyId, vote: 'other' as const })),
  ]);
  const order = seats.map((_, index) => index).sort((a, b) => scatter(a) - scatter(b));
  const rank = new Map(order.map((seatIndex, position) => [seatIndex, position]));
  return seats.flatMap((seat, index) => {
    const vote = votes[index];
    return vote ? [{ ...seat, ...vote, revealOrder: rank.get(index) ?? index }] : [];
  });
};
