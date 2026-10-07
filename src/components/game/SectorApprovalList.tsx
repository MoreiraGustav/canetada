import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tooltip } from '@/components/ui/Tooltip';
import { MetricDelta } from './MetricDelta';
import type { SectorView } from '@/types';
import { formatNumber } from '@/utils/format';

interface SectorApprovalListProps {
  sectors: readonly SectorView[];
}

const PERCENT = 100;
/** Faixas de leitura da aprovação setorial (mesmas do rótulo "aprovação sólida/frágil"). */
const SOLID_APPROVAL = 45;
const FRAGILE_APPROVAL = 30;

const toneForApproval = (value: number): 'positive' | 'neutral' | 'negative' => {
  if (value >= SOLID_APPROVAL) return 'positive';
  if (value >= FRAGILE_APPROVAL) return 'neutral';
  return 'negative';
};

/** Aprovação por setor da sociedade, com peso na média e sensibilidades (GDD §3.3). */
export const SectorApprovalList = ({ sectors }: SectorApprovalListProps) => (
  <ul className="divide-y divide-rule border-y border-rule">
    {sectors.map((sector) => (
      <li key={sector.key} className="py-2.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <Tooltip content={`Sensível a: ${sector.sensitivity}. Pesa ${formatNumber(sector.weight * PERCENT)}% na aprovação geral.`}>
            <span tabIndex={0} className="cursor-help font-serif text-sm font-semibold text-ink">
              <span aria-hidden="true" className="mr-1.5">
                {sector.icon}
              </span>
              {sector.label}
              <span aria-hidden="true" className="ml-1 font-sans text-[10px] text-ink-muted">
                ⓘ
              </span>
            </span>
          </Tooltip>
          <span className="flex items-center gap-2 font-sans text-[11px] text-ink-soft">
            <span className="uppercase tracking-wider text-ink-muted">peso {formatNumber(sector.weight * PERCENT)}%</span>
            <strong className="tabular-nums text-ink">{formatNumber(sector.value)}%</strong>
            <MetricDelta delta={sector.delta} />
          </span>
        </div>
        <ProgressBar value={sector.value} tone={toneForApproval(sector.value)} height="xs" label={`Aprovação: ${sector.label}`} />
      </li>
    ))}
  </ul>
);
