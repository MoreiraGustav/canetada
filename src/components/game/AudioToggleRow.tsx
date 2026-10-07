interface AudioToggleRowProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

/** Linha com rótulo e chave liga/desliga (role="switch"). */
export const AudioToggleRow = ({ label, checked, onToggle }: AudioToggleRowProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onToggle}
    className="flex w-full items-center justify-between gap-3 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
  >
    <span>{label}</span>
    <span className={`relative inline-flex h-5 w-9 shrink-0 border border-ink transition-colors ${checked ? 'bg-ink' : 'bg-paper-deep'}`}>
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 transition-all ${checked ? 'left-[18px] bg-paper' : 'left-0.5 bg-ink'}`}
        aria-hidden="true"
      />
    </span>
  </button>
);
