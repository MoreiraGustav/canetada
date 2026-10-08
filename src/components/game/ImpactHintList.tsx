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

/** Marca que diz se o efeito é bom ou ruim, independentemente da seta (que só diz sobe/cai). */
const TONE_MARK: Record<ImpactHint['tone'], string> = { positive: '✓', negative: '✗', neutral: '' };
const TONE_WORD: Record<ImpactHint['tone'], string> = { positive: 'ganho', negative: 'custo', neutral: 'mudança' };
const INTENSITY_WORD: Record<ImpactHint['intensity'], string> = { 1: 'pouco', 2: 'moderadamente', 3: 'muito' };

const describeHint = (hint: ImpactHint): string =>
  `${TONE_WORD[hint.tone]}: ${hint.label} ${hint.direction === 'up' ? 'sobe' : 'cai'} ${INTENSITY_WORD[hint.intensity]}${hint.goal ? ' (sua meta)' : ''}`;

/**
 * Dicas qualitativas de impacto (sem números exatos): "✓ Inflação ▼▼".
 * ✓ verde = ganho, ✗ vermelho = custo; as setas dizem só se o indicador sobe ou cai.
 * Indicadores das metas do jogador ganham 🎯.
 */
export const ImpactHintList = ({ hints, hasDelayedEffects = false, className = '' }: ImpactHintListProps) => {
  if (hints.length === 0 && !hasDelayedEffects) {
    return <p className={`font-sans text-[11px] italic text-ink-muted ${className}`}>Efeitos pouco perceptíveis</p>;
  }
  return (
    <ul className={`flex flex-wrap gap-1 ${className}`} aria-label="Efeitos esperados">
      {hints.map((hint) => (
        <li
          key={hint.key}
          title={describeHint(hint)}
          aria-label={describeHint(hint)}
          className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-sans text-[11px] font-semibold ${TONE_CLASSES[hint.tone]} ${hint.goal ? 'ring-1 ring-current' : ''}`}
        >
          {TONE_MARK[hint.tone] && (
            <span aria-hidden="true" className="font-bold">
              {TONE_MARK[hint.tone]}
            </span>
          )}
          {hint.goal && <span aria-hidden="true">🎯</span>}
          <span aria-hidden="true">{hint.label}</span>
          <span aria-hidden="true" className="text-[9px] tracking-tighter">
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
