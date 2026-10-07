import { SummaryDeltaRow } from '@/components/game/SummaryDeltaRow';
import { SECTOR_INFO, SECTOR_KEYS } from '@/constants/sectors';
import type { SectorKey, Tone } from '@/types';
import { formatSigned } from '@/utils/format';

interface SummarySectorDeltasProps {
  sectorDeltas: Partial<Record<SectorKey, number>>;
}

const SECTOR_DELTA_DECIMALS = 1;
/** Variação mínima (p.p.) para o setor aparecer no resumo. */
const MIN_VISIBLE_DELTA = 1;

const toneForSign = (delta: number): Tone => {
  if (delta > 0) return 'positive';
  if (delta < 0) return 'negative';
  return 'neutral';
};

/** Setores cuja aprovação mudou de forma perceptível no mês. */
export const SummarySectorDeltas = ({ sectorDeltas }: SummarySectorDeltasProps) => {
  const changed = SECTOR_KEYS.filter((key) => Math.abs(sectorDeltas[key] ?? 0) >= MIN_VISIBLE_DELTA);
  if (changed.length === 0) return null;
  return (
    <div>
      <h3 className="mb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink">Aprovação por setor</h3>
      <ul>
        {changed.map((key) => {
          const delta = sectorDeltas[key] ?? 0;
          return (
            <SummaryDeltaRow
              key={key}
              label={SECTOR_INFO[key].label}
              icon={SECTOR_INFO[key].icon}
              delta={delta}
              formattedDelta={`${formatSigned(delta, SECTOR_DELTA_DECIMALS)} p.p.`}
              tone={toneForSign(delta)}
            />
          );
        })}
      </ul>
    </div>
  );
};
