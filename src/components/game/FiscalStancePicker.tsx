import type { FiscalStanceView } from '@/types';
import { formatNumber, formatSigned } from '@/utils/format';

interface FiscalStancePickerProps {
  stances: readonly FiscalStanceView[];
  canChange: boolean;
  /** Meses até poder mudar de novo (0 = livre). */
  cooldownLeft: number;
  onChoose: (stanceId: string) => void;
}

const CARD_ACTIVE = 'border-ink bg-paper-dark shadow-lifted';
const CARD_IDLE = 'border-rule bg-paper hover:border-ink';

/** Escolha da política fiscal: cada postura mostra a dívida e o primário projetados em 4 anos. */
export const FiscalStancePicker = ({ stances, canChange, cooldownLeft, onChoose }: FiscalStancePickerProps) => (
  <div>
    <p className="mb-2 font-sans text-[11px] text-ink-soft">
      {canChange
        ? 'Você pode mudar a política fiscal agora. Depois, só daqui a 6 meses (o orçamento não muda todo mês).'
        : cooldownLeft > 0
          ? `Próxima mudança possível em ${cooldownLeft} ${cooldownLeft === 1 ? 'mês' : 'meses'}.`
          : 'A política fiscal só muda no mês de decisões.'}
    </p>
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      {stances.map(({ stance, active, debtIn4Years, primaryIn4Years }) => (
        <button
          key={stance.id}
          type="button"
          aria-pressed={active}
          disabled={!canChange || active}
          onClick={() => onChoose(stance.id)}
          className={`flex flex-col gap-1 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:cursor-default ${active ? CARD_ACTIVE : CARD_IDLE} ${!canChange && !active ? 'opacity-60' : ''}`}
        >
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-lg leading-none">
              {stance.icon}
            </span>
            <span className="font-serif text-sm font-semibold leading-snug text-ink">{stance.label}</span>
          </span>
          {active && <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-accent">Em vigor</span>}
          <span className="font-serif text-xs leading-snug text-ink-soft">{stance.description}</span>
          <span className="mt-auto border-t border-rule pt-1 font-sans text-[11px] text-ink">
            Em 4 anos: dívida <strong className="tabular-nums">{formatNumber(debtIn4Years, 0)}%</strong> · primário{' '}
            <strong className="tabular-nums">{formatSigned(primaryIn4Years, 1)}%</strong>
          </span>
        </button>
      ))}
    </div>
  </div>
);
