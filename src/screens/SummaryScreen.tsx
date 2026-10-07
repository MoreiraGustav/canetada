import { getCountries } from '@/stores/content';
import { useIndicatorViews, useLastReport, useTurnInfo } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { SummaryHeadlines } from '@/components/game/SummaryHeadlines';
import { SummaryMonthPanel } from '@/components/game/SummaryMonthPanel';
import { SummaryOutcomeBanner } from '@/components/game/SummaryOutcomeBanner';
import { SummaryVotes } from '@/components/game/SummaryVotes';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { PRIMARY_INDICATORS } from '@/constants/metrics';
import type { TurnOutcome } from '@/types';
import { formatTurnLong } from '@/utils/calendar';

const ADVANCE_LABELS: Record<TurnOutcome, string> = {
  continue: 'Próximo mês',
  'term-ended': 'Fim do mandato — apurar resultado',
  impeached: 'Ver desfecho',
};

/** Fase "resumo": a primeira página do jornal com o balanço do mês. */
export const SummaryScreen = () => {
  const report = useLastReport();
  const turnInfo = useTurnInfo();
  const indicatorViews = useIndicatorViews(PRIMARY_INDICATORS);
  const advance = useGameStore((state) => state.advance);

  if (!report) return <LoadingScreen />;

  const isImpeached = report.outcome === 'impeached';
  const termMonth = report.turn - (turnInfo.turn - turnInfo.termMonth);

  return (
    <PageContainer width="wide">
      <Masthead dateline={formatTurnLong(report.turn)} edition={`Mês ${termMonth}/${turnInfo.termLength}`} />
      <SummaryOutcomeBanner outcome={report.outcome} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <SummaryHeadlines news={report.news} />
          <SummaryVotes votes={report.votes} />
        </div>
        <SummaryMonthPanel
          indicatorViews={indicatorViews}
          deltas={report.deltas}
          sectorDeltas={report.sectorDeltas}
          relationDeltas={report.relationDeltas}
          countries={getCountries()}
        />
      </div>

      <div className="mt-8 flex justify-center border-t-4 border-double border-ink pt-6 sm:justify-end">
        <Button variant={isImpeached ? 'accent' : 'primary'} size="lg" onClick={advance} className="w-full sm:w-auto">
          {ADVANCE_LABELS[report.outcome]}
        </Button>
      </div>
    </PageContainer>
  );
};
