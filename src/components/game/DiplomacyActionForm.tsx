import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DiplomacyActionDetails } from './DiplomacyActionDetails';
import type { DiplomaticActionView } from '@/hooks/useDiplomaticActionViews';
import type { Country, CountryId } from '@/types';

interface DiplomacyActionFormProps {
  actions: readonly DiplomaticActionView[];
  countries: readonly Country[];
  canAct: boolean;
  onPerform: (actionId: string, countryId: CountryId) => void;
}

const CHIP_BASE =
  'border px-2.5 py-1.5 text-left font-sans text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:cursor-not-allowed disabled:opacity-50';
const CHIP_SELECTED = 'border-ink bg-ink text-paper';
const CHIP_IDLE = 'border-rule bg-paper text-ink hover:border-ink-soft';
const STEP_LABEL = 'mb-1 font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted';

const chipClass = (selected: boolean): string => `${CHIP_BASE} ${selected ? CHIP_SELECTED : CHIP_IDLE}`;

/** Escolha da ação diplomática do mês (uma por turno) e do país-alvo. */
export const DiplomacyActionForm = ({ actions, countries, canAct, onPerform }: DiplomacyActionFormProps) => {
  const [actionId, setActionId] = useState<string | null>(null);
  const [countryId, setCountryId] = useState<CountryId | null>(null);
  const selected = actions.find((view) => view.action.id === actionId) ?? null;
  const handlePerform = (): void => {
    if (actionId && countryId) onPerform(actionId, countryId);
  };

  return (
    <div className="space-y-3">
      {!canAct && (
        <p className="border-l-4 border-navy bg-navy-light/50 px-3 py-2 font-sans text-xs font-semibold text-navy">
          ✔ Ação diplomática deste mês já realizada. Uma nova agenda estará disponível no próximo mês.
        </p>
      )}
      <fieldset disabled={!canAct} className="space-y-3">
        <legend className={STEP_LABEL}>1. Tipo de ação</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {actions.map(({ action }) => (
            <button
              key={action.id}
              type="button"
              aria-pressed={action.id === actionId}
              onClick={() => setActionId(action.id)}
              className={`${chipClass(action.id === actionId)} font-semibold`}
            >
              <span aria-hidden="true" className="mr-1">
                {action.icon}
              </span>
              {action.name}
            </button>
          ))}
        </div>
        {selected && <DiplomacyActionDetails view={selected} />}
        <p className={STEP_LABEL}>2. País</p>
        <div className="flex flex-wrap gap-2">
          {countries.map((country) => (
            <button
              key={country.id}
              type="button"
              aria-pressed={country.id === countryId}
              onClick={() => setCountryId(country.id)}
              className={chipClass(country.id === countryId)}
            >
              <span aria-hidden="true" className="mr-1">
                {country.flag}
              </span>
              {country.name}
            </button>
          ))}
        </div>
        <Button variant="secondary" disabled={!actionId || !countryId} onClick={handlePerform}>
          Executar ação diplomática
        </Button>
      </fieldset>
    </div>
  );
};
