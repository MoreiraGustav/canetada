import { motion } from 'framer-motion';
import type { CrisisActionView } from '@/types';
import { PresidentialActionCard } from './PresidentialActionCard';

interface CrisisCabinetPanelProps {
  actions: readonly CrisisActionView[];
  /** A medida do mês ainda não foi tomada. */
  canAct: boolean;
  onTake: (actionId: string) => void;
}

/**
 * Gabinete de crise: aparece só quando algum indicador entra no vermelho e
 * oferece medidas de emergência (uma por mês) para estancar a bola de neve.
 */
export const CrisisCabinetPanel = ({ actions, canAct, onTake }: CrisisCabinetPanelProps) => {
  if (actions.length === 0) return null;
  return (
    <motion.section
      aria-labelledby="crisis-cabinet-title"
      className="border-2 border-accent bg-accent-light/30 p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="crisis-cabinet-title" className="font-display text-xl font-bold text-accent-dark">
          🚨 Gabinete de crise
        </h2>
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-accent-dark">
          {canAct ? '1 medida de emergência por mês' : 'Medida deste mês já tomada'}
        </span>
      </div>
      <p className="mb-3 font-serif text-sm leading-snug text-ink-soft">
        Indicadores no vermelho liberam medidas mais fortes que as decisões comuns. Elas estancam a crise, mas cada uma cobra seu preço.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((view) => (
          <PresidentialActionCard
            key={view.action.id}
            view={view}
            monthUsed={!canAct}
            onTake={onTake}
            kicker={`⚠ ${view.trigger}`}
            usedLabel="Medida do mês já tomada"
          />
        ))}
      </div>
    </motion.section>
  );
};
