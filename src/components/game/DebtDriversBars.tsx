import type { DebtDrivers } from '@/types';
import { formatNumber, formatSigned } from '@/utils/format';

interface DebtDriversBarsProps {
  drivers: DebtDrivers;
}

/** Largura máxima da barra (p.p. do PIB por ano) — acima disso a barra satura. */
const FULL_BAR = 8;
const PERCENT = 100;

interface DriverRowProps {
  label: string;
  hint: string;
  value: number;
}

const DriverRow = ({ label, hint, value }: DriverRowProps) => {
  const width = `${Math.min(1, Math.abs(value) / FULL_BAR) * PERCENT}%`;
  const raises = value > 0;
  return (
    <li className="grid grid-cols-[minmax(0,9rem)_1fr_4.5rem] items-center gap-2 py-1">
      <span className="font-sans text-xs text-ink" title={hint}>
        {label}
      </span>
      <span className="relative h-3 bg-paper-dark" aria-hidden="true">
        <span className={`absolute inset-y-0 left-0 ${raises ? 'bg-negative' : 'bg-positive'}`} style={{ width }} />
      </span>
      <span className={`text-right font-sans text-xs font-semibold tabular-nums ${raises ? 'text-negative' : 'text-positive'}`}>
        {formatSigned(value, 1)} p.p.
      </span>
    </li>
  );
};

/**
 * Por que a dívida sobe ou cai: juros a aumentam, o crescimento nominal do PIB a
 * dilui e o primário soma (déficit) ou abate (superávit). Em p.p. do PIB por ano.
 */
export const DebtDriversBars = ({ drivers }: DebtDriversBarsProps) => (
  <div>
    <ul aria-label="O que move a dívida, em pontos do PIB por ano">
      <DriverRow label="Juros da dívida" hint="Quanto mais alta a Selic e a dívida, mais juros." value={drivers.interest} />
      <DriverRow label="PIB e inflação" hint="Crescimento e inflação aumentam o PIB e diluem a dívida." value={drivers.growth} />
      <DriverRow label="Resultado primário" hint="Déficit soma à dívida; superávit abate." value={drivers.primary} />
    </ul>
    <p className={`mt-1 border-t border-rule pt-1 font-sans text-xs font-semibold ${drivers.total > 0 ? 'text-negative' : 'text-positive'}`}>
      No ritmo atual, a dívida {drivers.total > 0 ? 'sobe' : 'cai'} {formatNumber(Math.abs(drivers.total), 1)} p.p. do PIB por ano.
    </p>
  </div>
);
