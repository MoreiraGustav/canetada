import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  useCareerAdmin,
  useCareerAgenda,
  useCareerCountdown,
  useCareerGovernments,
  useCareerMetrics,
  useCareerNews,
  useCareerProfile,
} from '@/stores/selectors';
import { useCareerStore } from '@/stores/useCareerStore';
import { useGameStore } from '@/stores/useGameStore';
import { CareerAdminPanel } from '@/components/game/CareerAdminPanel';
import { CareerAdvanceBar } from '@/components/game/CareerAdvanceBar';
import { CareerAgendaPanel } from '@/components/game/CareerAgendaPanel';
import { CareerCastPanel } from '@/components/game/CareerCastPanel';
import { CareerDashboardTabs } from '@/components/game/CareerDashboardTabs';
import { CareerGovernmentsCard } from '@/components/game/CareerGovernmentsCard';
import { CareerMetricsPanel } from '@/components/game/CareerMetricsPanel';
import { CareerNewsFeed } from '@/components/game/CareerNewsFeed';
import { CareerPreCampaignCard } from '@/components/game/CareerPreCampaignCard';
import { CareerProfileCard } from '@/components/game/CareerProfileCard';
import { CareerRetireDialog } from '@/components/game/CareerRetireDialog';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { CAREER_NEWSPAPER_TITLE } from '@/constants/career';

/** Manchetes exibidas na primeira página do painel. */
const NEWS_SHOWN = 5;

/** Painel do semestre na carreira: ficha, indicadores, agenda, gestão e bastidores. */
export const CareerDashboardScreen = () => {
  const profile = useCareerProfile();
  const metrics = useCareerMetrics();
  const countdown = useCareerCountdown();
  const governments = useCareerGovernments();
  const news = useCareerNews(NEWS_SHOWN);
  const agenda = useCareerAgenda();
  const admin = useCareerAdmin();
  const programChosen = useCareerStore((state) => state.plannedProgramId !== null);
  const { toggleAction, toggleProgram } = useCareerStore(useShallow((state) => ({ toggleAction: state.toggleAction, toggleProgram: state.toggleProgram })));
  const { goToMenu, endCareerSemester, retireCareer } = useGameStore(
    useShallow((state) => ({ goToMenu: state.goToMenu, endCareerSemester: state.endCareerSemester, retireCareer: state.retireCareer })),
  );
  const [retireOpen, setRetireOpen] = useState(false);

  if (!profile) return <LoadingScreen />;

  return (
    <PageContainer width="wide" className="pb-32">
      <Masthead
        compact
        title={CAREER_NEWSPAPER_TITLE}
        dateline={`${profile.city?.name ?? ''} · ${profile.uf} · ${profile.dateLabel}`}
        edition={profile.positionTitle}
        aside={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRetireOpen(true)}>
              Aposentar
            </Button>
            <Button variant="secondary" size="sm" onClick={goToMenu} title="O jogo é salvo automaticamente">
              Menu
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:border-r lg:border-rule lg:pr-6">
          <CareerProfileCard profile={profile} countdown={countdown} />
          <CareerMetricsPanel metrics={metrics} />
          <CareerGovernmentsCard governments={governments} />
        </aside>
        <div className="flex min-w-0 flex-col gap-10">
          <CareerNewsFeed items={news} kicker={`📰 ${CAREER_NEWSPAPER_TITLE}`} />
          <CareerPreCampaignCard />
          {admin && <CareerAdminPanel view={admin} onToggleProgram={toggleProgram} />}
          <CareerAgendaPanel actions={agenda.actions} chosen={agenda.chosen} max={agenda.max} onToggle={toggleAction} />
          <CareerCastPanel />
          <CareerDashboardTabs />
        </div>
      </div>
      <CareerAdvanceBar
        dateLabel={profile.dateLabel}
        chosen={agenda.chosen}
        max={agenda.max}
        programPending={admin !== null && !programChosen}
        onAdvance={endCareerSemester}
      />
      <CareerRetireDialog open={retireOpen} name={profile.politicalName} onCancel={() => setRetireOpen(false)} onConfirm={retireCareer} />
    </PageContainer>
  );
};
