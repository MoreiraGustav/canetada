import type { CareerBudgetView } from '@/types';

interface CareerBudgetCardProps {
  budget: CareerBudgetView;
}

const TONE_CLASSES: Record<CareerBudgetView['balanceTone'], string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-ink',
};

/** Orçamento da gestão em reais: receita, margem para obras, parcelas comprometidas e o caixa. */
export const CareerBudgetCard = ({ budget }: CareerBudgetCardProps) => (
  <dl className="grid gap-x-4 gap-y-2 border border-rule bg-paper-dark p-3 font-sans text-[11px] sm:grid-cols-2">
    <div>
      <dt className="font-semibold uppercase tracking-wide text-ink-soft">Receita</dt>
      <dd className="font-display text-lg font-bold tabular-nums text-ink">{budget.revenueLabel}</dd>
      <dd className="text-ink-muted">Quase tudo vai para folha, custeio e dívidas.</dd>
    </div>
    <div>
      <dt className="font-semibold uppercase tracking-wide text-ink-soft">Caixa</dt>
      <dd className={`font-display text-lg font-bold tabular-nums ${TONE_CLASSES[budget.balanceTone]}`}>{budget.balanceLabel}</dd>
      <dd className="text-ink-muted">Programas custam caixa; o ajuste fiscal e as concessões repõem.</dd>
    </div>
    <div>
      <dt className="font-semibold uppercase tracking-wide text-ink-soft">Margem para obras</dt>
      <dd className="font-display text-lg font-bold tabular-nums text-ink">{budget.investmentLabel}</dd>
    </div>
    <div>
      <dt className="font-semibold uppercase tracking-wide text-ink-soft">Parcelas das obras</dt>
      <dd className={`font-display text-lg font-bold tabular-nums ${budget.overInvestment ? 'text-negative' : 'text-ink'}`}>{budget.committedLabel}</dd>
      {budget.overInvestment && <dd className="text-negative">Passa da margem: a diferença sai do caixa.</dd>}
    </div>
  </dl>
);
