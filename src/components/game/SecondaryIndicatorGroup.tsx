import { useIndicatorViews } from '@/stores/selectors';
import { IndicatorCard } from './IndicatorCard';
import type { IndicatorKey } from '@/types';

interface SecondaryIndicatorGroupProps {
  title: string;
  /** Lista estável (constante de módulo) para não refazer a memoização a cada render. */
  keys: readonly IndicatorKey[];
}

/** Grupo temático de métricas secundárias (Economia, Social, Segurança…). */
export const SecondaryIndicatorGroup = ({ title, keys }: SecondaryIndicatorGroupProps) => {
  const indicators = useIndicatorViews(keys);
  return (
    <section aria-label={title}>
      <h3 className="mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink-soft">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {indicators.map((indicator) => (
          <IndicatorCard key={indicator.key} indicator={indicator} layout="tile" />
        ))}
      </div>
    </section>
  );
};
