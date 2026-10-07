import { Tooltip } from '@/components/ui/Tooltip';
import { getEconomicIdeologyLabel, getSocialIdeologyLabel } from '@/utils/labels';

interface PoliticalSpectrumCardProps {
  /** -100 (esquerda) … 100 (direita). */
  economic: number;
  /** -100 (progressista) … 100 (conservador). */
  social: number;
}

interface AxisProps {
  label: string;
  value: number;
  left: string;
  right: string;
  current: string;
}

const SCALE = 200;
const OFFSET = 100;

const toPercent = (value: number): number => ((value + OFFSET) / SCALE) * 100;

const SpectrumAxis = ({ label, value, left, right, current }: AxisProps) => (
  <div>
    <div className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-wide">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold text-ink">{current}</span>
    </div>
    <div className="relative mt-1 h-2 bg-gradient-to-r from-accent/70 via-paper-deep to-navy/70" aria-hidden="true">
      <span className="absolute -top-1 h-4 w-1.5 -translate-x-1/2 bg-ink transition-[left] duration-700" style={{ left: `${toPercent(value)}%` }} />
    </div>
    <div className="mt-0.5 flex justify-between font-sans text-[10px] text-ink-muted">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  </div>
);

/** Onde o governo está no espectro político (muda com as escolhas do jogador). */
export const PoliticalSpectrumCard = ({ economic, social }: PoliticalSpectrumCardProps) => (
  <section aria-label="Espectro político do governo" className="border-t border-rule pt-3">
    <Tooltip content="Suas escolhas movem o governo no espectro. Governos mais radicais ganham uma militância fiel nos setores alinhados — e destravam pautas mais radicais.">
      <h3 className="cursor-help font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Espectro político Ⓘ</h3>
    </Tooltip>
    <div className="mt-2 flex flex-col gap-3">
      <SpectrumAxis label="Economia" value={economic} left="Esquerda" right="Direita" current={getEconomicIdeologyLabel(economic)} />
      <SpectrumAxis label="Costumes" value={social} left="Progressista" right="Conservador" current={getSocialIdeologyLabel(social)} />
    </div>
  </section>
);
