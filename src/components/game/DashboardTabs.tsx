import { useState } from 'react';
import type { ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs } from '@/components/ui/Tabs';
import { ActiveEffectsPanel } from './ActiveEffectsPanel';
import { CongressPanel } from './CongressPanel';
import { DiplomacyPanel } from './DiplomacyPanel';
import { HistoryChartPanel } from './HistoryChartPanel';
import { PresidentialAgendaPanel } from './PresidentialAgendaPanel';
import { SecondaryIndicatorsPanel } from './SecondaryIndicatorsPanel';

type DashboardTabId = 'agenda' | 'congress' | 'diplomacy' | 'indicators' | 'charts' | 'effects';

const TAB_ITEMS: ReadonlyArray<{ id: DashboardTabId; label: string; icon: string }> = [
  { id: 'agenda', label: 'Agenda', icon: '🗓️' },
  { id: 'congress', label: 'Congresso', icon: '⚖️' },
  { id: 'diplomacy', label: 'Diplomacia', icon: '🌍' },
  { id: 'indicators', label: 'Indicadores', icon: '📋' },
  { id: 'charts', label: 'Gráficos', icon: '📈' },
  { id: 'effects', label: 'Em andamento', icon: '⏳' },
];

/** Painel de cada aba (lookup por ID; só a aba ativa assina as stores). */
const TAB_PANELS: Record<DashboardTabId, ComponentType> = {
  agenda: PresidentialAgendaPanel,
  congress: CongressPanel,
  diplomacy: DiplomacyPanel,
  indicators: SecondaryIndicatorsPanel,
  charts: HistoryChartPanel,
  effects: ActiveEffectsPanel,
};

/** Área secundária do painel: agenda presidencial, Congresso, diplomacia, indicadores, gráficos e efeitos. */
export const DashboardTabs = () => {
  const [active, setActive] = useState<DashboardTabId>('agenda');
  const Panel = TAB_PANELS[active];
  return (
    <section aria-label="Painéis do governo">
      <Tabs items={TAB_ITEMS} active={active} onChange={setActive} />
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          role="tabpanel"
          className="pt-5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <Panel />
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
