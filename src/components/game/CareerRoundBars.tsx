import type { CareerRoundRowView } from '@/types';
import { formatNumber } from '@/utils/format';

interface CareerRoundBarsProps {
  rows: readonly CareerRoundRowView[];
  /** Fração apurada (0–1); 1 = resultado final. */
  progress?: number;
  /** Destaque dos dois primeiros (vão ao 2º turno). */
  highlightTop?: boolean;
}

const HALF = 50;
const PERCENT = 100;
const SHARE_DECIMALS = 1;
/** Oscilação das parciais no começo da apuração (pontos). */
const WOBBLE_POINTS = 3;
const WOBBLE_FREQUENCY = 9;
const RUNOFF_SPOTS = 2;

/** Parcial de cada candidato: oscila no começo e converge ao resultado. */
const partialShare = (share: number, progress: number, index: number): number =>
  Math.max(0, share + Math.sin(progress * WOBBLE_FREQUENCY + index) * WOBBLE_POINTS * (1 - progress));

/** 1º turno majoritário: barras por candidato, com a linha dos 50% dos votos válidos. */
export const CareerRoundBars = ({ rows, progress = 1, highlightTop = false }: CareerRoundBarsProps) => (
  <ol className="space-y-2">
    {rows.map((row, index) => {
      const share = partialShare(row.share, progress, index);
      const dimmed = highlightTop && index >= RUNOFF_SPOTS;
      return (
        <li key={row.name} className={dimmed ? 'opacity-60' : ''}>
          <div className="flex items-baseline justify-between gap-2 font-sans text-xs">
            <span className={`truncate ${row.isPlayer ? 'font-bold text-ink' : 'text-ink-soft'}`}>
              {row.name}
              {row.partyAcronym && <span className="text-ink-muted"> · {row.partyAcronym}</span>}
              {row.isPlayer && <span className="text-accent"> (você)</span>}
            </span>
            <span className="font-display text-lg font-black tabular-nums" style={{ color: row.color }}>
              {formatNumber(share, SHARE_DECIMALS)}%
            </span>
          </div>
          <div className="relative h-3 bg-paper-deep" aria-hidden="true">
            <div className="absolute inset-y-0 left-0" style={{ width: `${Math.min(share, PERCENT)}%`, backgroundColor: row.color }} />
            <div className="absolute inset-y-0 border-l border-dashed border-ink" style={{ left: `${HALF}%` }} />
          </div>
        </li>
      );
    })}
    <li className="text-right font-sans text-[10px] uppercase tracking-wider text-ink-muted">Linha tracejada: 50% dos votos válidos</li>
  </ol>
);
