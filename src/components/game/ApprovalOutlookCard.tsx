import type { ApprovalDriverView, ApprovalOutlookView } from '@/types';
import { formatNumber, formatSigned } from '@/utils/format';

interface ApprovalOutlookCardProps {
  outlook: ApprovalOutlookView;
}

const TREND_TEXT: Record<ApprovalOutlookView['trend'], { icon: string; text: string; className: string }> = {
  up: { icon: '▲', text: 'subindo para', className: 'text-positive' },
  down: { icon: '▼', text: 'caindo para', className: 'text-negative' },
  flat: { icon: '■', text: 'estável em', className: 'text-ink-soft' },
};

interface DriverListProps {
  title: string;
  drivers: readonly ApprovalDriverView[];
  tone: 'positive' | 'negative';
}

const DriverList = ({ title, drivers, tone }: DriverListProps) => {
  if (drivers.length === 0) return null;
  return (
    <div>
      <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted">{title}</p>
      <ul>
        {drivers.map((driver) => (
          <li key={driver.key} className="flex items-baseline justify-between gap-2 font-sans text-xs text-ink">
            <span className="truncate">
              <span aria-hidden="true">{driver.icon}</span> {driver.label}
            </span>
            <span className={`shrink-0 font-semibold tabular-nums ${tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
              {formatSigned(driver.points, 1)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Termômetro da aprovação: para onde a popularidade caminha se nada mudar e o
 * que mais a puxa para cima e para baixo (em pontos, desde o início do governo).
 */
export const ApprovalOutlookCard = ({ outlook }: ApprovalOutlookCardProps) => {
  const trend = TREND_TEXT[outlook.trend];
  return (
    <section aria-labelledby="approval-outlook-title" className="mt-6">
      <h2
        id="approval-outlook-title"
        className="mb-2 border-b border-ink pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent"
      >
        Termômetro da aprovação
      </h2>
      <p className={`font-sans text-sm font-semibold ${trend.className}`}>
        <span aria-hidden="true">{trend.icon}</span> Tendência: {trend.text} {formatNumber(outlook.target, 0)}%
      </p>
      <p className="mb-2 font-sans text-[10px] leading-snug text-ink-muted">Onde a aprovação chega se nada mudar. Pontos desde a posse.</p>
      <div className="flex flex-col gap-2">
        <DriverList title="Puxam para baixo" drivers={outlook.drags} tone="negative" />
        <DriverList title="Puxam para cima" drivers={outlook.supports} tone="positive" />
      </div>
    </section>
  );
};
