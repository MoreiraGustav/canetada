import type { CareerPollView } from '@/types';
import { formatNumber } from '@/utils/format';

interface CareerPollListProps {
  polls: readonly CareerPollView[];
}

/** Escala das barras: 60% das intenções de voto já enchem a barra. */
const FULL_BAR_SHARE = 60;
const PERCENT = 100;
/** Variação mínima (p.p.) para a seta de tendência. */
const TREND_THRESHOLD = 0.5;

const barWidth = (share: number): string => `${Math.min(PERCENT, (share / FULL_BAR_SHARE) * PERCENT)}%`;

const trendOf = (current: number, previous: number | undefined): { icon: string; className: string; label: string } | null => {
  if (previous === undefined) return null;
  const delta = current - previous;
  if (Math.abs(delta) < TREND_THRESHOLD) return { icon: '→', className: 'text-ink-muted', label: 'estável' };
  return delta > 0 ? { icon: '▲', className: 'text-positive', label: 'subindo' } : { icon: '▼', className: 'text-negative', label: 'caindo' };
};

/** Pesquisas majoritárias: você × o principal adversário, semestre a semestre. */
export const CareerPollList = ({ polls }: CareerPollListProps) => (
  <ul className="flex flex-col gap-2" aria-label="Pesquisas de intenção de voto">
    {polls.map((poll, index) => {
      const trend = trendOf(poll.share, polls[index - 1]?.share);
      const opponent = poll.opponentName ?? 'Principal adversário';
      return (
        <li key={poll.dateLabel}>
          <p className="flex flex-wrap items-baseline gap-x-1 font-sans text-[11px] text-ink-soft">
            <span className="text-ink-muted">{poll.dateLabel}:</span>
            <strong className="text-ink">você {formatNumber(poll.share, 0)}%</strong>
            {poll.opponentShare !== null && (
              <span>
                × {opponent} {formatNumber(poll.opponentShare, 0)}%
              </span>
            )}
            {trend && (
              <span className={`font-semibold ${trend.className}`} title={trend.label}>
                {trend.icon}
              </span>
            )}
          </p>
          <div className="mt-0.5 grid grid-cols-2 gap-1" aria-hidden="true">
            <div className="h-2 bg-paper-deep">
              <div className="h-full bg-ink" style={{ width: barWidth(poll.share) }} />
            </div>
            <div className="h-2 bg-paper-deep">
              <div className="h-full bg-accent" style={{ width: barWidth(poll.opponentShare ?? 0) }} />
            </div>
          </div>
        </li>
      );
    })}
  </ul>
);
