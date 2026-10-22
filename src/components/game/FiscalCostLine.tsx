import type { FiscalCost } from '@/types';
import { formatBillions, formatSigned } from '@/utils/format';

interface FiscalCostLineProps {
  cost: FiscalCost | null;
  className?: string;
}

/** Variação da dívida em 4 anos abaixo disso é exibida como "quase não muda". */
const DEBT_NOISE = 0.05;
const TOOLTIP = 'Estimativa a preços de 2026 (0,1% do PIB ≈ R$ 11 bi). A dívida projetada já considera a política fiscal em vigor.';

/** Partes do custo em linguagem simples: gasto anual, gasto à vista e efeito na dívida. */
const describe = (cost: FiscalCost): string => {
  const parts: string[] = [];
  if (cost.annual < 0) parts.push(`custa ${formatBillions(cost.annual)}/ano`);
  if (cost.annual > 0) parts.push(`economiza ${formatBillions(cost.annual)}/ano`);
  if (cost.oneOff > 0) parts.push(`${formatBillions(cost.oneOff)} à vista`);
  if (cost.oneOff < 0) parts.push(`devolve ${formatBillions(cost.oneOff)} ao caixa`);
  parts.push(
    Math.abs(cost.debtIn4Years) < DEBT_NOISE
      ? 'dívida quase não muda em 4 anos'
      : `dívida ${formatSigned(cost.debtIn4Years, 1)} p.p. do PIB em 4 anos`,
  );
  const text = parts.join(' · ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** A escolha piora as contas: dívida maior em 4 anos ou, se ela quase não muda, gasto novo. */
const worsens = (cost: FiscalCost): boolean =>
  cost.debtIn4Years > DEBT_NOISE || (cost.debtIn4Years >= -DEBT_NOISE && (cost.annual < 0 || cost.oneOff > 0));

/**
 * Quanto a escolha pesa nas contas públicas, em reais, e o que faz com a dívida
 * em 4 anos: "💸 Contas públicas: Custa R$ 22 bi/ano · dívida +0,4 p.p. do PIB em 4 anos".
 */
export const FiscalCostLine = ({ cost, className = '' }: FiscalCostLineProps) => {
  if (!cost) return null;
  const bad = worsens(cost);
  return (
    <p title={TOOLTIP} className={`flex items-start gap-1.5 font-sans text-[11px] leading-snug ${bad ? 'text-negative' : 'text-positive'} ${className}`}>
      <span aria-hidden="true">{bad ? '💸' : '💰'}</span>
      <span>
        <strong className="font-semibold">Contas públicas:</strong> {describe(cost)}
      </span>
    </p>
  );
};
