import { useShallow } from 'zustand/react/shallow';
import { useCareerLegacy } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CareerElectionHistory } from '@/components/game/CareerElectionHistory';
import { CareerLegacyHeadline } from '@/components/game/CareerLegacyHeadline';
import { CareerTimelineList } from '@/components/game/CareerTimelineList';
import { ElectionStatTile } from '@/components/game/ElectionStatTile';
import { ScoreTotal } from '@/components/game/ScoreTotal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { CAREER_NEWSPAPER_TITLE } from '@/constants/career';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatNumber } from '@/utils/format';

const YEARS_DECIMALS = 1;

/** Fim da carreira: veredito, pontuação, trajetória e eleições disputadas. */
export const CareerResultScreen = () => {
  const view = useCareerLegacy();
  const { abandonGame, goToCareerSetup } = useGameStore(
    useShallow((state) => ({ abandonGame: state.abandonGame, goToCareerSetup: state.goToCareerSetup })),
  );

  if (!view) return <LoadingScreen />;

  const { legacy, highestOffice, highestAppointment } = view;
  const startNewCareer = (): void => {
    abandonGame();
    goToCareerSetup();
  };

  return (
    <PageContainer width="wide">
      <Masthead title={CAREER_NEWSPAPER_TITLE} dateline={view.profile.dateLabel} edition="Edição histórica" />
      <CareerLegacyHeadline view={view} />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <ScoreTotal total={legacy.score} />
          <Card className="grid gap-4">
            <ElectionStatTile label="Maior cargo eletivo" value={highestOffice?.name ?? '—'} />
            <ElectionStatTile label="Maior cargo de confiança" value={highestAppointment?.name ?? '—'} />
            <ElectionStatTile label="Anos com mandato" value={formatNumber(legacy.yearsInOffice, YEARS_DECIMALS)} />
            <ElectionStatTile label="Eleições" value={`${legacy.electionsWon} vitórias · ${legacy.electionsLost} derrotas`} />
          </Card>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section>
            <SectionHeading kicker="Eleições" title="Nas urnas" size="sm" />
            <CareerElectionHistory elections={view.elections} />
          </section>
          <section>
            <SectionHeading kicker="Biografia" title="A trajetória" size="sm" />
            <CareerTimelineList items={view.timeline} />
          </section>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t-4 border-double border-ink pt-6 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={startNewCareer}>
          Nova carreira
        </Button>
        <Button variant="secondary" size="lg" onClick={abandonGame}>
          Voltar ao menu
        </Button>
      </div>
    </PageContainer>
  );
};
