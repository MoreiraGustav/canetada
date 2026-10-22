import type { ImpeachmentFacts } from '@/types';
import { formatNumber } from '@/utils/format';

interface ImpeachmentReasonsProps {
  facts: ImpeachmentFacts;
  /** O impeachment avançou (abertura autorizada ou afastamento). */
  passed: boolean;
}

interface RowProps {
  label: string;
  value: number;
  limit: number;
}

/** Linha "Aprovação 12% · limite 15%": vermelha quando está abaixo do limite (zona de impeachment). */
const Row = ({ label, value, limit }: RowProps) => (
  <li className="flex justify-between border-b border-rule py-0.5">
    <span>{label}</span>
    <span className={`font-semibold tabular-nums ${value < limit ? 'text-negative' : 'text-positive'}`}>
      {formatNumber(value, 0)}% <span className="font-normal text-ink-muted">· limite {formatNumber(limit, 0)}%</span>
    </span>
  </li>
);

/** Por que o impeachment avançou ou caiu: aprovação e base diante dos limites e o crime de responsabilidade. */
export const ImpeachmentReasons = ({ facts, passed }: ImpeachmentReasonsProps) => (
  <div>
    <h4 className="mb-1 font-sans text-[11px] font-bold uppercase tracking-wider text-ink">Por que {passed ? 'avançou' : 'caiu'}</h4>
    <p className="mb-2 font-serif text-sm text-ink">
      {passed
        ? 'Com aprovação e base abaixo dos limites, o Congresso tem votos para tirar o presidente.'
        : 'O governo recuperou fôlego: os votos não chegaram aos 2/3 exigidos.'}
    </p>
    <ul className="font-sans text-xs text-ink-soft">
      <Row label="Aprovação popular" value={facts.approval} limit={facts.approvalLimit} />
      <Row label="Base aliada" value={facts.support} limit={facts.supportLimit} />
      <li className="flex justify-between py-0.5">
        <span>Crime de responsabilidade</span>
        <span className={`font-semibold ${facts.crime ? 'text-negative' : 'text-positive'}`}>{facts.crime ? 'comprovado (limites mais altos)' : 'não'}</span>
      </li>
    </ul>
    {passed && (
      <p className="mt-2 font-sans text-[11px] text-ink-muted">
        Dica: o gabinete de crise libera a defesa contra o impeachment, e subir a base aliada ou a aprovação arquiva o processo.
      </p>
    )}
  </div>
);
