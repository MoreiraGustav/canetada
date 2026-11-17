import { useState } from 'react';
import type { BillPlan, CareerBillView } from '@/types';
import { CareerBillCard } from './CareerBillCard';

interface CareerBillsPanelProps {
  active: readonly CareerBillView[];
  available: readonly CareerBillView[];
  maxBills: number;
  planned: boolean;
  onPlan: (plan: BillPlan) => void;
}

/** Projetos de lei: os que estão tramitando e os temas que dá para apresentar (uma iniciativa por semestre). */
export const CareerBillsPanel = ({ active, available, maxBills, planned, onPlan }: CareerBillsPanelProps) => {
  const [showCatalog, setShowCatalog] = useState(active.length === 0);
  return (
    <section aria-label="Projetos de lei">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-ink">📜 Projetos de lei</h3>
        <span className="font-sans text-[11px] font-semibold text-ink-soft">
          {active.length}/{maxBills} em tramitação · {planned ? 'iniciativa do semestre escolhida' : 'uma iniciativa por semestre'}
        </span>
      </div>
      <p className="mb-3 font-serif text-sm text-ink-soft">
        O projeto passa pela comissão e depois vai a voto. Articular aumenta as chances; um governo de oposição trava e pode vetar.
      </p>
      {active.length > 0 && (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {active.map((view) => (
            <CareerBillCard key={view.bill.id} view={view} onPlan={onPlan} />
          ))}
        </div>
      )}
      <button
        type="button"
        aria-expanded={showCatalog}
        onClick={() => setShowCatalog((open) => !open)}
        className="font-sans text-xs font-semibold text-navy underline-offset-2 hover:underline"
      >
        {showCatalog ? 'Esconder os temas' : `Apresentar um projeto novo (${available.length} temas)`}
      </button>
      {showCatalog && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {available.map((view) => (
            <CareerBillCard key={view.bill.id} view={view} onPlan={onPlan} />
          ))}
        </div>
      )}
    </section>
  );
};
