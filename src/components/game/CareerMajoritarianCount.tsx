import { PortraitImage } from '@/components/ui/PortraitImage';
import type { CareerElectionResultView, Portrait } from '@/types';
import { formatNumber } from '@/utils/format';

interface CareerMajoritarianCountProps {
  view: CareerElectionResultView;
  /** Fração apurada (0–1). */
  progress: number;
}

const HALF = 50;
const PERCENT = 100;
const NEUTRAL_COLOR = '#7A766C';
const PLAYER_FALLBACK_COLOR = '#1F2937';
/** Oscilação da parcial no começo da apuração (pontos), para dar suspense. */
const WOBBLE_POINTS = 3;
const WOBBLE_FREQUENCY = 11;
const SHARE_DECIMALS = 1;

/** Parcial: parte de 50% e converge ao resultado, oscilando menos à medida que a apuração avança. */
const partialShare = (final: number, progress: number): number =>
  HALF + (final - HALF) * progress + Math.sin(progress * WOBBLE_FREQUENCY) * WOBBLE_POINTS * (1 - progress);

interface SideProps {
  name: string;
  caption: string;
  portrait: Portrait;
  share: number;
  color: string;
  align: 'left' | 'right';
}

const Side = ({ name, caption, portrait, share, color, align }: SideProps) => (
  <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
    <PortraitImage portrait={portrait} name={name} size="md" />
    <div className="min-w-0">
      <p className="truncate font-serif text-sm font-semibold text-ink">{name}</p>
      <p className="truncate font-sans text-[11px] text-ink-muted">{caption}</p>
      <p className="font-display text-3xl font-black tabular-nums" style={{ color }}>
        {formatNumber(share, SHARE_DECIMALS)}%
      </p>
    </div>
  </div>
);

/** Disputa majoritária (prefeito, governador, senador, vice): os dois lados e a barra dividida. */
export const CareerMajoritarianCount = ({ view, progress }: CareerMajoritarianCountProps) => {
  const { record, party, opponentParty } = view;
  const share = Math.min(PERCENT, Math.max(0, partialShare(record.voteShare, progress)));
  const playerColor = party?.color ?? PLAYER_FALLBACK_COLOR;
  const opponentColor = opponentParty?.color ?? NEUTRAL_COLOR;
  const playerCaption = [party?.acronym, record.runningMate ? `Chapa ${record.runningMate.name}` : null].filter(Boolean).join(' · ');
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Side name={view.playerName} caption={playerCaption} portrait={view.playerPortrait} share={share} color={playerColor} align="left" />
        <Side
          name={record.opponent?.name ?? 'Adversário'}
          caption={opponentParty?.acronym ?? ''}
          portrait={{ traits: { sex: record.opponent?.sex ?? 'm' } }}
          share={PERCENT - share}
          color={opponentColor}
          align="right"
        />
      </div>
      <div className="relative mt-3 h-4 overflow-hidden bg-paper-deep" aria-hidden="true">
        <div className="absolute inset-y-0 left-0" style={{ width: `${share}%`, backgroundColor: playerColor }} />
        <div className="absolute inset-y-0 right-0" style={{ width: `${PERCENT - share}%`, backgroundColor: opponentColor }} />
        <div className="absolute inset-y-0 left-1/2 w-px bg-ink" />
      </div>
    </div>
  );
};
