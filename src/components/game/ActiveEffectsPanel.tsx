import { useActiveEffects } from '@/stores/selectors';
import { Badge } from '@/components/ui/Badge';
import { ImpactHintList } from './ImpactHintList';

const months = (count: number): string => `${count} ${count === 1 ? 'mês' : 'meses'}`;

/** Aba "Em andamento": efeitos graduais de decisões, eventos e acordos. */
export const ActiveEffectsPanel = () => {
  const effects = useActiveEffects();
  if (effects.length === 0) {
    return (
      <p className="border-l-4 border-rule bg-paper-dark/60 px-4 py-3 font-serif italic text-ink-soft">
        Nenhum efeito gradual em curso. Medidas estruturais (reformas, obras, programas) aparecem aqui enquanto
        amadurecem.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {effects.map((effect) => (
        <li key={effect.id} className="flex flex-col gap-1.5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-serif text-sm font-semibold text-ink">{effect.label}</p>
            <div className="flex items-center gap-2">
              {effect.pending && <Badge tone="info">A começar</Badge>}
              <span className="font-sans text-[11px] uppercase tracking-wider text-ink-muted tabular-nums">
                {months(effect.remainingTurns)} {effect.remainingTurns === 1 ? 'restante' : 'restantes'}
              </span>
            </div>
          </div>
          <ImpactHintList hints={effect.hints} />
        </li>
      ))}
    </ul>
  );
};
