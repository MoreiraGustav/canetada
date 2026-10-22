import { NEGOTIATION_SUPPORT_BONUS } from '@/constants/balance';
import type { VoteFactorView } from '@/types';
import { formatChance, formatSigned } from '@/utils/format';

interface VoteReasonsProps {
  baseline: number;
  factors: readonly VoteFactorView[];
  chance: number;
  approved: boolean;
  negotiated: boolean;
}

const PERCENT = 100;

/** Conclusão em uma frase: por que a proposta passou ou caiu. */
const verdict = (factors: readonly VoteFactorView[], approved: boolean): string => {
  const strongest = [...factors].sort((a, b) => (approved ? b.delta - a.delta : a.delta - b.delta))[0];
  if (!strongest || (approved ? strongest.delta <= 0 : strongest.delta >= 0)) {
    return approved ? 'Passou na sorte: o plenário estava dividido.' : 'Caiu por pouco: o plenário estava dividido.';
  }
  return approved ? `O que mais ajudou: ${strongest.label.toLowerCase()}.` : `O que mais pesou contra: ${strongest.label.toLowerCase()}.`;
};

/** De onde veio a chance de aprovação: partida de 50% + cada fator, em pontos percentuais. */
export const VoteReasons = ({ baseline, factors, chance, approved, negotiated }: VoteReasonsProps) => (
  <div>
    <h4 className="mb-1 font-sans text-[11px] font-bold uppercase tracking-wider text-ink">Por que {approved ? 'passou' : 'caiu'}</h4>
    <p className="mb-2 font-serif text-sm text-ink">{verdict(factors, approved)}</p>
    <ul className="font-sans text-xs text-ink-soft">
      <li className="flex justify-between border-b border-rule py-0.5">
        <span>Partida (base no mínimo exigido)</span>
        <span className="tabular-nums">{formatChance(baseline)}</span>
      </li>
      {factors.map((factor) => (
        <li key={factor.key} className="flex justify-between border-b border-rule py-0.5">
          <span>{factor.label}</span>
          <span className={`font-semibold tabular-nums ${factor.delta >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatSigned(factor.delta * PERCENT, 0)} p.p.
          </span>
        </li>
      ))}
      <li className="flex justify-between py-0.5 font-semibold text-ink">
        <span>Chance de aprovação</span>
        <span className="tabular-nums">{formatChance(chance)}</span>
      </li>
    </ul>
    {!approved && !negotiated && (
      <p className="mt-2 font-sans text-[11px] text-ink-muted">
        Dica: negociar cargos e emendas soma {NEGOTIATION_SUPPORT_BONUS} pontos de base aliada na votação — com custo nas contas e na imagem.
      </p>
    )}
  </div>
);
