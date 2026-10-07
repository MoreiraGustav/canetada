import { ImpactHintList } from './ImpactHintList';
import type { ImpactHint } from '@/types';
import { formatChance } from '@/utils/format';

interface DecisionNegotiationToggleProps {
  active: boolean;
  /** Chance de aprovação negociando (0–1). */
  negotiatedChance: number;
  /** Custo político da negociação (dicas qualitativas). */
  costHints: readonly ImpactHint[];
  onToggle: () => void;
}

/** Interruptor "Negociar cargos e emendas" de uma opção que depende do Congresso. */
export const DecisionNegotiationToggle = ({ active, negotiatedChance, costHints, onToggle }: DecisionNegotiationToggleProps) => (
  <div className={`border-t border-dashed border-rule px-3 py-2.5 ${active ? 'bg-ochre-light/50' : 'bg-paper-dark/60'}`}>
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className="flex w-full items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
    >
      <span
        aria-hidden="true"
        className={`relative inline-flex h-5 w-9 shrink-0 items-center border border-ink transition-colors ${active ? 'bg-ink' : 'bg-paper'}`}
      >
        <span className={`absolute h-3 w-3 transition-transform ${active ? 'translate-x-[1.1rem] bg-paper' : 'translate-x-0.5 bg-ink'}`} />
      </span>
      <span className="flex-1">
        <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-ink">Negociar cargos e emendas</span>
        <span className="block font-sans text-[11px] text-ink-soft">
          Chance com negociação: <strong className="tabular-nums text-ink">{formatChance(negotiatedChance)}</strong>
        </span>
      </span>
    </button>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Custo político:</span>
      <ImpactHintList hints={costHints} />
    </div>
  </div>
);
