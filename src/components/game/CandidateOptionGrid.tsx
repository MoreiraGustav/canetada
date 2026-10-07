export interface CandidateOptionItem<T extends string> {
  id: T;
  title: string;
  description: string;
  icon?: string;
  /** Cor de destaque (hex), ex.: cor do partido. */
  color?: string;
}

interface CandidateOptionGridProps<T extends string> {
  label: string;
  items: ReadonlyArray<CandidateOptionItem<T>>;
  value: T;
  onChange: (id: T) => void;
}

/** Grade de opções exclusivas (radio) do formulário de candidato. */
export const CandidateOptionGrid = <T extends string>({ label, items, value, onChange }: CandidateOptionGridProps<T>) => (
  <fieldset>
    <legend className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</legend>
    <div role="radiogroup" aria-label={label} className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(item.id)}
            style={item.color ? { borderLeftColor: item.color } : undefined}
            className={`border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
              item.color ? 'border-l-4' : ''
            } ${selected ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'}`}
          >
            <span className="block font-sans text-sm font-semibold text-ink">
              {item.icon && (
                <span className="mr-1" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.title}
            </span>
            <span className="mt-1 block font-serif text-xs leading-relaxed text-ink-soft">{item.description}</span>
          </button>
        );
      })}
    </div>
  </fieldset>
);
