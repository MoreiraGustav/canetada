import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { CareerLegacyView } from '@/types';
import { formatNumber } from '@/utils/format';
import { CareerTimelineList } from './CareerTimelineList';

interface CareerTrajectorySectionProps {
  view: CareerLegacyView;
}

/** Bloco do resultado presidencial quando a Presidência veio do modo carreira. */
export const CareerTrajectorySection = ({ view }: CareerTrajectorySectionProps) => (
  <section className="mt-10">
    <SectionHeading kicker="Modo carreira" title="A trajetória até o Planalto" />
    <div className="grid gap-6 lg:grid-cols-3">
      <Card emphasis className="text-center">
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-ink-muted">Legado da carreira</p>
        <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-ink">{view.legacy.title}</h3>
        <p className="mt-2 font-serif text-sm leading-relaxed text-ink-soft">{view.legacy.description}</p>
        <p className="mt-4 font-display text-4xl font-black tabular-nums text-ink">{formatNumber(view.legacy.score)}</p>
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink-muted">pontos de carreira</p>
        <p className="mt-3 font-sans text-xs text-ink-soft">
          {view.legacy.electionsWon} vitórias · {view.legacy.electionsLost} derrotas nas urnas
        </p>
      </Card>
      <div className="lg:col-span-2">
        <CareerTimelineList items={view.timeline} />
      </div>
    </div>
  </section>
);
