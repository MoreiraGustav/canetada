import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CareerMetricView } from '@/types';
import { formatNumber, formatSigned } from '@/utils/format';

interface CareerMetricsPanelProps {
  metrics: readonly CareerMetricView[];
}

/** Abaixo disto o indicador aparece em alerta. */
const LOW_VALUE = 25;

/** Os cinco indicadores da carreira (0–100), com a variação do semestre. */
export const CareerMetricsPanel = ({ metrics }: CareerMetricsPanelProps) => (
  <section aria-label="Indicadores da carreira" className="flex flex-col gap-3 py-4">
    {metrics.map((metric) => (
      <div key={metric.key} title={metric.description}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            <span aria-hidden="true">{metric.icon}</span> {metric.label}
          </p>
          <p className="font-display text-lg font-bold tabular-nums text-ink">
            {formatNumber(metric.value, 0)}
            {metric.delta !== null && Math.round(metric.delta) !== 0 && (
              <span className={`ml-1 font-sans text-[11px] font-semibold ${metric.delta > 0 ? 'text-positive' : 'text-negative'}`}>
                {formatSigned(metric.delta, 0)}
              </span>
            )}
          </p>
        </div>
        <ProgressBar value={metric.value} tone={metric.value < LOW_VALUE ? 'negative' : 'ink'} height="xs" label={metric.label} />
      </div>
    ))}
  </section>
);
