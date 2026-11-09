import { formatSigned } from '@/utils/format';

interface CareerRelationBarProps {
  /** −100 (inimigo) … 100 (aliado fiel). */
  relation: number;
  label: string;
}

/** A relação vai de −100 a 100: cada lado da barra cobre metade. */
const RELATION_RANGE = 100;
const HALF_PERCENT = 50;

/** Barra de relação centrada no zero: à esquerda (vermelho) hostil, à direita (verde) aliado. */
export const CareerRelationBar = ({ relation, label }: CareerRelationBarProps) => {
  const width = (Math.min(RELATION_RANGE, Math.abs(relation)) / RELATION_RANGE) * HALF_PERCENT;
  const positive = relation >= 0;
  return (
    <div>
      <div className="flex items-baseline justify-between font-sans text-[11px]">
        <span className="font-semibold uppercase tracking-wide text-ink-soft">Relação · {label}</span>
        <span className={`font-semibold tabular-nums ${positive ? 'text-positive' : 'text-negative'}`}>{formatSigned(relation, 0)}</span>
      </div>
      <div
        className="relative mt-1 h-2 bg-paper-deep"
        role="meter"
        aria-valuemin={-RELATION_RANGE}
        aria-valuemax={RELATION_RANGE}
        aria-valuenow={Math.round(relation)}
        aria-label={`Relação: ${label}`}
      >
        <div
          className={`absolute inset-y-0 ${positive ? 'bg-positive' : 'bg-negative'}`}
          style={positive ? { left: `${HALF_PERCENT}%`, width: `${width}%` } : { right: `${HALF_PERCENT}%`, width: `${width}%` }}
        />
        <div className="absolute -bottom-0.5 -top-0.5 left-1/2 w-px bg-ink" aria-hidden="true" />
      </div>
    </div>
  );
};
