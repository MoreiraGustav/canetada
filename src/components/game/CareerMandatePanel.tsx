import { useShallow } from 'zustand/react/shallow';
import { useCareerMandate } from '@/stores/selectors';
import { useCareerStore } from '@/stores/useCareerStore';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CareerAmendmentsPanel } from './CareerAmendmentsPanel';
import { CareerBillsPanel } from './CareerBillsPanel';
import { CareerFloorVoteCard } from './CareerFloorVoteCard';

/** Mandato no Legislativo: a votação do semestre, os projetos de lei e as emendas. */
export const CareerMandatePanel = () => {
  const view = useCareerMandate();
  const { setVote, toggleBill, toggleAmendment } = useCareerStore(
    useShallow((state) => ({ setVote: state.setVote, toggleBill: state.toggleBill, toggleAmendment: state.toggleAmendment })),
  );
  if (!view) return null;
  const lawsLabel = `${view.laws} ${view.laws === 1 ? 'lei aprovada' : 'leis aprovadas'}`;
  return (
    <section aria-label="Mandato" className="flex flex-col gap-6">
      <div>
        <SectionHeading kicker="📜 Mandato" title={view.title} className="mb-1" />
        <p className="font-sans text-[11px] text-ink-soft">
          {lawsLabel} · {view.votesWithParty} votos com o partido e {view.votesAgainstParty} contra · {view.amendmentsTotalLabel} em emendas
        </p>
      </div>
      {view.vote && <CareerFloorVoteCard view={view.vote} onVote={setVote} />}
      <CareerBillsPanel active={view.activeBills} available={view.availableBills} maxBills={view.maxBills} planned={view.billPlanned} onPlan={toggleBill} />
      <CareerAmendmentsPanel
        options={view.amendments}
        trancheLabel={view.trancheLabel}
        annualLabel={view.annualLabel}
        oppositionDelay={view.oppositionDelay}
        onToggle={toggleAmendment}
      />
    </section>
  );
};
