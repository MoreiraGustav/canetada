import { Tooltip } from '@/components/ui/Tooltip';
import { MetricDelta } from './MetricDelta';
import type { IndicatorView } from '@/types';

interface IndicatorCardProps {
  indicator: IndicatorView;
  /** `row`: linha da barra lateral; `tile`: bloco compacto em grade. */
  layout?: 'row' | 'tile';
}

/** Indicador com valor, variação mensal (seta verde/vermelha) e explicação em tooltip. */
export const IndicatorCard = ({ indicator, layout = 'tile' }: IndicatorCardProps) => {
  const { info } = indicator;
  const isRow = layout === 'row';
  const explanation = (
    <span className="block">
      <span className="block font-semibold">{info.label}</span>
      <span className="mt-1 block">{info.description}</span>
      <span className="mt-1 block text-paper/70">Fonte: {info.source}</span>
    </span>
  );
  return (
    <Tooltip content={explanation} className="w-full" side="bottom">
      <div
        tabIndex={0}
        aria-label={`${info.label}: ${indicator.formatted}`}
        className={`w-full cursor-help border-rule bg-paper text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${isRow ? 'border-b py-2.5' : 'border p-3'}`}
      >
        <p className="flex items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-soft">
          <span aria-hidden="true">{info.icon}</span>
          {info.shortLabel}
          <span aria-hidden="true" className="text-ink-muted">
            ⓘ
          </span>
        </p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2">
          <span className={`font-display font-bold tabular-nums leading-none text-ink ${isRow ? 'text-2xl' : 'text-xl'}`}>
            {indicator.formatted}
          </span>
          <MetricDelta delta={indicator.delta} formatted={indicator.formattedDelta} tone={indicator.tone} />
        </div>
      </div>
    </Tooltip>
  );
};
