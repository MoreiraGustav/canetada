import { useState } from 'react';
import { motion } from 'framer-motion';
import { getGoalDefinitions } from '@/stores/content';
import { useCandidateView } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CampaignPromiseList } from '@/components/game/CampaignPromiseList';
import { GoalOptionCard } from '@/components/game/GoalOptionCard';
import { Button } from '@/components/ui/Button';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useCampaignPromiseTexts } from '@/hooks/useCampaignPromiseTexts';
import { GAME_MODES, GOALS_TO_SELECT } from '@/constants/game';
import { describeGoalTarget } from '@/utils/goalText';

const FULL_SCALE = 1;
const PERCENT = 100;

/** Escolha das metas prioritárias do mandato (GDD §4.5) antes da posse. */
export const GoalsScreen = () => {
  const confirmGoals = useGameStore((state) => state.confirmGoals);
  const mode = useGameStore((state) => state.mode);
  const candidateView = useCandidateView();
  const promises = useCampaignPromiseTexts();
  const [selected, setSelected] = useState<string[]>([]);
  const goals = getGoalDefinitions();
  const isComplete = selected.length === GOALS_TO_SELECT;
  const modeConfig = GAME_MODES[mode];

  const toggle = (goalId: string): void =>
    setSelected((current) => {
      if (current.includes(goalId)) return current.filter((id) => id !== goalId);
      return current.length < GOALS_TO_SELECT ? [...current, goalId] : current;
    });

  return (
    <PageContainer width="wide">
      <Masthead compact dateline="Brasília · Gabinete de transição" edition="Plano de governo" />
      <SectionHeading
        kicker={candidateView ? `Presidente eleito(a): ${candidateView.candidate.name}` : 'Gabinete de transição'}
        title="Quais serão as prioridades do governo?"
        size="lg"
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <p className="mb-4 font-serif text-ink-soft">
            Escolha <strong className="text-ink">{GOALS_TO_SELECT} metas</strong>. Elas guiarão a avaliação do seu legado ao fim do
            mandato.
            {modeConfig.goalScale < FULL_SCALE &&
              ` Os critérios abaixo valem para o Mandato Completo; no modo ${modeConfig.label}, será exigido ${Math.round(modeConfig.goalScale * PERCENT)}% do avanço.`}
          </p>
          <div role="group" aria-label="Metas do mandato" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal, index) => (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.03 }}>
                <GoalOptionCard
                  icon={goal.icon}
                  title={goal.title}
                  description={goal.description}
                  criteria={describeGoalTarget(goal)}
                  selected={selected.includes(goal.id)}
                  disabled={isComplete && !selected.includes(goal.id)}
                  onToggle={() => toggle(goal.id)}
                />
              </motion.div>
            ))}
          </div>
        </section>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <CampaignPromiseList promises={promises} />
          <div className="border border-ink p-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft" aria-live="polite">
              {selected.length} de {GOALS_TO_SELECT} metas escolhidas
            </p>
            <Button size="lg" variant="accent" fullWidth className="mt-3" disabled={!isComplete} onClick={() => confirmGoals(selected)}>
              Tomar posse
            </Button>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
};
