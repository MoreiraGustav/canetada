import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { VoteSessionItem } from '@/types';
import { VoteSessionStage } from './VoteSessionStage';

interface VoteSessionOverlayProps {
  items: readonly VoteSessionItem[];
  onClose: () => void;
}

/**
 * Sessão deliberativa no Congresso: as votações do mês passam uma a uma no plenário
 * (PECs na Câmara e no Senado), com o painel, o placar, o carimbo e o porquê do resultado.
 */
export const VoteSessionOverlay = ({ items, onClose }: VoteSessionOverlayProps) => {
  const [index, setIndex] = useState(0);
  const isLast = index >= items.length - 1;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const item = items[index];
  if (!item) return null;
  const next = (): void => {
    if (isLast) onClose();
    else setIndex(index + 1);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Sessão de votação no Congresso Nacional"
        className="max-h-[94vh] w-full max-w-4xl overflow-y-auto border-t-4 border-ink bg-paper p-4 shadow-lifted sm:border sm:p-6"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="mb-3 flex items-center justify-between gap-3 border-b-4 border-double border-ink pb-2">
          <p className="font-display text-lg font-bold text-ink">🏛️ Congresso Nacional · Sessão deliberativa</p>
          <button type="button" onClick={onClose} className="font-sans text-xl leading-none text-ink-soft hover:text-ink" aria-label="Fechar">
            ×
          </button>
        </div>
        <VoteSessionStage key={item.vote.decisionId} item={item} position={`Votação ${index + 1} de ${items.length}`} />
        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-rule pt-3">
          <Button variant="primary" size="sm" onClick={next}>
            {isLast ? 'Ver o jornal do mês' : 'Próxima votação ▶'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
