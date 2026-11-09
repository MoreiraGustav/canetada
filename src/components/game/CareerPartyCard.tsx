import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CareerPartyOptionView, Tone } from '@/types';
import { CAREER_LEVEL_LABELS } from '@/constants/career';

interface CareerPartyCardProps {
  view: CareerPartyOptionView;
  selected: boolean;
  onSelect: (partyId: string) => void;
}

/** Multiplicador de ganho de influência a partir do qual o crescimento é rápido (ou lento, abaixo do outro). */
const FAST_GROWTH = 1.1;
const SLOW_GROWTH = 0.9;
/** Afinidade (0–100) a partir da qual o partido é "casa" (ou estranho, abaixo da outra). */
const HIGH_FIT = 70;
const LOW_FIT = 40;

const growthLabel = (factor: number): { label: string; tone: Tone } => {
  if (factor >= FAST_GROWTH) return { label: 'rápido', tone: 'positive' };
  if (factor <= SLOW_GROWTH) return { label: 'lento', tone: 'negative' };
  return { label: 'normal', tone: 'neutral' };
};

const fitTone = (fit: number): Tone => {
  if (fit >= HIGH_FIT) return 'positive';
  return fit <= LOW_FIT ? 'negative' : 'neutral';
};

/** Partido na ficha de filiação: afinidade, bancada, ritmo de crescimento e onde governa. */
export const CareerPartyCard = ({ view, selected, onSelect }: CareerPartyCardProps) => {
  const { party, fit, influenceFactor, governs } = view;
  const growth = growthLabel(influenceFactor);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(party.id)}
      style={{ borderLeftColor: party.color }}
      className={`flex h-full w-full flex-col border border-l-4 p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
        selected ? 'border-ink bg-paper-dark shadow-lifted ring-1 ring-ink' : 'border-rule bg-paper shadow-paper hover:border-ink'
      }`}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-display text-xl font-bold text-ink">
          {party.acronym}
          {party.number !== undefined && <span className="ml-2 font-mono text-base font-semibold text-ink-soft">{party.number}</span>}
        </span>
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{party.seats} deputados</span>
      </span>
      <span className="font-sans text-sm font-semibold text-ink-soft">{party.name}</span>
      <span className="mt-2 font-serif text-xs leading-relaxed text-ink-soft">{party.description}</span>
      <span className="mt-3 block">
        <span className="mb-1 flex justify-between font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          <span>Afinidade com você</span>
          <span className="tabular-nums">{fit}%</span>
        </span>
        <ProgressBar value={fit} tone={fitTone(fit)} label={`Afinidade de ${fit}%`} />
      </span>
      <span className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={growth.tone}>Crescimento no partido: {growth.label}</Badge>
        {governs.map((level) => (
          <Badge key={level} tone="info">
            No poder · {CAREER_LEVEL_LABELS[level]}
          </Badge>
        ))}
      </span>
    </button>
  );
};
