import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CareerCampaignView, Tone } from '@/types';
import { formatChance } from '@/utils/format';
import { CareerCandidacyFactors } from './CareerCandidacyFactors';

interface CareerCampaignOddsProps {
  view: CareerCampaignView;
}

const PERCENT = 100;
const GOOD_CHANCE = 0.55;
const FAIR_CHANCE = 0.3;

const chanceTone = (chance: number): Tone => {
  if (chance >= GOOD_CHANCE) return 'positive';
  return chance >= FAIR_CHANCE ? 'neutral' : 'negative';
};

/** Chance ao vivo: muda a cada escolha da campanha, com a prévia e o porquê. */
export const CareerCampaignOdds = ({ view }: CareerCampaignOddsProps) => (
  <section aria-labelledby="campaign-odds-title" className="border border-ink bg-paper p-4 shadow-paper">
    <h3 id="campaign-odds-title" className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
      Chance de vitória
    </h3>
    <p className="mt-1 font-display text-5xl font-black tabular-nums leading-none text-ink" aria-live="polite">
      {formatChance(view.totalChance)}
    </p>
    <ProgressBar value={view.totalChance * PERCENT} tone={chanceTone(view.totalChance)} className="mt-3" label={`Chance de vitória: ${formatChance(view.totalChance)}`} />
    {view.primaryChance !== null && (
      <dl className="mt-3 space-y-0.5 font-sans text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-ink-soft">Prévia contra {view.primaryRivalName}</dt>
          <dd className="font-semibold tabular-nums text-ink">{formatChance(view.primaryChance)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-ink-soft">Urna, se for o(a) candidato(a)</dt>
          <dd className="font-semibold tabular-nums text-ink">{formatChance(view.chance)}</dd>
        </div>
      </dl>
    )}
    {view.primarySettled && view.primaryRivalName && (
      <p className="mt-3 font-sans text-xs text-positive">✓ Sem prévia: acordo com {view.primaryRivalName} na chapa.</p>
    )}
    {view.runoffPossible && (
      <p className="mt-2 font-serif text-xs italic text-ink-soft">
        Disputa em dois turnos: a chance vale para a eleição toda, mas a decisão entre os turnos ainda pesa.
      </p>
    )}
    <CareerCandidacyFactors factors={view.factors} strength={view.strength} difficulty={view.difficulty} />
  </section>
);
