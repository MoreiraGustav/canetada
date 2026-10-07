import { DeltaIndicator } from '@/components/ui/DeltaIndicator';
import type { Tone } from '@/types';
import { formatSigned } from '@/utils/format';

interface MetricDeltaProps {
  /** Variação numérica (null = sem histórico). */
  delta: number | null;
  /** Variação já formatada; se omitida, formata `delta` com `decimals`. */
  formatted?: string | null;
  /** Tom vindo do view model; se omitido, "subir é bom". */
  tone?: Tone;
  decimals?: number;
  className?: string;
}

const directionOf = (delta: number): 'up' | 'down' | 'flat' => {
  if (delta === 0) return 'flat';
  return delta > 0 ? 'up' : 'down';
};

const toneOfSign = (delta: number): Tone => {
  if (delta === 0) return 'neutral';
  return delta > 0 ? 'positive' : 'negative';
};

/** Seta verde/vermelha de variação mensal, a partir de um delta numérico. */
export const MetricDelta = ({ delta, formatted, tone, decimals = 0, className = '' }: MetricDeltaProps) => {
  if (delta === null) return null;
  return (
    <DeltaIndicator
      formatted={formatted ?? formatSigned(delta, decimals)}
      direction={directionOf(delta)}
      tone={tone ?? toneOfSign(delta)}
      className={className}
    />
  );
};
