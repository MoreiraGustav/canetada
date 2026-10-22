import { Button } from '@/components/ui/Button';
import type { FiscalCost } from '@/types';
import { FiscalCostLine } from './FiscalCostLine';

interface TurnAdvanceBarProps {
  enabled: boolean;
  /** Ex.: "Mar/2027". */
  dateLabel: string;
  /** O programa de governo do mês ainda não foi lançado (lembrete, não bloqueia). */
  programPending?: boolean;
  /** Custo fiscal somado das decisões escolhidas no mês. */
  fiscal?: FiscalCost | null;
  onAdvance: () => void;
}

/** Barra fixa no rodapé com o botão "Avançar mês" e o peso das escolhas nas contas. */
export const TurnAdvanceBar = ({ enabled, dateLabel, programPending = false, fiscal = null, onAdvance }: TurnAdvanceBarProps) => (
  <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-double border-ink bg-paper/95 backdrop-blur-sm">
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div className="min-w-0" aria-live="polite">
        <p className="font-sans text-[11px] leading-snug text-ink-soft sm:text-xs">
          {enabled ? (
            <>
              Decisões de <strong className="text-ink">{dateLabel}</strong> prontas.{' '}
              {programPending ? (
                <>
                  Ainda dá para lançar um <strong className="text-ink">🏗️ programa</strong> este mês.
                </>
              ) : (
                'O jogo é salvo automaticamente.'
              )}
            </>
          ) : (
            <>Escolha uma opção em cada decisão para avançar.</>
          )}
        </p>
        <FiscalCostLine cost={fiscal} className="mt-0.5 hidden sm:flex" />
      </div>
      <Button variant="accent" size="lg" disabled={!enabled} onClick={onAdvance} className="shrink-0">
        Avançar mês <span aria-hidden="true">▶</span>
      </Button>
    </div>
  </div>
);
