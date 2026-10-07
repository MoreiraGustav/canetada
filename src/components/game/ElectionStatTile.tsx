interface ElectionStatTileProps {
  label: string;
  value: string;
  note?: string;
}

/** Dado de apuração em destaque (1º turno, margem, capital político). */
export const ElectionStatTile = ({ label, value, note }: ElectionStatTileProps) => (
  <div className="border-t-2 border-ink pt-2">
    <p className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold tabular-nums leading-tight sm:text-3xl">{value}</p>
    {note && <p className="mt-1 font-serif text-xs leading-relaxed text-ink-soft">{note}</p>}
  </div>
);
