import { toneForDelta } from '@/stores/selectors';
import { SummaryDeltaRow } from '@/components/game/SummaryDeltaRow';
import type { IndicatorDeltas, IndicatorView } from '@/types';
import { formatIndicatorDelta } from '@/utils/format';

interface SummaryIndicatorDeltasProps {
  /** Indicadores principais com valor atual. */
  views: readonly IndicatorView[];
  /** Variação de cada indicador no mês (relatório do turno). */
  deltas: IndicatorDeltas;
}

/** Indicadores principais: valor atual e variação no mês. */
export const SummaryIndicatorDeltas = ({ views, deltas }: SummaryIndicatorDeltasProps) => (
  <div>
    <h3 className="mb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink">Indicadores</h3>
    <ul>
      {views.map((view) => {
        const delta = deltas[view.key] ?? 0;
        return (
          <SummaryDeltaRow
            key={view.key}
            label={view.info.shortLabel}
            icon={view.info.icon}
            value={view.formatted}
            delta={delta}
            formattedDelta={formatIndicatorDelta(view.key, delta)}
            tone={toneForDelta(view.key, delta)}
          />
        );
      })}
    </ul>
  </div>
);
