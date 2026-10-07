import { useShallow } from 'zustand/react/shallow';
import {
  useAllDecisionsChosen,
  useCongressView,
  useGoalViews,
  useIndicatorViews,
  useNewsArchive,
  usePromiseViews,
  useTurnDecisions,
  useTurnInfo,
} from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { useMetricsStore } from '@/stores/useMetricsStore';
import { Button } from '@/components/ui/Button';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { DashboardTabs } from '@/components/game/DashboardTabs';
import { DecisionList } from '@/components/game/DecisionList';
import { GoalProgressStrip } from '@/components/game/GoalProgressStrip';
import { IndicatorPanel } from '@/components/game/IndicatorPanel';
import { NewsFeed } from '@/components/game/NewsFeed';
import { PoliticalSpectrumCard } from '@/components/game/PoliticalSpectrumCard';
import { TurnAdvanceBar } from '@/components/game/TurnAdvanceBar';
import { PRIMARY_INDICATORS } from '@/constants/metrics';

/** Manchetes exibidas na primeira página do painel. */
const NEWS_SHOWN = 3;

/** Painel do turno (fase `turn`): indicadores, notícias, decisões do mês, metas e abas. */
export const DashboardScreen = () => {
  const turnInfo = useTurnInfo();
  const indicators = useIndicatorViews(PRIMARY_INDICATORS);
  const ideology = useMetricsStore(
    useShallow((state) => ({ economic: state.metrics.ideologyEconomic, social: state.metrics.ideologySocial })),
  );
  const news = useNewsArchive(NEWS_SHOWN);
  const decisions = useTurnDecisions();
  const { negotiationHints } = useCongressView();
  const allChosen = useAllDecisionsChosen();
  const goals = useGoalViews();
  const promises = usePromiseViews();
  const { goToMenu, chooseDecisionOption, toggleNegotiation, confirmDecisions } = useGameStore(
    useShallow((state) => ({
      goToMenu: state.goToMenu,
      chooseDecisionOption: state.chooseDecisionOption,
      toggleNegotiation: state.toggleNegotiation,
      confirmDecisions: state.confirmDecisions,
    })),
  );

  return (
    <PageContainer width="wide" className="pb-32">
      <Masthead
        compact
        dateline={`Brasília · ${turnInfo.dateShort} · ${turnInfo.termNumber}º mandato`}
        edition={`Mês ${turnInfo.termMonth}/${turnInfo.termLength} do mandato`}
        aside={
          <Button variant="secondary" size="sm" onClick={goToMenu} title="O jogo é salvo automaticamente">
            Menu
          </Button>
        }
      />
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside className="lg:sticky lg:top-4 lg:border-r lg:border-rule lg:pr-6">
          <IndicatorPanel indicators={indicators} />
          <PoliticalSpectrumCard economic={ideology.economic} social={ideology.social} />
        </aside>
        <div className="flex min-w-0 flex-col gap-10">
          <NewsFeed items={news} />
          <DecisionList
            decisions={decisions}
            negotiationHints={negotiationHints}
            onChoose={chooseDecisionOption}
            onToggleNegotiation={toggleNegotiation}
          />
          <GoalProgressStrip goals={goals} promises={promises} />
          <DashboardTabs />
        </div>
      </div>
      <TurnAdvanceBar enabled={allChosen} dateLabel={turnInfo.dateShort} onAdvance={confirmDecisions} />
    </PageContainer>
  );
};
