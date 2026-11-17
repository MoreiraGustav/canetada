import type { CareerMissionLabels, CareerPostView } from '@/types';
import { formatSigned } from '@/utils/format';
import { ImpactHintList } from './ImpactHintList';
import { OutcomeRiskBadge } from './OutcomeRiskBadge';

interface CareerMissionCardProps {
  mission: NonNullable<CareerPostView['mission']>;
  labels: CareerMissionLabels;
  onChoose: (optionId: string) => void;
}

/** Missão do semestre (do chefe ou do titular): cada jeito de cumprir mexe na carreira e na confiança dele. */
export const CareerMissionCard = ({ mission, labels, onChoose }: CareerMissionCardProps) => (
  <section aria-label="Missão do semestre" className="border border-rule border-t-4 border-t-ink bg-paper p-4 shadow-paper">
    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{labels.kicker}</p>
    <h3 className="mt-1 font-display text-xl font-bold leading-tight text-ink">
      <span aria-hidden="true">{mission.mission.icon}</span> {mission.mission.title}
    </h3>
    <p className="mt-1 font-serif text-sm leading-snug text-ink-soft">{mission.description}</p>
    <div role="radiogroup" aria-label="Como cumprir" className="mt-3 grid gap-2 sm:grid-cols-3">
      {mission.options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={option.selected}
          onClick={() => onChoose(option.id)}
          className={`flex flex-col gap-1 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
            option.selected ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'
          }`}
        >
          <span className="font-sans text-sm font-semibold text-ink">{option.label}</span>
          <span className="font-serif text-xs leading-snug text-ink-soft">{option.description}</span>
          <span className={`font-sans text-[11px] font-bold ${option.trust >= 0 ? 'text-positive' : 'text-negative'}`}>
            {labels.trustTitle} {formatSigned(option.trust, 0)}
          </span>
          <ImpactHintList hints={option.hints} />
          <OutcomeRiskBadge chance={option.riskChance} className="self-start" />
        </button>
      ))}
    </div>
    <p className="mt-2 font-sans text-[11px] text-ink-muted">{labels.skipNote}</p>
  </section>
);
