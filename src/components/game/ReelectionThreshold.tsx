import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatNumber } from '@/utils/format';

interface ReelectionThresholdProps {
  /** Aprovação final do mandato (0–100). */
  approval: number;
  /** Aprovação mínima exigida pela dificuldade. */
  threshold: number;
  difficultyLabel: string;
  reelected: boolean;
}

/** Contexto da apuração: aprovação final comparada ao limiar de reeleição. */
export const ReelectionThreshold = ({ approval, threshold, difficultyLabel, reelected }: ReelectionThresholdProps) => {
  const gap = approval - threshold;
  return (
    <Card emphasis>
      <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink">Análise · o que decidiu a eleição</h3>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-3xl font-black tabular-nums text-ink">{formatNumber(approval)}%</p>
          <p className="font-sans text-[11px] uppercase tracking-wide text-ink-muted">Aprovação ao fim do mandato</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-black tabular-nums text-ink-soft">{formatNumber(threshold)}%</p>
          <p className="font-sans text-[11px] uppercase tracking-wide text-ink-muted">Mínimo para reeleição</p>
        </div>
      </div>
      <ProgressBar value={approval} marker={threshold} tone={reelected ? 'positive' : 'negative'} label="Aprovação final" className="mt-3" />
      <p className="mt-3 font-serif text-sm leading-relaxed text-ink-soft">
        No nível {difficultyLabel}, o eleitorado reconduz o presidente que encerra o mandato com ao menos {formatNumber(threshold)}% de
        aprovação. {reelected ? 'O governo superou a marca' : 'O governo ficou abaixo da marca'} por{' '}
        <strong className="text-ink">{formatNumber(Math.abs(gap))} ponto(s)</strong>.
      </p>
    </Card>
  );
};
