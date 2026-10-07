interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  onChange: (value: number) => void;
}

export const Slider = ({ id, label, value, min, max, step = 1, leftLabel, rightLabel, onChange }: SliderProps) => (
  <div className="w-full">
    <label htmlFor={id} className="mb-2 block font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
      {label}
    </label>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full cursor-pointer accent-ink"
    />
    {(leftLabel || rightLabel) && (
      <div className="mt-1 flex justify-between font-sans text-[11px] uppercase tracking-wide text-ink-muted">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    )}
  </div>
);
