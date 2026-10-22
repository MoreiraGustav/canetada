import { useState } from 'react';
import { motion } from 'framer-motion';
import { hasRealWorld } from '@/stores/content';
import { useGameStore } from '@/stores/useGameStore';
import { SetupOptionCard } from '@/components/game/SetupOptionCard';
import { Button } from '@/components/ui/Button';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Difficulty, GameMode, WorldId } from '@/types';
import { DIFFICULTY_CONFIGS, DIFFICULTY_ORDER } from '@/constants/balance';
import { GAME_MODE_ORDER, GAME_MODES } from '@/constants/game';

const DEFAULT_MODE: GameMode = 'standard';
const DEFAULT_DIFFICULTY: Difficulty = 'normal';
const DEFAULT_WORLD: WorldId = 'ficticio';

const WORLD_OPTIONS: ReadonlyArray<{ id: WorldId; icon: string; title: string; meta: string; description: string }> = [
  {
    id: 'ficticio',
    icon: '🗞️',
    title: 'Brasil fictício',
    meta: 'Partidos e políticos inventados',
    description: 'Um Brasil reconhecível, com partidos e candidatos fictícios. Livre para qualquer estratégia.',
  },
  {
    id: 'real',
    icon: '🗳️',
    title: 'Brasil real',
    meta: 'Eleição de 2026 · cenários hipotéticos',
    description: 'Candidatos de 2026 e bancadas eleitas para a Câmara. Ministros e governadores seguem fictícios.',
  },
];

/** Configuração da partida: qual Brasil, duração do mandato e dificuldade. */
export const SetupScreen = () => {
  const startNewGame = useGameStore((state) => state.startNewGame);
  const goToMenu = useGameStore((state) => state.goToMenu);
  const [mode, setMode] = useState<GameMode>(DEFAULT_MODE);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [world, setWorld] = useState<WorldId>(DEFAULT_WORLD);
  const showWorlds = hasRealWorld();
  const steps = showWorlds ? 3 : 2;

  return (
    <PageContainer width="medium">
      <Masthead compact dateline="Brasília · Edição Especial" edition="Configuração da partida" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {showWorlds && (
          <section className="mb-10">
            <SectionHeading kicker={`Passo 1 de ${steps}`} title="Qual Brasil?" />
            <div role="radiogroup" aria-label="Mundo da partida" className="grid gap-3 sm:grid-cols-2">
              {WORLD_OPTIONS.map((option) => (
                <SetupOptionCard
                  key={option.id}
                  icon={option.icon}
                  title={option.title}
                  meta={option.meta}
                  description={option.description}
                  selected={world === option.id}
                  onSelect={() => setWorld(option.id)}
                />
              ))}
            </div>
            {world === 'real' && (
              <p className="mt-2 font-sans text-[11px] leading-snug text-ink-muted">
                Obra de ficção: pessoas reais aparecem só com cargos e propostas públicas, em situações hipotéticas. Escândalos e falas do
                jogo nunca são atribuídos a elas. Fotos com licença livre, creditadas.
              </p>
            )}
          </section>
        )}
        <section>
          <SectionHeading kicker={`Passo ${steps - 1} de ${steps}`} title="Duração do mandato" />
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
          <SectionHeading kicker={`Passo ${steps} de ${steps}`} title="Dificuldade" />
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
          <Button size="lg" onClick={() => startNewGame(mode, difficulty, world)}>
            Escolher candidato
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
};
