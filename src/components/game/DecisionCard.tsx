import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PortraitImage } from '@/components/ui/PortraitImage';
import { DecisionDecidedRow } from './DecisionDecidedRow';
import { DecisionOptionCard } from './DecisionOptionCard';
import type { DecisionView, NegotiationView } from '@/types';

interface DecisionCardProps {
  view: DecisionView;
  /** Posição na lista (1-based), exibida como número da pauta. */
  index: number;
  negotiation: NegotiationView;
  onChoose: (decisionId: string, optionId: string) => void;
  onToggleNegotiation: (decisionId: string) => void;
}

const OPTION_MARKERS = 'ABCDEFGH';

/** Dilema de um ministério: opções selecionáveis; depois de decidido, recolhe em uma linha. */
export const DecisionCard = ({ view, index, negotiation, onChoose, onToggleNegotiation }: DecisionCardProps) => {
  const { decision, ministry, choice } = view;
  const [editing, setEditing] = useState(false);
  const chosen = choice ? view.options.find((optionView) => optionView.option.id === choice.optionId) : undefined;
  const collapsed = chosen !== undefined && !editing;

  const handleChoose = (optionId: string): void => {
    onChoose(decision.id, optionId);
    setEditing(false);
  };

  return (
    <Card emphasis className={collapsed ? 'opacity-90' : ''}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
          <span aria-hidden="true" className="mr-1">
            {ministry.icon}
          </span>
          {ministry.shortName}
        </p>
        {choice ? <Badge tone="positive">Decidida</Badge> : <Badge tone="warning">Pendente</Badge>}
      </div>
      <h3 className="mt-1 font-display text-lg font-bold leading-tight text-ink sm:text-xl">
        <span className="mr-2 text-ink-muted">{index}.</span>
        {decision.title}
      </h3>
      {view.minister && !collapsed && (
        <p className="mt-1.5 flex items-center gap-2 font-sans text-[11px] text-ink-soft">
          <PortraitImage portrait={view.minister.portrait} name={view.minister.name} size="xs" />
          <span>
            Pauta levada por <strong className="text-ink">{view.minister.name}</strong> · {view.minister.caption}
          </span>
        </p>
      )}
      {collapsed && chosen ? (
        <DecisionDecidedRow
          chosen={chosen}
          negotiating={choice?.negotiate ?? false}
          negotiation={negotiation}
          onEdit={() => setEditing(true)}
          onToggleNegotiation={() => onToggleNegotiation(decision.id)}
        />
      ) : (
        <>
          <p className="mt-1.5 font-serif text-sm leading-relaxed text-ink-soft sm:text-base">{decision.context}</p>
          <div role="group" aria-label={`Opções: ${decision.title}`} className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {view.options.map((optionView, optionIndex) => (
              <DecisionOptionCard
                key={optionView.option.id}
                view={optionView}
                marker={OPTION_MARKERS.charAt(optionIndex)}
                selected={choice?.optionId === optionView.option.id}
                onSelect={() => handleChoose(optionView.option.id)}
              />
            ))}
          </div>
        </>
      )}
    </Card>
  );
};
