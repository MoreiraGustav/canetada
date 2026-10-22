import { useState } from 'react';
import { getCountries } from '@/stores/content';
import { useCopomDecision, useIndicatorViews, useLastReport, useTurnInfo, useVoteSession } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CopomCard } from '@/components/game/CopomCard';
import { SummaryHeadlines } from '@/components/game/SummaryHeadlines';
import { SummaryMonthPanel } from '@/components/game/SummaryMonthPanel';
import { SummaryOutcomeBanner } from '@/components/game/SummaryOutcomeBanner';
import { SummaryVotes } from '@/components/game/SummaryVotes';
import { VoteSessionOverlay } from '@/components/game/VoteSessionOverlay';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { PRIMARY_INDICATORS } from '@/constants/metrics';
import type { TurnOutcome, VoteRecord } from '@/types';
import { formatTurnLong } from '@/utils/calendar';

const NO_VOTES: readonly VoteRecord[] = [];

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
  const session = useVoteSession(report?.votes ?? NO_VOTES);
  const copom = useCopomDecision();
  // A sessão no plenário abre sozinha quando houve votação no mês.
  const [sessionOpen, setSessionOpen] = useState(true);

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
          <SummaryVotes votes={report.votes} onReplay={() => setSessionOpen(true)} />
          <CopomCard decision={copom} />
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
      {sessionOpen && session.length > 0 && <VoteSessionOverlay items={session} onClose={() => setSessionOpen(false)} />}
    </PageContainer>
  );
};
