import { useState } from 'react';
import { useHistorySeries } from '@/stores/selectors';
import { HistoryChart } from './HistoryChart';
import { HistoryIndicatorPicker } from './HistoryIndicatorPicker';
import { INDICATOR_INFO } from '@/constants/metrics';
import type { IndicatorKey } from '@/types';

/** Indicadores disponíveis no seletor do gráfico (aprovação é o padrão). */
const CHART_INDICATORS: readonly IndicatorKey[] = [
  'approval',
  'gdpGrowth',
  'inflation',
  'unemployment',
  'exchangeRate',
  'debt',
  'congressSupport',
  'selic',
  'primaryBalance',
  'gdp',
  'poverty',
  'prestige',
];

/** Aba "Gráficos": evolução histórica de um indicador à escolha. */
export const HistoryChartPanel = () => {
  const [indicator, setIndicator] = useState<IndicatorKey>('approval');
  const series = useHistorySeries();
  const info = INDICATOR_INFO[indicator];
  return (
    <div>
      <HistoryIndicatorPicker options={CHART_INDICATORS} selected={indicator} onSelect={setIndicator} />
      <h3 className="font-display text-lg font-bold text-ink">
        <span aria-hidden="true" className="mr-1.5">
          {info.icon}
        </span>
        {info.label}
      </h3>
      <p className="mb-3 font-sans text-[11px] text-ink-muted">
        {info.description} Fonte de referência: {info.source}.
      </p>
      {series.length === 0 ? (
        <p className="font-serif italic text-ink-soft">Ainda não há histórico para exibir.</p>
      ) : (
        <>
          <HistoryChart data={series} indicator={indicator} />
          {series.length < 2 && (
            <p className="mt-2 font-sans text-[11px] italic text-ink-muted">
              O gráfico ganha forma a partir do fechamento do primeiro mês de governo.
            </p>
          )}
        </>
      )}
    </div>
  );
};
