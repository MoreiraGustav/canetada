import { PortraitImage } from '@/components/ui/PortraitImage';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CareerCharacterView } from '@/types';
import { formatNumber, formatSigned } from '@/utils/format';
import { CareerRelationBar } from './CareerRelationBar';

interface CareerCharacterCardProps {
  view: CareerCharacterView;
}

/** Um personagem do elenco: quem é, onde está, como se dá com você e do que se lembra. */
export const CareerCharacterCard = ({ view }: CareerCharacterCardProps) => (
  <article className="flex flex-col gap-3 border border-rule bg-paper p-3 shadow-paper" title={view.roleDescription}>
    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
      <span aria-hidden="true">{view.roleIcon}</span> {view.roleLabel}
    </p>
    <div className="flex items-center gap-3">
      <PortraitImage portrait={view.portrait} name={view.name} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-serif text-base font-semibold leading-tight text-ink">{view.name}</p>
        <p className="flex flex-wrap items-center gap-1.5 font-sans text-[11px] text-ink-muted">
          {view.party && (
            <>
              <span className="inline-block h-2 w-2" style={{ backgroundColor: view.party.color }} aria-hidden="true" />
              <strong className="text-ink-soft">{view.party.acronym}</strong>·
            </>
          )}
          <span>{view.officeTitle ?? 'Sem mandato'}</span>·<span>{view.age} anos</span>
        </p>
      </div>
    </div>
    <p className="font-serif text-xs italic leading-snug text-ink-soft">{view.roleDescription}</p>
    <CareerRelationBar relation={view.relation} label={view.relationLabel} />
    <div>
      <div className="flex justify-between font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        <span>Força política</span>
        <span className="tabular-nums">{formatNumber(view.strength, 0)}</span>
      </div>
      <ProgressBar value={view.strength} tone="ink" height="xs" className="mt-1" label="Força política" />
    </div>
    {view.memories.length > 0 && (
      <ul className="flex flex-col gap-1 border-t border-rule pt-2" aria-label="Lembranças">
        {view.memories.map((memory) => (
          <li key={`${memory.dateLabel}-${memory.text}`} className="font-sans text-[11px] leading-snug text-ink-soft">
            <span className="text-ink-muted">{memory.dateLabel}</span> · {memory.text}{' '}
            <span className={`font-semibold ${memory.delta >= 0 ? 'text-positive' : 'text-negative'}`}>({formatSigned(memory.delta, 0)})</span>
          </li>
        ))}
      </ul>
    )}
  </article>
);
