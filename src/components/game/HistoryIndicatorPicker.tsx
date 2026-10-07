import { INDICATOR_INFO } from '@/constants/metrics';
import type { IndicatorKey } from '@/types';

interface HistoryIndicatorPickerProps {
  options: readonly IndicatorKey[];
  selected: IndicatorKey;
  onSelect: (key: IndicatorKey) => void;
}

const CHIP_BASE =
  'border px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy';
const CHIP_SELECTED = 'border-ink bg-ink text-paper';
const CHIP_IDLE = 'border-rule text-ink-soft hover:border-ink-soft hover:text-ink';

/** Seletor do indicador exibido no gráfico histórico. */
export const HistoryIndicatorPicker = ({ options, selected, onSelect }: HistoryIndicatorPickerProps) => (
  <div role="radiogroup" aria-label="Indicador do gráfico" className="mb-4 flex flex-wrap gap-1.5">
    {options.map((key) => (
      <button
        key={key}
        type="button"
        role="radio"
        aria-checked={key === selected}
        onClick={() => onSelect(key)}
        className={`${CHIP_BASE} ${key === selected ? CHIP_SELECTED : CHIP_IDLE}`}
      >
        {INDICATOR_INFO[key].shortLabel}
      </button>
    ))}
  </div>
);
