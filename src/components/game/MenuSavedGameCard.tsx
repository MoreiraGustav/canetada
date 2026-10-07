import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { SavedGameSummary } from '@/types';

interface MenuSavedGameCardProps {
  summary: SavedGameSummary;
  onContinue: () => void;
  onDelete: () => void;
}

const SAVED_AT_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

const formatSavedAt = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-BR', SAVED_AT_FORMAT);
};

/** Cartão "Partida em andamento" com ações de continuar e apagar. */
export const MenuSavedGameCard = ({ summary, onContinue, onDelete }: MenuSavedGameCardProps) => (
  <Card emphasis>
    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Partida em andamento</p>
    <h3 className="mt-1 font-display text-2xl font-bold leading-tight">{summary.candidateName}</h3>
    <p className="mt-1 font-serif text-sm text-ink-soft">
      {summary.dateLabel} · {summary.termNumber}º mandato
    </p>
    <div className="mt-3 flex flex-wrap gap-1.5">
      <Badge tone="info">{summary.modeLabel}</Badge>
      <Badge>{summary.difficultyLabel}</Badge>
    </div>
    <p className="mt-3 font-sans text-[11px] text-ink-muted">Salvo em {formatSavedAt(summary.savedAt)}</p>
    <div className="mt-4 flex flex-col gap-2">
      <Button variant="accent" fullWidth onClick={onContinue}>
        Continuar
      </Button>
      <Button variant="ghost" size="sm" fullWidth onClick={onDelete}>
        Apagar partida salva
      </Button>
    </div>
  </Card>
);
