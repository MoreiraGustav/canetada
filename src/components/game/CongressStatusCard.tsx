import { Badge } from '@/components/ui/Badge';
import type { CongressView, PoliticalStatus } from '@/types';
import { formatTurnShort } from '@/utils/calendar';

interface CongressStatusCardProps {
  congress: CongressView;
}

const STATUS_TONES: Record<PoliticalStatus, 'positive' | 'warning' | 'negative'> = {
  stable: 'positive',
  crisis: 'warning',
  cpi: 'negative',
  impeachment: 'negative',
};

const months = (count: number): string => `${count} ${count === 1 ? 'mês' : 'meses'}`;

/** Estado político atual, CPI/impeachment em curso e crises superadas. */
export const CongressStatusCard = ({ congress }: CongressStatusCardProps) => (
  <div className="space-y-3">
    <div>
      <Badge tone={STATUS_TONES[congress.status]}>{congress.statusLabel}</Badge>
      <p className="mt-1 font-serif text-sm text-ink-soft">{congress.statusDescription}</p>
    </div>
    {congress.cpi && (
      <div className="border-l-4 border-negative bg-negative-light/40 px-3 py-2">
        <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-negative">🔎 CPI em andamento</p>
        <p className="font-serif text-sm font-semibold text-ink">{congress.cpi.name}</p>
        <p className="font-sans text-[11px] text-ink-soft">Prevista até {formatTurnShort(congress.cpi.endTurn)}</p>
      </div>
    )}
    {congress.impeachment && congress.impeachmentTurnsLeft !== null && (
      <div className="border-l-4 border-accent-dark bg-accent-light/50 px-3 py-2">
        <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-accent-dark">⚠️ Processo de impeachment</p>
        <p className="font-serif text-sm text-ink">
          {congress.impeachmentTurnsLeft > 0
            ? `Votação final em ${months(congress.impeachmentTurnsLeft)} (${formatTurnShort(congress.impeachment.deadlineTurn)}).`
            : 'A votação final acontece neste mês.'}
        </p>
      </div>
    )}
    <dl className="flex gap-6 font-sans text-[11px] uppercase tracking-wider text-ink-muted">
      <div>
        <dt>CPIs superadas</dt>
        <dd className="font-display text-lg font-bold normal-case tabular-nums text-ink">{congress.cpisSurvived}</dd>
      </div>
      <div>
        <dt>Impeachments barrados</dt>
        <dd className="font-display text-lg font-bold normal-case tabular-nums text-ink">{congress.impeachmentsSurvived}</dd>
      </div>
    </dl>
  </div>
);
