import type { ImpactHint } from '@/types';

interface ImpactHintListProps {
  hints: readonly ImpactHint[];
  /** Mostra o selo "efeito gradual" ao final da lista. */
  hasDelayedEffects?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<ImpactHint['tone'], string> = {
  positive: 'border-positive/40 bg-positive-light/60 text-positive',
  negative: 'border-negative/40 bg-negative-light/60 text-negative',
  neutral: 'border-rule bg-paper-dark text-ink-soft',
};

/** Dicas qualitativas de impacto (sem números exatos): "Inflação ▲▲". */
export const ImpactHintList = ({ hints, hasDelayedEffects = false, className = '' }: ImpactHintListProps) => {
  if (hints.length === 0 && !hasDelayedEffects) {
    return <p className={`font-sans text-[11px] italic text-ink-muted ${className}`}>Efeitos pouco perceptíveis</p>;
  }
  return (
    <ul className={`flex flex-wrap gap-1 ${className}`} aria-label="Efeitos esperados">
      {hints.map((hint) => (
        <li
          key={hint.key}
          className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-sans text-[11px] font-semibold ${TONE_CLASSES[hint.tone]}`}
        >
          {hint.label}
          <span aria-label={hint.direction === 'up' ? 'sobe' : 'cai'} className="text-[9px] tracking-tighter">
            {(hint.direction === 'up' ? '▲' : '▼').repeat(hint.intensity)}
          </span>
        </li>
      ))}
      {hasDelayedEffects && (
        <li className="inline-flex items-center border border-navy/40 bg-navy-light/60 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-navy">
          ⏳ efeito gradual
        </li>
      )}
    </ul>
  );
};
