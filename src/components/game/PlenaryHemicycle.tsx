import { VOTE_COLORS } from '@/constants/theme';
import type { SeatAssignment } from '@/utils/hemicycle';
import { HEMICYCLE, SEAT_RADIUS } from '@/utils/hemicycle';

interface PlenaryHemicycleProps {
  /** Cadeiras com bancada, voto e ordem de acendimento. */
  seats: readonly SeatAssignment[];
  /** Quantos votos já acenderam no painel (0 até o total de cadeiras). */
  revealed: number;
}

/** Plenário da Câmara: cada ponto é um deputado; o voto acende aos poucos no painel eletrônico. */
export const PlenaryHemicycle = ({ seats, revealed }: PlenaryHemicycleProps) => (
  <svg viewBox={`0 0 ${HEMICYCLE.width} ${HEMICYCLE.height}`} className="mx-auto h-auto w-full max-w-xl" aria-hidden="true">
    {seats.map((seat, index) => (
      <circle
        key={index}
        cx={seat.x}
        cy={seat.y}
        r={SEAT_RADIUS}
        fill={seat.revealOrder < revealed ? VOTE_COLORS[seat.vote] : VOTE_COLORS.pending}
      />
    ))}
  </svg>
);
