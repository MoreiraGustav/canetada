import { useShallow } from 'zustand/react/shallow';
import { useCareerAppointments, useCareerParties, useCareerSwitchCheck } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CareerAppointmentsPanel } from './CareerAppointmentsPanel';
import { CareerPartySwitchPanel } from './CareerPartySwitchPanel';

/** Aba "Cargos e partido": cargos de confiança e troca de partido. */
export const CareerPositionsTab = () => {
  const appointments = useCareerAppointments();
  const parties = useCareerParties();
  const switchCheck = useCareerSwitchCheck();
  const { takeCareerAppointment, leaveCareerAppointment, switchCareerParty } = useGameStore(
    useShallow((state) => ({
      takeCareerAppointment: state.takeCareerAppointment,
      leaveCareerAppointment: state.leaveCareerAppointment,
      switchCareerParty: state.switchCareerParty,
    })),
  );
  return (
    <div className="flex flex-col gap-6">
      <CareerAppointmentsPanel appointments={appointments} onTake={takeCareerAppointment} onLeave={leaveCareerAppointment} />
      <CareerPartySwitchPanel parties={parties} check={switchCheck} onSwitch={switchCareerParty} />
    </div>
  );
};
