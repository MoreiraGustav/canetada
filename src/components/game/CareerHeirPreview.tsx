import { PortraitImage } from '@/components/ui/PortraitImage';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { HeirMetricPreview, HeirSetupView } from '@/types';
import { formatNumber } from '@/utils/format';

interface CareerHeirPreviewProps {
  setup: HeirSetupView;
  metrics: readonly HeirMetricPreview[];
}

/** O que o(a) herdeiro(a) recebe: o padrinho, o partido, a cidade e os indicadores de partida. */
export const CareerHeirPreview = ({ setup, metrics }: CareerHeirPreviewProps) => (
  <aside aria-label="Herança política" className="border border-rule border-t-4 border-t-ochre bg-paper p-4 shadow-paper">
    <div className="flex items-center gap-3">
      <PortraitImage portrait={setup.parentPortrait} name={setup.parentName} size="md" />
      <div className="min-w-0">
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ochre">👑 {setup.generation}ª geração</p>
        <p className="font-serif text-sm text-ink-soft">
          <strong className="text-ink">{setup.parentName}</strong> ({setup.legacyTitle}) vira o seu padrinho político.
        </p>
      </div>
    </div>
    <p className="mt-3 font-sans text-[11px] text-ink-soft">
      Começa no {setup.startLabel}, em {setup.cityName} · {setup.uf}, já filiado(a) ao <strong className="text-ink">{setup.partyAcronym}</strong>.
    </p>
    <ul className="mt-3 flex flex-col gap-2">
      {metrics.map((metric) => (
        <li key={metric.key}>
          <div className="flex justify-between font-sans text-[11px] font-semibold text-ink-soft">
            <span>
              <span aria-hidden="true">{metric.icon}</span> {metric.label}
            </span>
            <span className="tabular-nums">{formatNumber(metric.value, 0)}</span>
          </div>
          <ProgressBar value={metric.value} tone="neutral" height="xs" label={metric.label} />
        </li>
      ))}
    </ul>
  </aside>
);
