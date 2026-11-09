import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CampaignFinance } from '@/types';
import { formatMoney } from '@/utils/format';

interface CareerCampaignFinanceProps {
  finance: CampaignFinance;
  spending: number;
  /** Gasto acima do arrecadado (R$), 0 se coberto. */
  shortfall: number;
}

const PERCENT = 100;

/** Caixa da campanha: teto de gastos, fundo do partido, doações e quanto a campanha vai gastar. */
export const CareerCampaignFinance = ({ finance, spending, shortfall }: CareerCampaignFinanceProps) => {
  const rows = [
    { label: 'Fundo do partido', value: finance.partyFund },
    { label: 'Doações', value: finance.donations },
    { label: 'Disponível', value: finance.available, strong: true },
    { label: 'Gasto planejado', value: spending, strong: true },
  ];
  const coverage = finance.cap > 0 ? (finance.available / finance.cap) * PERCENT : 0;
  const planned = finance.cap > 0 ? (spending / finance.cap) * PERCENT : 0;
  return (
    <section aria-labelledby="campaign-finance-title" className="border border-rule bg-paper p-4">
      <h3 id="campaign-finance-title" className="flex items-baseline justify-between gap-2 font-sans text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
        <span>💰 Caixa da campanha</span>
        <span className="normal-case tracking-normal text-ink-muted">teto {formatMoney(finance.cap)}</span>
      </h3>
      <ProgressBar value={coverage} tone="info" marker={planned} className="mt-3" label="Dinheiro disponível em relação ao teto de gastos" />
      <p className="mt-1 font-sans text-[10px] text-ink-muted">Barra: o que você tem · marca: o que vai gastar</p>
      <dl className="mt-3 space-y-0.5 font-sans text-xs">
        {rows.map((row) => (
          <div key={row.label} className={`flex justify-between gap-2 ${row.strong ? 'border-t border-rule pt-0.5 font-semibold text-ink' : 'text-ink-soft'}`}>
            <dt>{row.label}</dt>
            <dd className="tabular-nums">{formatMoney(row.value)}</dd>
          </div>
        ))}
      </dl>
      {shortfall > 0 && (
        <p className="mt-3 border-l-4 border-negative bg-negative-light px-2 py-1 font-sans text-xs text-negative" role="status">
          Faltam {formatMoney(shortfall)}: a dívida de campanha pode levar o TRE a rejeitar suas contas.
        </p>
      )}
    </section>
  );
};
