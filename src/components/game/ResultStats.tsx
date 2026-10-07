import type { GameStats } from '@/types';
import { formatNumber } from '@/utils/format';

interface ResultStatsProps {
  stats: GameStats;
}

interface StatItem {
  label: string;
  value: string;
}

const buildItems = (stats: GameStats): StatItem[] => [
  { label: 'Leis aprovadas', value: formatNumber(stats.lawsApproved) },
  { label: 'Leis rejeitadas', value: formatNumber(stats.lawsRejected) },
  { label: 'Negociações com a base', value: formatNumber(stats.negotiations) },
  { label: 'Crises bem conduzidas', value: `${formatNumber(stats.crisesHandled)} de ${formatNumber(stats.crisesFaced)}` },
  { label: 'Ações diplomáticas', value: formatNumber(stats.diplomaticActions) },
  { label: 'Eventos enfrentados', value: formatNumber(stats.eventsFaced) },
  { label: 'Aprovação máxima', value: `${formatNumber(stats.peakApproval)}%` },
  { label: 'Aprovação mínima', value: `${formatNumber(stats.lowestApproval)}%` },
];

/** Números do governo (estatísticas da partida). */
export const ResultStats = ({ stats }: ResultStatsProps) => (
  <section aria-labelledby="result-stats-heading">
    <h3 id="result-stats-heading" className="mb-3 border-b border-ink pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
      O governo em números
    </h3>
    <dl className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4">
      {buildItems(stats).map((item) => (
        <div key={item.label} className="flex flex-col-reverse justify-end bg-paper p-3">
          <dt className="mt-0.5 font-sans text-[11px] uppercase leading-tight tracking-wide text-ink-muted">{item.label}</dt>
          <dd className="font-display text-2xl font-bold tabular-nums text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  </section>
);
