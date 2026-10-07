import { useShallow } from 'zustand/react/shallow';
import { useGameResult, useGoalViews, useHistorySeries } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { ResultApprovalChart } from '@/components/game/ResultApprovalChart';
import { ResultGoals } from '@/components/game/ResultGoals';
import { ResultRevelations } from '@/components/game/ResultRevelations';
import { ResultHeadline } from '@/components/game/ResultHeadline';
import { ResultStats } from '@/components/game/ResultStats';
import { ScoreBreakdown } from '@/components/game/ScoreBreakdown';
import { ScoreTotal } from '@/components/game/ScoreTotal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { formatTurnLong } from '@/utils/calendar';

/** Fase "resultado": desfecho, legado e pontuação final. */
export const ResultScreen = () => {
  const { ending, score } = useGameResult();
  const { stats, abandonGame, goToSetup } = useGameStore(
    useShallow((state) => ({ stats: state.stats, abandonGame: state.abandonGame, goToSetup: state.goToSetup })),
  );
  const goals = useGoalViews();
  const history = useHistorySeries();

  if (!ending || !score) return <LoadingScreen />;

  const startNewGame = (): void => {
    abandonGame();
    goToSetup();
  };

  return (
    <PageContainer width="wide">
      <Masthead dateline={formatTurnLong(ending.turn)} edition="Edição histórica" />
      <ResultHeadline ending={ending} legacyTitle={score.legacyTitle} legacyDescription={score.legacyDescription} />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <ScoreTotal total={score.total} />
          <Card>
            <ScoreBreakdown score={score} />
          </Card>
        </div>
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ResultRevelations revelations={score.revelations} />
          <ResultApprovalChart data={history} />
          <ResultStats stats={stats} />
          <ResultGoals goals={goals} />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t-4 border-double border-ink pt-6 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={startNewGame}>
          Novo mandato (nova partida)
        </Button>
        <Button variant="secondary" size="lg" onClick={abandonGame}>
          Voltar ao menu
        </Button>
      </div>
    </PageContainer>
  );
};
