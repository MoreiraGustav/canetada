import { PortraitImage } from '@/components/ui/PortraitImage';
import type { CareerDynastyView } from '@/types';
import { formatNumber } from '@/utils/format';

interface CareerDynastyCardProps {
  view: CareerDynastyView;
}

/** A família política: quem veio antes, o maior cargo de cada um e o legado somado. */
export const CareerDynastyCard = ({ view }: CareerDynastyCardProps) => (
  <section aria-label="Família política" className="border border-rule bg-paper p-4 shadow-paper">
    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ochre">👑 Família política · {view.generation}ª geração</p>
    <ol className="mt-3 flex flex-col gap-2">
      {view.ancestors.map((member) => (
        <li key={`${member.name}-${member.yearsLabel}`} className="flex items-center gap-3">
          <PortraitImage portrait={member.portrait} name={member.name} size="sm" />
          <span className="min-w-0">
            <span className="block font-serif text-sm font-semibold text-ink">
              {member.name} <span className="font-sans text-[11px] font-normal text-ink-muted">({member.yearsLabel})</span>
            </span>
            <span className="block font-sans text-[11px] text-ink-soft">
              {member.officeLabel} · {member.legacyTitle} · {formatNumber(member.legacyScore)} pontos
            </span>
          </span>
        </li>
      ))}
    </ol>
    {view.familyScore !== null && (
      <p className="mt-3 border-t border-rule pt-2 font-sans text-xs text-ink-soft">
        Legado da família: <strong className="font-display text-base tabular-nums text-ink">{formatNumber(view.familyScore)}</strong> pontos
      </p>
    )}
  </section>
);
