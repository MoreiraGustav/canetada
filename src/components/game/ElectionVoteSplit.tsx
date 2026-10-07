import { useCountUp } from '@/hooks/useCountUp';
import { formatNumber } from '@/utils/format';

interface ElectionVoteSplitProps {
  playerName: string;
  playerColor: string;
  playerShare: number;
  opponentName: string;
  opponentColor: string;
}

const FULL_SHARE = 100;
const SHARE_DECIMALS = 1;

/** Placar do 2º turno com contagem animada e barra dividida. */
export const ElectionVoteSplit = ({ playerName, playerColor, playerShare, opponentName, opponentColor }: ElectionVoteSplitProps) => {
  const counted = useCountUp(playerShare);
  const opponentShare = FULL_SHARE - playerShare;
  const countedOpponent = (counted / playerShare || 0) * opponentShare;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: playerColor }}>
            {playerName}
          </p>
          <p className="font-display text-5xl font-black tabular-nums leading-none sm:text-7xl">{formatNumber(counted, SHARE_DECIMALS)}%</p>
        </div>
        <div className="min-w-0 text-right">
          <p className="truncate font-sans text-xs font-semibold uppercase tracking-wider text-ink-muted">{opponentName}</p>
          <p className="font-display text-3xl font-bold tabular-nums leading-none text-ink-soft sm:text-4xl">
            {formatNumber(countedOpponent, SHARE_DECIMALS)}%
          </p>
        </div>
      </div>
      <div className="relative mt-4 flex h-4 w-full overflow-hidden bg-paper-deep" aria-hidden="true">
        <div className="h-full" style={{ width: `${counted}%`, backgroundColor: playerColor }} />
        <div className="ml-auto h-full" style={{ width: `${countedOpponent}%`, backgroundColor: opponentColor, opacity: 0.6 }} />
        <div className="absolute -bottom-1 -top-1 left-1/2 w-0.5 bg-ink" />
      </div>
      <p className="mt-1 text-center font-sans text-[10px] uppercase tracking-wider text-ink-muted">50% dos votos válidos</p>
    </div>
  );
};
