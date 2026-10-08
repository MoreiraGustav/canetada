interface ImpactLegendProps {
  className?: string;
}

/** Legenda das dicas de impacto: o símbolo diz se é bom ou ruim; a seta, se sobe ou cai. */
export const ImpactLegend = ({ className = '' }: ImpactLegendProps) => (
  <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[11px] text-ink-muted ${className}`}>
    <span>
      <strong className="text-positive">✓ verde</strong> = ganho
    </span>
    <span>
      <strong className="text-negative">✗ vermelho</strong> = custo
    </span>
    <span>
      <strong className="text-ink-soft">▲ ▼</strong> = o indicador sobe ou cai
    </span>
    <span>
      <strong className="text-ink-soft">🎯</strong> = mexe numa meta sua
    </span>
  </p>
);
