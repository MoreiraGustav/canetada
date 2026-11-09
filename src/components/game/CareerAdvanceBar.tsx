import { Button } from '@/components/ui/Button';

interface CareerAdvanceBarProps {
  /** "1º sem. 2027". */
  dateLabel: string;
  chosen: number;
  max: number;
  /** Governa e ainda não escolheu o programa de gestão do semestre (lembrete, não bloqueia). */
  programPending: boolean;
  onAdvance: () => void;
}

/** Barra fixa no rodapé com "Encerrar semestre" e o lembrete das vagas da agenda. */
export const CareerAdvanceBar = ({ dateLabel, chosen, max, programPending, onAdvance }: CareerAdvanceBarProps) => {
  const free = max - chosen;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-double border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="min-w-0 font-sans text-[11px] leading-snug text-ink-soft sm:text-xs" aria-live="polite">
          {free > 0 ? (
            <>
              Ainda {free === 1 ? 'cabe' : 'cabem'} <strong className="text-ink">{free}</strong> {free === 1 ? 'ação' : 'ações'} na agenda de {dateLabel}.
            </>
          ) : (
            <>
              Agenda de <strong className="text-ink">{dateLabel}</strong> pronta.
            </>
          )}{' '}
          {programPending ? 'Falta escolher o programa de gestão.' : 'O jogo é salvo automaticamente.'}
        </p>
        <Button variant="accent" size="lg" onClick={onAdvance} className="shrink-0">
          Encerrar semestre <span aria-hidden="true">▶</span>
        </Button>
      </div>
    </div>
  );
};
