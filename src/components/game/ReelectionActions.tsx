import { Button } from '@/components/ui/Button';

interface ReelectionActionsProps {
  reelected: boolean;
  onContinue: () => void;
  onRetire: () => void;
}

/** Escolhas após a apuração: assumir o 2º mandato, encerrar a carreira ou ver o legado. */
export const ReelectionActions = ({ reelected, onContinue, onRetire }: ReelectionActionsProps) => {
  if (!reelected) {
    return (
      <div className="flex justify-center">
        <Button size="lg" onClick={onRetire}>
          Ver legado
        </Button>
      </div>
    );
  }
  return (
    <>
      <p className="text-center font-serif text-sm text-ink-soft">
        Assumir o segundo mandato prolonga o governo por mais um período completo. Encerrar agora preserva o legado do primeiro.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={onContinue}>
          Assumir o 2º mandato
        </Button>
        <Button variant="secondary" size="lg" onClick={onRetire}>
          Encerrar carreira
        </Button>
      </div>
    </>
  );
};
