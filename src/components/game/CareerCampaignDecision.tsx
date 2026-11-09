import type { CampaignDecisionKind, CampaignDecisionView } from '@/types';
import { formatChance, formatMoney } from '@/utils/format';
import { CareerChoiceButton } from './CareerChoiceButton';

interface CareerCampaignDecisionProps {
  view: CampaignDecisionView;
  /** Teto de gastos (R$), para mostrar quanto cada opção de dinheiro gasta. */
  cap: number;
  onChoose: (decisionId: string, optionId: string) => void;
}

const DECISION_ICONS: Record<CampaignDecisionKind, string> = {
  chapa: '🤝',
  dinheiro: '💰',
  debate: '🎙️',
};

/** Uma decisão da campanha (chapa, dobradinha, dinheiro, debate ou sabatina) com suas opções. */
export const CareerCampaignDecision = ({ view, cap, onChoose }: CareerCampaignDecisionProps) => {
  const { decision, options } = view;
  const isMoney = decision.kind === 'dinheiro';
  return (
    <fieldset className="border-t border-rule pt-4">
      <legend className="sr-only">{decision.title}</legend>
      <h3 className="font-display text-xl font-bold text-ink">
        <span className="mr-1.5" aria-hidden="true">
          {DECISION_ICONS[decision.kind]}
        </span>
        {decision.title}
      </h3>
      <p className="mb-3 mt-1 max-w-2xl font-serif text-sm text-ink-soft">{decision.description}</p>
      <div role="radiogroup" aria-label={decision.title} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((entry) => (
          <CareerChoiceButton
            key={entry.option.id}
            view={entry}
            detail={isMoney && entry.option.spendShare !== undefined ? `Gasta ${formatMoney(entry.option.spendShare * cap)} (${formatChance(entry.option.spendShare)} do teto)` : undefined}
            onSelect={() => onChoose(decision.id, entry.option.id)}
          />
        ))}
      </div>
    </fieldset>
  );
};
