import { Button } from '@/components/ui/Button';
import type { CareerAppointmentView } from '@/types';
import { ImpactHintList } from './ImpactHintList';

interface CareerAppointmentsPanelProps {
  appointments: readonly CareerAppointmentView[];
  onTake: (appointmentId: string) => void;
  onLeave: () => void;
}

/** Cargos de confiança: gabinetes, secretarias e ministérios (requisitos e ganhos por semestre). */
export const CareerAppointmentsPanel = ({ appointments, onTake, onLeave }: CareerAppointmentsPanelProps) => (
  <section aria-label="Cargos de confiança">
    <h3 className="mb-1 font-display text-xl font-bold text-ink">Cargos de confiança</h3>
    <p className="mb-3 font-serif text-sm text-ink-soft">
      Crescer dentro da máquina: cada cargo rende pontos todo semestre. Secretarias e ministérios exigem que seu partido (ou um aliado) governe.
      Na campanha você se licencia; se perder a eleição, volta ao cargo.
    </p>
    <ul className="grid gap-2 md:grid-cols-2">
      {appointments.map(({ appointment, check, current, hints }) => (
        <li key={appointment.id} className={`flex flex-col gap-1.5 border p-3 ${current ? 'border-ink bg-paper-dark' : 'border-rule bg-paper'}`}>
          <p className="flex items-start gap-2 font-serif text-base font-semibold text-ink">
            <span aria-hidden="true">{appointment.icon}</span>
            {appointment.name}
          </p>
          <p className="font-serif text-sm leading-snug text-ink-soft">{appointment.description}</p>
          <ImpactHintList hints={hints} />
          {current ? (
            <Button variant="ghost" size="sm" onClick={onLeave} className="self-start">
              Deixar o cargo
            </Button>
          ) : check.ok ? (
            <Button variant="secondary" size="sm" onClick={() => onTake(appointment.id)} className="self-start">
              Assumir o cargo
            </Button>
          ) : (
            <p className="font-sans text-[11px] font-semibold text-ink-muted">✗ {check.reason}</p>
          )}
        </li>
      ))}
    </ul>
  </section>
);
