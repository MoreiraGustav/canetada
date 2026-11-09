import { useCareerMetrics, useCareerProfile, useCareerReport } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { CareerMetricsPanel } from '@/components/game/CareerMetricsPanel';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Masthead } from '@/components/ui/Masthead';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CAREER_NEWSPAPER_TITLE } from '@/constants/career';
import type { NewsTone } from '@/types';
import { formatSigned } from '@/utils/format';

const TONE_MARKERS: Record<NewsTone, string> = {
  positive: 'bg-positive',
  negative: 'bg-negative',
  neutral: 'bg-ink-muted',
};

/** Balanço do semestre: as manchetes e o quanto cada indicador mudou. */
export const CareerSummaryScreen = () => {
  const report = useCareerReport();
  const profile = useCareerProfile();
  const metrics = useCareerMetrics();
  const advanceCareer = useGameStore((state) => state.advanceCareer);

  if (!report || !profile) return <LoadingScreen />;

  const [lead, ...rest] = report.news;

  return (
    <PageContainer width="wide">
      <Masthead title={CAREER_NEWSPAPER_TITLE} dateline={`${profile.city?.name ?? ''} · ${report.dateLabel}`} edition="Balanço do semestre" />
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="flex flex-col gap-4 lg:col-span-2" aria-label="Manchetes do semestre">
          {lead ? (
            <h2 className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl">{lead.headline}</h2>
          ) : (
            <h2 className="font-display text-3xl font-black leading-tight text-ink">Um semestre discreto</h2>
          )}
          <ul className="flex flex-col gap-2">
            {rest.map((item) => (
              <li key={item.id} className="flex items-start gap-2 border-b border-rule pb-2 last:border-b-0">
                <span className={`mt-1.5 h-2 w-2 shrink-0 ${TONE_MARKERS[item.tone]}`} aria-hidden="true" />
                <p className="font-serif text-base leading-snug text-ink">{item.headline}</p>
              </li>
            ))}
          </ul>
        </section>
        <Card>
          <SectionHeading kicker="Saldo do semestre" title={profile.positionTitle} size="sm" />
          {report.deltas.length === 0 ? (
            <p className="font-serif text-sm italic text-ink-soft">Nada mudou de forma relevante.</p>
          ) : (
            <ul className="mb-2 flex flex-col gap-1">
              {report.deltas.map((delta) => (
                <li key={delta.key} className="flex justify-between font-sans text-sm">
                  <span className="text-ink-soft">
                    <span aria-hidden="true">{delta.icon}</span> {delta.label}
                  </span>
                  <span className={`font-semibold tabular-nums ${delta.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>{formatSigned(delta.delta, 1)}</span>
                </li>
              ))}
            </ul>
          )}
          <CareerMetricsPanel metrics={metrics} />
        </Card>
      </div>
      <div className="mt-8 flex justify-center border-t-4 border-double border-ink pt-6 sm:justify-end">
        <Button size="lg" onClick={advanceCareer} className="w-full sm:w-auto">
          Próximo semestre
        </Button>
      </div>
    </PageContainer>
  );
};
