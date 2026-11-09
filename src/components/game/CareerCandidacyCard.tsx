import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CandidacyView, Tone } from '@/types';
import { formatChance } from '@/utils/format';
import { CareerCandidacyFactors } from './CareerCandidacyFactors';
import { CareerRaceNotes } from './CareerRaceNotes';

interface CareerCandidacyCardProps {
  view: CandidacyView;
  selected: boolean;
  onSelect: (officeId: string) => void;
}

const PERCENT = 100;
/** Faixas de chance para a cor da barra. */
const GOOD_CHANCE = 0.55;
const FAIR_CHANCE = 0.3;

const chanceTone = (chance: number): Tone => {
  if (chance >= GOOD_CHANCE) return 'positive';
  return chance >= FAIR_CHANCE ? 'neutral' : 'negative';
};

/** Candidatura possível na convenção: requisitos, chance e o porquê. Inelegível fica visível, mas apagada. */
export const CareerCandidacyCard = ({ view, selected, onSelect }: CareerCandidacyCardProps) => {
  const { option, office, title, contextLabel, leaveLabel } = view;
  const eligible = option.eligible;
  return (
    // O card inteiro escolhe o cargo; o botão do cabeçalho mantém o acesso pelo teclado.
    <article
      onClick={eligible ? () => onSelect(office.id) : undefined}
      className={`border p-4 transition-colors ${eligible ? 'cursor-pointer' : ''} ${
        selected ? 'border-ink bg-paper-dark shadow-lifted ring-1 ring-ink' : 'border-rule bg-paper shadow-paper'
      } ${eligible ? '' : 'opacity-60'}`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={!eligible}
        onClick={() => onSelect(office.id)}
        className="flex w-full items-start justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:cursor-not-allowed"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-display text-xl font-bold text-ink">
            <span aria-hidden="true">{office.icon}</span>
            {title}
          </span>
          <span className="mt-0.5 block font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{contextLabel}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-display text-3xl font-black tabular-nums leading-none text-ink">{eligible ? formatChance(option.chance) : '—'}</span>
          <span className="font-sans text-[10px] uppercase tracking-wider text-ink-muted">chance</span>
        </span>
      </button>
      {eligible && <ProgressBar value={option.chance * PERCENT} tone={chanceTone(option.chance)} className="mt-3" label={`Chance de vitória: ${formatChance(option.chance)}`} />}
      <p className="mt-2 font-serif text-xs leading-relaxed text-ink-soft">{office.description}</p>
      <CareerRaceNotes view={view} />
      {option.ballotNumber && (
        <p className="mt-2 font-sans text-xs text-ink">
          Número na urna: <strong className="font-mono text-sm tracking-widest">{option.ballotNumber}</strong>
        </p>
      )}
      {leaveLabel && (
        <Badge tone="info" className="mt-2">
          Licença de {leaveLabel} na campanha: se perder, volta ao cargo
        </Badge>
      )}
      <ul className="mt-3 space-y-0.5" aria-label="Requisitos">
        {option.checks.map((check) => (
          <li key={check.label} className={`font-sans text-xs ${check.ok ? 'text-ink-soft' : 'text-negative'}`}>
            <span aria-hidden="true">{check.ok ? '✓' : '✗'}</span> {check.label}
            {check.detail && <span className="text-ink-muted"> — {check.detail}</span>}
          </li>
        ))}
      </ul>
      {eligible && <CareerCandidacyFactors factors={option.factors} strength={option.strength} difficulty={option.difficulty} />}
    </article>
  );
};
