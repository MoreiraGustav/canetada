interface ResultRevelationsProps {
  /** Rótulos dos esquemas revelados durante ou depois do mandato. */
  revelations: readonly string[];
}

/** Box "A conta chegou": esquemas de corrupção que vieram à tona e mancharam o legado. */
export const ResultRevelations = ({ revelations }: ResultRevelationsProps) => {
  if (revelations.length === 0) return null;
  return (
    <section aria-labelledby="revelations-heading" className="border border-negative bg-negative-light/40 p-4">
      <h3 id="revelations-heading" className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-negative">
        Investigações · A conta chegou
      </h3>
      <p className="mt-1 font-serif text-sm leading-relaxed text-ink-soft">
        Durante ou depois do governo, a Polícia Federal e a imprensa revelaram esquemas aceitos pelo Planalto:
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {revelations.map((label) => (
          <li key={label} className="font-serif text-base font-semibold text-ink">
            <span aria-hidden="true" className="mr-2 text-negative">
              ●
            </span>
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
};
