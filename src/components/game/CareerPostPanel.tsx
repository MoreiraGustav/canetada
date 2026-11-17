import { useCareerPost } from '@/stores/selectors';
import { useCareerStore } from '@/stores/useCareerStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Tone } from '@/types';
import { formatNumber } from '@/utils/format';
import { CareerMissionCard } from './CareerMissionCard';

const TONE_CLASSES: Record<Tone, string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-ink',
};

/** Cargo de confiança ou vice: a confiança do chefe (ou do titular) e a missão do semestre. */
export const CareerPostPanel = () => {
  const view = useCareerPost();
  const setMissionOption = useCareerStore((state) => state.setMissionOption);
  if (!view) return null;
  const { trustTitle } = view.labels;
  return (
    <section aria-label={view.kicker} className="flex flex-col gap-4">
      <div>
        <SectionHeading kicker={`${view.icon} ${view.kicker}`} title={view.title} className="mb-1" />
        <p className="font-sans text-[11px] text-ink-soft">
          {view.bossLabel} · {view.missionsDone} {view.missionsDone === 1 ? 'missão cumprida' : 'missões cumpridas'} na carreira
        </p>
        {view.successionNote && <p className="font-sans text-[11px] text-ink-soft">🔑 {view.successionNote}</p>}
      </div>
      <div className="border border-rule bg-paper-dark p-3">
        <div className="flex items-baseline justify-between font-sans text-xs">
          <span className="font-semibold uppercase tracking-wide text-ink-soft">{trustTitle}</span>
          <span className={`font-display text-lg font-bold tabular-nums ${TONE_CLASSES[view.trustTone]}`}>
            {formatNumber(view.trust, 0)} · {view.trustLabel}
          </span>
        </div>
        <ProgressBar value={view.trust} tone={view.trustTone === 'neutral' ? 'info' : view.trustTone} height="sm" label={trustTitle} className="my-1" />
        <p className="font-sans text-[11px] text-ink-soft">{view.trustNote}</p>
      </div>
      {view.mission ? (
        <CareerMissionCard mission={view.mission} labels={view.labels} onChoose={setMissionOption} />
      ) : (
        <p className="font-serif text-sm italic text-ink-soft">Nenhuma missão nova neste semestre.</p>
      )}
    </section>
  );
};
