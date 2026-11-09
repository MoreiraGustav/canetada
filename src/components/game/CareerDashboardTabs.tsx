import { useState } from 'react';
import type { ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs } from '@/components/ui/Tabs';
import { CareerLadderTab } from './CareerLadderTab';
import { CareerPositionsTab } from './CareerPositionsTab';
import { CareerTimelineTab } from './CareerTimelineTab';

type CareerTabId = 'positions' | 'ladder' | 'timeline';

const TAB_ITEMS: ReadonlyArray<{ id: CareerTabId; label: string; icon: string }> = [
  { id: 'positions', label: 'Cargos e partido', icon: '🗂️' },
  { id: 'ladder', label: 'Plano de carreira', icon: '🪜' },
  { id: 'timeline', label: 'Trajetória', icon: '📜' },
];

/** Painel de cada aba (lookup por ID; só a aba ativa assina as stores). */
const TAB_PANELS: Record<CareerTabId, ComponentType> = {
  positions: CareerPositionsTab,
  ladder: CareerLadderTab,
  timeline: CareerTimelineTab,
};

/** Área secundária do painel da carreira: cargos e partido, plano de carreira e trajetória. */
export const CareerDashboardTabs = () => {
  const [active, setActive] = useState<CareerTabId>('positions');
  const Panel = TAB_PANELS[active];
  return (
    <section aria-label="Bastidores da carreira">
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
