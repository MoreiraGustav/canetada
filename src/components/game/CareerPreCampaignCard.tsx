import { useCareerPreCampaign } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import type { CareerOfficeId } from '@/types';
import { CareerPollList } from './CareerPollList';
import { CareerPollProjection } from './CareerPollProjection';

const NO_PRE_CANDIDACY = '';

/** Pré-campanha: escolha da pré-candidatura e as pesquisas dos semestres antes da eleição. */
export const CareerPreCampaignCard = () => {
  const view = useCareerPreCampaign();
  const declarePreCandidacy = useGameStore((state) => state.declarePreCandidacy);
  if (!view) return null;
  const unit = view.semestersLeft === 1 ? 'semestre' : 'semestres';
  return (
    <section aria-label="Pré-campanha" className="border border-rule border-t-4 border-t-accent bg-paper p-4 shadow-paper">
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
        🗳️ Pré-campanha · {view.electionLabel} em {view.semestersLeft} {unit}
      </p>
      <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <label htmlFor="career-pre-candidacy" className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Pré-candidatura
        </label>
        <select
          id="career-pre-candidacy"
          value={view.current ?? NO_PRE_CANDIDACY}
          onChange={(event) => declarePreCandidacy(event.target.value === NO_PRE_CANDIDACY ? null : (event.target.value as CareerOfficeId))}
          className="border border-ink bg-paper px-3 py-2 font-serif text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          <option value={NO_PRE_CANDIDACY}>— nenhuma —</option>
          {view.options.map((option) => (
            <option key={option.officeId} value={option.officeId} disabled={!option.viable}>
              {option.viable ? option.title : `${option.title} — ${option.reason ?? 'fora de alcance'}`}
            </option>
          ))}
        </select>
      </div>
      {view.current && view.polls.length > 0 && (
        <div className="mt-3">
          {view.proportional ? <CareerPollProjection polls={view.polls} /> : <CareerPollList polls={view.polls} />}
        </div>
      )}
      <p className="mt-3 font-sans text-[11px] text-ink-muted">
        Pesquisas saem no fim de cada semestre até a eleição e refletem sua força naquele momento.
      </p>
    </section>
  );
};
