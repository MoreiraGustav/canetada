interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: string;
}

interface TabsProps<T extends string> {
  items: ReadonlyArray<TabItem<T>>;
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export const Tabs = <T extends string>({ items, active, onChange, className = '' }: TabsProps<T>) => (
  <div role="tablist" className={`flex gap-1 overflow-x-auto border-b border-ink ${className}`}>
    {items.map((item) => {
      const selected = item.id === active;
      return (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(item.id)}
          className={`whitespace-nowrap px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${selected ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dark hover:text-ink'}`}
        >
          {item.icon && (
            <span className="mr-1" aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.label}
        </button>
      );
    })}
  </div>
);
