import { Card } from '@/components/ui/Card';

interface CampaignPromiseListProps {
  promises: readonly string[];
}

/** Promessas de campanha que viram metas implícitas do mandato. */
export const CampaignPromiseList = ({ promises }: CampaignPromiseListProps) => (
  <Card className="bg-paper-dark">
    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Promessas de campanha</p>
    {promises.length === 0 ? (
      <p className="mt-2 font-serif text-sm italic text-ink-soft">Nenhuma promessa formal foi feita durante a campanha.</p>
    ) : (
      <ul className="mt-2 space-y-2">
        {promises.map((text) => (
          <li key={text} className="flex gap-2 font-serif text-sm leading-snug text-ink">
            <span aria-hidden="true" className="text-ochre">
              ■
            </span>
            {text}
          </li>
        ))}
      </ul>
    )}
    <p className="mt-3 border-t border-rule pt-2 font-sans text-[11px] leading-relaxed text-ink-muted">
      O eleitor vai cobrar: promessas não cumpridas no prazo desgastam a aprovação ao longo do mandato.
    </p>
  </Card>
);
