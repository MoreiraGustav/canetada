import type { Difficulty, GameMode, WorldId } from '@/types';
import { DIFFICULTY_CONFIGS, DIFFICULTY_ORDER } from '@/constants/balance';
import { GAME_MODE_ORDER, GAME_MODES } from '@/constants/game';
import { SetupOptionCard } from './SetupOptionCard';

interface CareerRulesFieldsProps {
  world: WorldId;
  difficulty: Difficulty;
  presidencyMode: GameMode;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onPresidencyModeChange: (mode: GameMode) => void;
  onWorldChange: (world: WorldId) => void;
}

const LEGEND_CLASS = 'mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft';

const WORLD_OPTIONS: ReadonlyArray<{ id: WorldId; icon: string; title: string; meta: string; description: string }> = [
  {
    id: 'real',
    icon: '🗳️',
    title: 'Partidos reais',
    meta: '28 legendas · números de urna do TSE',
    description: 'PL, PT, MDB, PSD... com as bancadas eleitas em 2026. Os demais políticos do jogo são inventados.',
  },
  {
    id: 'ficticio',
    icon: '🗞️',
    title: 'Partidos fictícios',
    meta: '9 legendas inventadas',
    description: 'Um Brasil reconhecível, com partidos e políticos inventados.',
  },
];

/** Partidos (reais ou fictícios), dificuldade e duração do governo, se o personagem chegar ao Planalto. */
export const CareerRulesFields = ({ world, difficulty, presidencyMode, onDifficultyChange, onPresidencyModeChange, onWorldChange }: CareerRulesFieldsProps) => (
  <div className="space-y-6">
    <fieldset>
      <legend className={LEGEND_CLASS}>Partidos</legend>
      <div role="radiogroup" aria-label="Partidos" className="grid gap-3 sm:grid-cols-2">
        {WORLD_OPTIONS.map((option) => (
          <SetupOptionCard
            key={option.id}
            icon={option.icon}
            title={option.title}
            meta={option.meta}
            description={option.description}
            selected={world === option.id}
            onSelect={() => onWorldChange(option.id)}
          />
        ))}
      </div>
    </fieldset>
    <fieldset>
      <legend className={LEGEND_CLASS}>Dificuldade</legend>
      <div role="radiogroup" aria-label="Dificuldade" className="grid gap-3 sm:grid-cols-3">
        {DIFFICULTY_ORDER.map((id) => (
          <SetupOptionCard
            key={id}
            title={DIFFICULTY_CONFIGS[id].label}
            description={DIFFICULTY_CONFIGS[id].description}
            selected={difficulty === id}
            onSelect={() => onDifficultyChange(id)}
          />
        ))}
      </div>
    </fieldset>
    <fieldset>
      <legend className={LEGEND_CLASS}>Se chegar ao Planalto</legend>
      <p className="mb-3 font-serif text-sm text-ink-soft">
        Vencendo a eleição presidencial, a carreira vira o jogo de governo. Escolha quanto do mandato você quer jogar.
      </p>
      <div role="radiogroup" aria-label="Duração do governo" className="grid gap-3 sm:grid-cols-3">
        {GAME_MODE_ORDER.map((id) => {
          const config = GAME_MODES[id];
          return (
            <SetupOptionCard
              key={id}
              icon={config.icon}
              title={config.label}
              meta={`${config.turns} meses de governo`}
              description={config.description}
              selected={presidencyMode === id}
              onSelect={() => onPresidencyModeChange(id)}
            />
          );
        })}
      </div>
    </fieldset>
  </div>
);
