import { usePublicAccountsView } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { DebtDriversBars } from './DebtDriversBars';
import { DebtProjectionChart } from './DebtProjectionChart';
import { FiscalStancePicker } from './FiscalStancePicker';
import { PublicAccountsSummary } from './PublicAccountsSummary';

const SUBHEADING = 'mb-2 mt-5 font-sans text-xs font-bold uppercase tracking-wider text-ink-soft';

/**
 * Contas públicas: quanto o governo deve e paga de juros, por que a dívida se
 * move e a política fiscal — a alavanca direta do presidente sobre a dívida.
 */
export const PublicAccountsPanel = () => {
  const view = usePublicAccountsView();
  const setFiscalStance = useGameStore((state) => state.setFiscalStance);
  return (
    <div>
      <p className="mb-3 font-serif text-sm leading-relaxed text-ink-soft">
        Valores em reais de 2026. A dívida só cai de forma sustentável com superávit primário, juros menores ou crescimento. Cada escolha de
        gasto mostra quanto custa em reais e o que faz com a dívida.
      </p>
      <PublicAccountsSummary accounts={view.accounts} debt={view.debt} primaryBalance={view.primaryBalance} />
      <h3 className={SUBHEADING}>Por que a dívida se move</h3>
      <DebtDriversBars drivers={view.accounts.drivers} />
      <h3 className={SUBHEADING}>Política fiscal</h3>
      <FiscalStancePicker stances={view.stances} canChange={view.canChange} cooldownLeft={view.cooldownLeft} onChoose={setFiscalStance} />
      <h3 className={SUBHEADING}>Dívida nos próximos 4 anos</h3>
      <DebtProjectionChart data={view.projection} stances={view.stances} />
      <p className="mt-1 font-sans text-[10px] text-ink-muted">
        Projeção sem novas decisões nem crises: a linha cheia é a política em vigor; as tracejadas, as alternativas.
      </p>
    </div>
  );
};
