import type { CareerReportView, Tone } from '@/types';

interface CareerSemesterHighlightsProps {
  report: CareerReportView;
}

const TONE_CLASSES: Record<Tone, string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-ink',
};

/** Destaques do semestre no balanço: o placar do plenário, leis e obras que fecharam e as conquistas. */
export const CareerSemesterHighlights = ({ report }: CareerSemesterHighlightsProps) => {
  const { vote, outcomes, achievements } = report;
  if (!vote && outcomes.length === 0 && achievements.length === 0) return null;
  return (
    <section aria-label="Destaques do semestre" className="flex flex-col gap-3 border-t border-rule pt-4">
      {vote && (
        <div className="border border-rule bg-paper-dark p-3">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">🗳️ {vote.house}</p>
          <p className="font-serif text-base font-semibold text-ink">
            <span aria-hidden="true">{vote.icon}</span> {vote.title}: {vote.passed ? 'aprovada' : 'rejeitada'}
          </p>
          <p className="font-display text-2xl font-black tabular-nums text-ink">
            {vote.yes} <span className="text-base font-semibold text-ink-soft">sim</span> × {vote.no} <span className="text-base font-semibold text-ink-soft">não</span>
          </p>
          <p className={`font-sans text-xs ${vote.followedParty ? 'text-ink-soft' : 'font-semibold text-negative'}`}>{vote.choiceLabel}</p>
        </div>
      )}
      {outcomes.length > 0 && (
        <ul className="flex flex-col gap-1">
          {outcomes.map((outcome) => (
            <li key={outcome.key} className={`font-sans text-sm ${TONE_CLASSES[outcome.tone]}`}>
              <span aria-hidden="true">{outcome.icon}</span> {outcome.text}
            </li>
          ))}
        </ul>
      )}
      {achievements.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {achievements.map((achievement) => (
            <li key={achievement.id} className="border border-ochre bg-ochre-light px-2 py-1 font-sans text-xs font-semibold text-ink">
              🏆 <span aria-hidden="true">{achievement.icon}</span> {achievement.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
