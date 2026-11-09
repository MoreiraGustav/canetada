import { SectionHeading } from '@/components/ui/SectionHeading';
import type { CareerActionView } from '@/types';
import { CareerActionCard } from './CareerActionCard';

interface CareerAgendaPanelProps {
  actions: readonly CareerActionView[];
  chosen: number;
  max: number;
  onToggle: (actionId: string) => void;
}

/** Agenda do semestre: escolha até duas ações (cada uma com seu tempo de espera). */
export const CareerAgendaPanel = ({ actions, chosen, max, onToggle }: CareerAgendaPanelProps) => (
  <section aria-label="Agenda do semestre">
    <SectionHeading
      kicker="🗓️ Agenda do semestre"
      title="Onde gastar seu tempo?"
      aside={
        <span className="font-sans text-xs font-semibold text-ink-soft">
          {chosen}/{max} escolhidas
        </span>
      }
    />
    <p className="mb-3 font-serif text-sm text-ink-soft">
      Escolha até {max} ações. Cada uma rende votos, apoio ou prestígio, mas quase tudo cobra um preço.
    </p>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((view) => (
        <CareerActionCard key={view.action.id} view={view} full={chosen >= max} onToggle={onToggle} />
      ))}
    </div>
  </section>
);
