import { IndicatorCard } from './IndicatorCard';
import type { IndicatorView } from '@/types';

interface IndicatorPanelProps {
  indicators: readonly IndicatorView[];
}

/**
 * Indicadores principais: grade compacta no topo em telas pequenas,
 * coluna lateral fixa no desktop (GDD §5.1).
 */
export const IndicatorPanel = ({ indicators }: IndicatorPanelProps) => (
  <section aria-labelledby="primary-indicators-title">
    <h2
      id="primary-indicators-title"
      className="mb-2 border-b border-ink pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent"
    >
      Indicadores do país
    </h2>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.key} indicator={indicator} layout="tile" />
      ))}
    </div>
    <div className="hidden lg:block">
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.key} indicator={indicator} layout="row" />
      ))}
    </div>
    <p className="mt-2 font-sans text-[10px] leading-snug text-ink-muted">
      Toque ou passe o mouse sobre um indicador para entender o que ele mede. Setas mostram a variação desde o mês anterior.
    </p>
  </section>
);
