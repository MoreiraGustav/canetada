import { SectionHeading } from '@/components/ui/SectionHeading';
import { DecisionCard } from './DecisionCard';
import { ImpactLegend } from './ImpactLegend';
import type { DecisionView, ImpactHint } from '@/types';

interface DecisionListProps {
  decisions: readonly DecisionView[];
  negotiationHints: readonly ImpactHint[];
  onChoose: (decisionId: string, optionId: string) => void;
  onToggleNegotiation: (decisionId: string) => void;
}

/** Pauta do mês: decisões ministeriais pendentes com contador de progresso. */
export const DecisionList = ({ decisions, negotiationHints, onChoose, onToggleNegotiation }: DecisionListProps) => {
  const decidedCount = decisions.filter((view) => view.choice !== null).length;
  const counter =
    decisions.length > 0 ? (
      <span className="whitespace-nowrap font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft tabular-nums">
        {decidedCount} de {decisions.length} decididas
      </span>
    ) : undefined;

  return (
    <section aria-label="Decisões pendentes">
      <SectionHeading kicker="Gabinete presidencial" title={`Decisões do mês (${decisions.length})`} aside={counter} />
      {decisions.length > 0 && <ImpactLegend className="-mt-1 mb-4" />}
      {decisions.length === 0 ? (
        <p className="border-l-4 border-rule bg-paper-dark/60 px-4 py-3 font-serif italic text-ink-soft">
          Mês tranquilo na Esplanada: nenhum ministério trouxe decisões à mesa. Aproveite para cuidar da diplomacia e
          acompanhar os indicadores.
        </p>
      ) : (
        <ol className="space-y-5">
          {decisions.map((view, index) => (
            <li key={view.decision.id}>
              <DecisionCard
                view={view}
                index={index + 1}
                negotiationHints={negotiationHints}
                onChoose={onChoose}
                onToggleNegotiation={onToggleNegotiation}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
