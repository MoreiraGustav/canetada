import { DeltaIndicator } from '@/components/ui/DeltaIndicator';
import type { Tone } from '@/types';

interface SummaryDeltaRowProps {
  label: string;
  icon?: string;
  /** Variação numérica (define a seta). */
  delta: number;
  /** Variação formatada com sinal, ex.: "+0,3". */
  formattedDelta: string;
  tone: Tone;
  /** Valor atual formatado (opcional). */
  value?: string;
}

const getDirection = (delta: number): 'up' | 'down' | 'flat' => {
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
};

/** Linha do "Painel do mês": rótulo, valor atual e variação no mês. */
export const SummaryDeltaRow = ({ label, icon, delta, formattedDelta, tone, value }: SummaryDeltaRowProps) => (
  <li className="flex items-center justify-between gap-3 border-b border-rule py-1.5 last:border-b-0">
    <span className="flex min-w-0 items-center gap-2 font-sans text-xs text-ink-soft">
      {icon && <span aria-hidden="true">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
    <span className="flex shrink-0 items-center gap-2">
      {value && <span className="font-sans text-xs font-semibold tabular-nums text-ink">{value}</span>}
      <DeltaIndicator formatted={formattedDelta} direction={getDirection(delta)} tone={tone} className="min-w-[3.5rem] justify-end" />
    </span>
  </li>
);
