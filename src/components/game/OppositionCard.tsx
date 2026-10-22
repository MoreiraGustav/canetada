import { PhotoCreditLine } from '@/components/ui/PhotoCreditLine';
import { PortraitImage } from '@/components/ui/PortraitImage';
import type { OppositionView } from '@/types';
import { formatNumber } from '@/utils/format';

interface OppositionCardProps {
  view: OppositionView | null;
}

/** Líder da oposição: quem você derrotou na eleição e a força da oposição na Câmara. */
export const OppositionCard = ({ view }: OppositionCardProps) => {
  if (!view) return null;
  return (
    <section aria-labelledby="opposition-title" className="mt-6">
      <h2 id="opposition-title" className="mb-2 border-b border-ink pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
        Oposição
      </h2>
      <div className="flex items-start gap-3">
        <PortraitImage portrait={view.portrait} name={view.name} size="sm" />
        <div className="min-w-0">
          <p className="font-serif text-sm font-semibold leading-snug text-ink">{view.name}</p>
          {view.party && (
            <p className="font-sans text-[11px] text-ink-muted">
              <span aria-hidden="true" className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: view.party.color }} />
              {view.party.acronym} · rival no 2º turno
            </p>
          )}
          <p className="mt-1 font-sans text-[11px] text-ink-soft">
            Oposição na Câmara: <strong className="text-ink">{formatNumber(view.strength, 0)}%</strong>
          </p>
        </div>
      </div>
      <PhotoCreditLine credit={view.portrait.credit} className="mt-1" />
    </section>
  );
};
