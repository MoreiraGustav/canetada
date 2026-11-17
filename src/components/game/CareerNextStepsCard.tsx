import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface CareerNextStepsCardProps {
  name: string;
  /** Ex-presidente ainda pode voltar à carreira. */
  canResume: boolean;
  onResume?: () => void;
  onHeir: () => void;
}

/** Depois do fim: voltar à carreira como ex-presidente ou passar o bastão a um(a) herdeiro(a). */
export const CareerNextStepsCard = ({ name, canResume, onResume, onHeir }: CareerNextStepsCardProps) => (
  <Card emphasis className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">E agora?</p>
      <p className="mt-1 font-serif text-sm leading-relaxed text-ink-soft">
        {canResume
          ? `${name} deixou o Planalto, mas a vida pública não precisa acabar: dá para disputar o Senado, um governo estadual ou até voltar à Presidência. Ou passar o bastão.`
          : `A família pode seguir na política: escolha um(a) herdeiro(a) para continuar a trajetória de ${name}.`}
      </p>
    </div>
    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
      {canResume && onResume && (
        <Button variant="accent" onClick={onResume}>
          🎖️ Voltar à carreira
        </Button>
      )}
      <Button variant={canResume ? 'secondary' : 'accent'} onClick={onHeir}>
        👑 Passar o bastão
      </Button>
    </div>
  </Card>
);
