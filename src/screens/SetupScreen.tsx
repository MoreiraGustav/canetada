import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/useGameStore';
import { SetupOptionCard } from '@/components/game/SetupOptionCard';
import { Button } from '@/components/ui/Button';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Difficulty, GameMode } from '@/types';
import { DIFFICULTY_CONFIGS, DIFFICULTY_ORDER } from '@/constants/balance';
import { GAME_MODE_ORDER, GAME_MODES } from '@/constants/game';

const DEFAULT_MODE: GameMode = 'standard';
const DEFAULT_DIFFICULTY: Difficulty = 'normal';

/** Configuração da partida: duração do mandato e dificuldade. */
export const SetupScreen = () => {
  const startNewGame = useGameStore((state) => state.startNewGame);
  const goToMenu = useGameStore((state) => state.goToMenu);
  const [mode, setMode] = useState<GameMode>(DEFAULT_MODE);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);

  return (
    <PageContainer width="medium">
      <Masthead compact dateline="Brasília · Edição Especial" edition="Configuração da partida" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <section>
          <SectionHeading kicker="Passo 1 de 2" title="Duração do mandato" />
          <div role="radiogroup" aria-label="Duração do mandato" className="grid gap-3 sm:grid-cols-3">
            {GAME_MODE_ORDER.map((id) => {
              const config = GAME_MODES[id];
              return (
                <SetupOptionCard
                  key={id}
                  icon={config.icon}
                  title={config.label}
                  meta={`${config.turns} meses · ${config.duration}`}
                  description={config.description}
                  selected={mode === id}
                  onSelect={() => setMode(id)}
                />
              );
            })}
          </div>
        </section>
        <section className="mt-10">
          <SectionHeading kicker="Passo 2 de 2" title="Dificuldade" />
          <div role="radiogroup" aria-label="Dificuldade" className="grid gap-3 sm:grid-cols-3">
            {DIFFICULTY_ORDER.map((id) => (
              <SetupOptionCard
                key={id}
                title={DIFFICULTY_CONFIGS[id].label}
                description={DIFFICULTY_CONFIGS[id].description}
                selected={difficulty === id}
                onSelect={() => setDifficulty(id)}
              />
            ))}
          </div>
        </section>
        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-ink pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={goToMenu}>
            ← Voltar
          </Button>
          <Button size="lg" onClick={() => startNewGame(mode, difficulty)}>
            Escolher candidato
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
};
