import { Button } from '@/components/ui/Button';

interface TurnAdvanceBarProps {
  enabled: boolean;
  /** Ex.: "Mar/2027". */
  dateLabel: string;
  onAdvance: () => void;
}

/** Barra fixa no rodapé com o botão "Avançar mês". */
export const TurnAdvanceBar = ({ enabled, dateLabel, onAdvance }: TurnAdvanceBarProps) => (
  <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-double border-ink bg-paper/95 backdrop-blur-sm">
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <p className="font-sans text-[11px] leading-snug text-ink-soft sm:text-xs" aria-live="polite">
        {enabled ? (
          <>
            Decisões de <strong className="text-ink">{dateLabel}</strong> prontas. O jogo é salvo automaticamente.
          </>
        ) : (
          <>Escolha uma opção em cada decisão para avançar.</>
        )}
      </p>
      <Button variant="accent" size="lg" disabled={!enabled} onClick={onAdvance} className="shrink-0">
        Avançar mês <span aria-hidden="true">▶</span>
      </Button>
    </div>
  </div>
);
