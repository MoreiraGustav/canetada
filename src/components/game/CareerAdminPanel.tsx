import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { CareerAdminView } from '@/types';
import { formatNumber, formatSigned } from '@/utils/format';
import { CareerActionCard } from './CareerActionCard';

interface CareerAdminPanelProps {
  view: CareerAdminView;
  onToggleProgram: (programId: string) => void;
}

/** Abaixo disto o serviço (ou as contas) está em crise. */
const CRISIS_LEVEL = 30;
const GOOD_APPROVAL = 50;

/** Gestão: aprovação, serviços e contas, e o programa do semestre (um por vez). */
export const CareerAdminPanel = ({ view, onToggleProgram }: CareerAdminPanelProps) => {
  const chosen = view.programs.some((program) => program.selected);
  return (
    <section aria-label="Gestão">
      <SectionHeading kicker={`🏛️ ${view.title}`} title="A gestão decide a reeleição" />
      <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="border border-rule bg-paper-dark p-3 text-center">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Aprovação da gestão</p>
          <p className={`font-display text-4xl font-black tabular-nums ${view.approval >= GOOD_APPROVAL ? 'text-positive' : 'text-negative'}`}>
            {formatNumber(view.approval, 0)}%
          </p>
          {view.approvalDelta !== null && Math.abs(view.approvalDelta) >= 1 && (
            <p className="font-sans text-[11px] text-ink-muted">{formatSigned(view.approvalDelta, 0)} no semestre</p>
          )}
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {view.indicators.map((indicator) => (
            <li key={indicator.key}>
              <div className="flex justify-between font-sans text-[11px] font-semibold text-ink-soft">
                <span>
                  <span aria-hidden="true">{indicator.icon}</span> {indicator.label}
                </span>
                <span className="tabular-nums">{formatNumber(indicator.value, 0)}</span>
              </div>
              <ProgressBar value={indicator.value} tone={indicator.value < CRISIS_LEVEL ? 'negative' : 'info'} height="xs" label={indicator.label} />
            </li>
          ))}
        </ul>
      </div>
      <p className="mb-3 mt-4 font-serif text-sm text-ink-soft">
        Escolha um programa por semestre. Serviços melhores rendem aprovação; contas no vermelho atrasam salários e derrubam tudo.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {view.programs.map((program) => (
          <CareerActionCard key={program.action.id} view={program} full={chosen} onToggle={onToggleProgram} />
        ))}
      </div>
    </section>
  );
};
