import { SummaryIndicatorDeltas } from '@/components/game/SummaryIndicatorDeltas';
import { SummaryRelationDeltas } from '@/components/game/SummaryRelationDeltas';
import { SummarySectorDeltas } from '@/components/game/SummarySectorDeltas';
import type { Country, CountryId, IndicatorDeltas, IndicatorView, SectorKey } from '@/types';

interface SummaryMonthPanelProps {
  indicatorViews: readonly IndicatorView[];
  deltas: IndicatorDeltas;
  sectorDeltas: Partial<Record<SectorKey, number>>;
  relationDeltas: Partial<Record<CountryId, number>> | undefined;
  countries: readonly Country[];
}

/** Box "Painel do mês": indicadores, setores e relações exteriores. */
export const SummaryMonthPanel = ({ indicatorViews, deltas, sectorDeltas, relationDeltas, countries }: SummaryMonthPanelProps) => (
  <aside aria-labelledby="month-panel-heading" className="border border-ink bg-paper-dark/60 p-4">
    <h2 id="month-panel-heading" className="mb-3 border-b-4 border-double border-ink pb-1 font-display text-xl font-bold text-ink">
      Painel do mês
    </h2>
    <div className="flex flex-col gap-4">
      <SummaryIndicatorDeltas views={indicatorViews} deltas={deltas} />
      <SummarySectorDeltas sectorDeltas={sectorDeltas} />
      <SummaryRelationDeltas relationDeltas={relationDeltas} countries={countries} />
    </div>
  </aside>
);
