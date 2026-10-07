interface SetupOptionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  icon?: string;
  /** Linha de detalhe (ex.: "12 meses · ~20–30 min"). */
  meta?: string;
}

/** Opção selecionável (radio) da configuração da partida. */
export const SetupOptionCard = ({ title, description, selected, onSelect, icon, meta }: SetupOptionCardProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={`flex h-full w-full flex-col border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
      selected ? 'border-ink bg-paper-dark shadow-lifted ring-1 ring-ink' : 'border-rule bg-paper shadow-paper hover:border-ink'
    }`}
  >
    <span className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 font-display text-xl font-bold">
        {icon && <span aria-hidden="true">{icon}</span>}
        {title}
      </span>
      <span
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 rounded-full border-2 ${selected ? 'border-ink bg-ink shadow-[inset_0_0_0_2px_theme(colors.paper.DEFAULT)]' : 'border-ink-muted'}`}
      />
    </span>
    {meta && <span className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{meta}</span>}
    <span className="mt-2 font-serif text-sm leading-relaxed text-ink-soft">{description}</span>
  </button>
);
