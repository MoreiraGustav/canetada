import type { PublicAccounts } from '@/types';
import { formatBillions, formatNumber, formatSigned } from '@/utils/format';

const BILLIONS_PER_TRILLION = 1000;

interface PublicAccountsSummaryProps {
  accounts: PublicAccounts;
  debt: number;
  primaryBalance: number;
}

interface TileProps {
  label: string;
  value: string;
  detail: string;
  tone?: 'positive' | 'negative' | 'neutral';
}

const TONE_CLASSES: Record<NonNullable<TileProps['tone']>, string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-ink',
};

const Tile = ({ label, value, detail, tone = 'neutral' }: TileProps) => (
  <div className="border border-rule bg-paper p-3">
    <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
    <p className={`font-display text-2xl font-bold tabular-nums ${TONE_CLASSES[tone]}`}>{value}</p>
    <p className="font-sans text-[11px] leading-snug text-ink-soft">{detail}</p>
  </div>
);

/** Dívida, primário, juros e déficit nominal em reais (preços de 2026). */
export const PublicAccountsSummary = ({ accounts, debt, primaryBalance }: PublicAccountsSummaryProps) => (
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
    <Tile label="Dívida bruta" value={`${formatNumber(debt, 1)}% do PIB`} detail={`${formatBillions(accounts.debtTrillions * BILLIONS_PER_TRILLION)} devidos pelo governo`} />
    <Tile
      label="Resultado primário"
      value={`${accounts.primaryBillions >= 0 ? '+' : '−'}${formatBillions(accounts.primaryBillions)}/ano`}
      detail={`${formatSigned(primaryBalance, 1)}% do PIB: ${primaryBalance >= 0 ? 'sobra antes dos juros' : 'falta dinheiro antes dos juros'}`}
      tone={primaryBalance >= 0 ? 'positive' : 'negative'}
    />
    <Tile
      label="Juros da dívida"
      value={`${formatBillions(accounts.interestBillions)}/ano`}
      detail={`Custo médio de ${formatNumber(accounts.effectiveRate, 1)}% ao ano`}
      tone="negative"
    />
    <Tile
      label="Déficit nominal"
      value={`${formatBillions(accounts.nominalBillions)}/ano`}
      detail="Primário menos juros: o que vira dívida nova"
      tone={accounts.nominalBillions >= 0 ? 'positive' : 'negative'}
    />
  </div>
);
