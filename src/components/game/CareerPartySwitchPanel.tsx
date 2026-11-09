import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { CareerPartyOptionView, CheckResult } from '@/types';

interface CareerPartySwitchPanelProps {
  parties: readonly CareerPartyOptionView[];
  check: CheckResult;
  onSwitch: (partyId: string) => void;
}

/** Troca de partido: perde parte da influência e um pouco da imagem; mandato proporcional só na janela. */
export const CareerPartySwitchPanel = ({ parties, check, onSwitch }: CareerPartySwitchPanelProps) => {
  const others = parties.filter((entry) => !entry.current);
  const [target, setTarget] = useState(others[0]?.party.id ?? '');
  return (
    <section aria-label="Trocar de partido" className="border-t border-rule pt-4">
      <h3 className="mb-1 font-display text-xl font-bold text-ink">Trocar de partido</h3>
      <p className="mb-3 font-serif text-sm text-ink-soft">
        Você recomeça com parte da influência e o eleitor estranha o troca-troca. Precisa estar filiado(a) 6 meses antes da eleição.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="career-party-switch" className="sr-only">
          Novo partido
        </label>
        <select
          id="career-party-switch"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          className="border border-ink bg-paper px-3 py-2 font-serif text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          {others.map(({ party, fit }) => (
            <option key={party.id} value={party.id}>
              {party.acronym} — {party.name} (afinidade {fit}%)
            </option>
          ))}
        </select>
        <Button variant="secondary" size="sm" disabled={!check.ok || target === ''} onClick={() => onSwitch(target)}>
          Assinar nova ficha
        </Button>
      </div>
      {!check.ok && check.reason && <p className="mt-2 font-sans text-[11px] font-semibold text-ink-muted">✗ {check.reason}</p>}
    </section>
  );
};
