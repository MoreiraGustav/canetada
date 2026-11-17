import type { AmendmentOptionView } from '@/types';
import { CareerPickCard } from './CareerPickCard';

interface CareerAmendmentsPanelProps {
  options: readonly AmendmentOptionView[];
  trancheLabel: string;
  annualLabel: string;
  oppositionDelay: boolean;
  onToggle: (targetId: string) => void;
}

/** Emendas do semestre: para onde mandar a verba que o mandato indica no orçamento. */
export const CareerAmendmentsPanel = ({ options, trancheLabel, annualLabel, oppositionDelay, onToggle }: CareerAmendmentsPanelProps) => (
  <section aria-label="Emendas">
    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="font-display text-lg font-bold text-ink">💰 Emendas do semestre</h3>
      <span className="font-sans text-[11px] font-semibold text-ink-soft">
        {trancheLabel} neste semestre · {annualLabel} por ano
      </span>
    </div>
    <p className="mb-3 font-serif text-sm text-ink-soft">
      Escolha um destino. Sem indicação, a verba fica no caixa do governo.
      {oppositionDelay && ' O governo é de oposição e segura os pagamentos: o efeito encolhe.'}
    </p>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => (
        <CareerPickCard
          key={option.target.id}
          icon={option.target.icon}
          title={option.target.name}
          description={option.target.description}
          hints={option.hints}
          riskChance={option.riskChance}
          selected={option.selected}
          blockedReason={null}
          onToggle={() => onToggle(option.target.id)}
        />
      ))}
    </div>
  </section>
);
