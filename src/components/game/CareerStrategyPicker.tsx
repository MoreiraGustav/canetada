import type { CampaignStrategy } from '@/types';
import { summarizeCareerImpact } from '@/utils/careerHints';
import { formatChance } from '@/utils/format';
import { ImpactHintList } from './ImpactHintList';
import { OutcomeRiskBadge } from './OutcomeRiskBadge';

interface CareerStrategyPickerProps {
  strategies: readonly CampaignStrategy[];
  value: string | null;
  /** Chance de vitória com cada estratégia, para o cargo escolhido (omitido: não mostra). */
  chances?: Readonly<Record<string, number>>;
  onChange: (strategyId: string) => void;
}

/** Tom (estratégia) da campanha (radio): muda a força eleitoral e deixa marcas, ganhe ou perca. */
export const CareerStrategyPicker = ({ strategies, value, chances = {}, onChange }: CareerStrategyPickerProps) => (
  <fieldset className="border-t border-rule pt-4">
    <legend className="sr-only">Tom da campanha</legend>
    <h3 className="font-display text-xl font-bold text-ink">
      <span className="mr-1.5" aria-hidden="true">
        📣
      </span>
      Tom da campanha
    </h3>
    <p className="mb-3 mt-1 max-w-2xl font-serif text-sm text-ink-soft">Como você vai pedir voto. O tom soma força e deixa marcas, ganhe ou perca.</p>
    <div role="radiogroup" aria-label="Tom da campanha" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {strategies.map((strategy) => {
        const selected = strategy.id === value;
        return (
          <button
            key={strategy.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(strategy.id)}
            className={`flex flex-col gap-2 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
              selected ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'
            }`}
          >
            <span className="font-sans text-sm font-semibold text-ink">
              <span className="mr-1" aria-hidden="true">
                {strategy.icon}
              </span>
              {strategy.name}
            </span>
            <span className="font-serif text-xs leading-relaxed text-ink-soft">{strategy.description}</span>
            {chances[strategy.id] !== undefined && (
              <span className="font-sans text-[11px] font-semibold text-ink">Chance de vitória: {formatChance(chances[strategy.id])}</span>
            )}
            <ImpactHintList hints={summarizeCareerImpact(strategy.impact)} />
            {strategy.risk && <OutcomeRiskBadge chance={strategy.risk.chance} className="self-start" />}
          </button>
        );
      })}
    </div>
  </fieldset>
);
