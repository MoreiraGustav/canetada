import { useState } from 'react';
import { motion } from 'framer-motion';
import { getSavedGameSummary } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { MenuLeadStory } from '@/components/game/MenuLeadStory';
import { MenuSavedGameCard } from '@/components/game/MenuSavedGameCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Masthead } from '@/components/ui/Masthead';
import { Modal } from '@/components/ui/Modal';
import { PageContainer } from '@/components/ui/PageContainer';

/** Primeira página do jornal: apresentação, novo jogo e partida salva. */
export const MenuScreen = () => {
  const goToSetup = useGameStore((state) => state.goToSetup);
  const continueSavedGame = useGameStore((state) => state.continueSavedGame);
  const abandonGame = useGameStore((state) => state.abandonGame);
  const [summary, setSummary] = useState(() => getSavedGameSummary());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleContinue = (): void => {
    if (!continueSavedGame()) setSummary(null);
  };

  const handleDelete = (): void => {
    abandonGame();
    setSummary(null);
    setConfirmOpen(false);
  };

  return (
    <PageContainer width="wide">
      <Masthead title="Canetada" dateline="Simulador Presidencial · Brasília" edition="Edição Especial" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <MenuLeadStory />
        </motion.div>
        <motion.aside
          className="flex flex-col gap-4 lg:border-l lg:border-rule lg:pl-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Nova partida</p>
            <p className="mt-2 font-serif text-sm leading-relaxed text-ink-soft">
              Defina a duração do mandato e a dificuldade, escolha seu candidato e comece a campanha.
            </p>
            <Button size="lg" fullWidth className="mt-4" onClick={goToSetup}>
              Novo jogo
            </Button>
          </Card>
          {summary && <MenuSavedGameCard summary={summary} onContinue={handleContinue} onDelete={() => setConfirmOpen(true)} />}
          <p className="font-sans text-[11px] leading-relaxed text-ink-muted">
            O progresso é salvo automaticamente neste navegador. Candidatos, partidos e eventos são fictícios.
          </p>
        </motion.aside>
      </div>
      <Modal
        open={confirmOpen}
        title="Apagar partida salva?"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="accent" onClick={handleDelete}>
              Apagar
            </Button>
          </>
        }
      >
        <p className="font-serif leading-relaxed text-ink-soft">
          A partida de <strong className="text-ink">{summary?.candidateName}</strong> será apagada definitivamente. Esta ação
          não pode ser desfeita.
        </p>
      </Modal>
    </PageContainer>
  );
};
