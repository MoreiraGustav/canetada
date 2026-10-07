interface GoalOptionCardProps {
  icon: string;
  title: string;
  description: string;
  /** Critério de referência já formatado. */
  criteria: string;
  selected: boolean;
  /** Limite de metas atingido e esta não está selecionada. */
  disabled: boolean;
  onToggle: () => void;
}

/** Meta prioritária selecionável (checkbox) na escolha de metas do mandato. */
export const GoalOptionCard = ({ icon, title, description, criteria, selected, disabled, onToggle }: GoalOptionCardProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={selected}
    aria-disabled={disabled}
    onClick={disabled ? undefined : onToggle}
    className={`flex h-full w-full flex-col border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
      selected
        ? 'border-ink bg-paper-dark shadow-lifted ring-1 ring-ink'
        : disabled
          ? 'cursor-not-allowed border-rule bg-paper opacity-50'
          : 'border-rule bg-paper shadow-paper hover:border-ink'
    }`}
  >
    <span className="flex items-start justify-between gap-2">
      <span className="flex items-center gap-2 font-display text-lg font-bold leading-tight">
        <span aria-hidden="true" className="text-2xl">
          {icon}
        </span>
        {title}
      </span>
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 font-sans text-xs font-bold ${
          selected ? 'border-ink bg-ink text-paper' : 'border-ink-muted text-transparent'
        }`}
      >
        ✓
      </span>
    </span>
    <span className="mt-2 font-serif text-sm leading-relaxed text-ink-soft">{description}</span>
    <span className="mt-auto pt-3">
      <span className="block border-t border-rule pt-2 font-sans text-xs font-semibold text-ink">🎯 {criteria}</span>
    </span>
  </button>
);
