import { Slider } from '@/components/ui/Slider';

interface CandidateIdeologySlidersProps {
  economic: number;
  social: number;
  onEconomicChange: (value: number) => void;
  onSocialChange: (value: number) => void;
}

const IDEOLOGY_MIN = -100;
const IDEOLOGY_MAX = 100;
const IDEOLOGY_STEP = 5;
/** Largura de cada faixa do rótulo (5 faixas em 200 pontos). */
const BAND_WIDTH = 50;

const ECONOMIC_BANDS = ['Esquerda', 'Centro-esquerda', 'Centro', 'Centro-direita', 'Direita'] as const;
const SOCIAL_BANDS = ['Progressista', 'Progressista moderado', 'Moderado', 'Conservador moderado', 'Conservador'] as const;

/** Rótulo da faixa ideológica: -100 → primeira faixa, 100 → última. */
const describeBand = (value: number, bands: readonly string[]): string => {
  const index = Math.round((value - IDEOLOGY_MIN) / BAND_WIDTH);
  return bands[Math.min(bands.length - 1, Math.max(0, index))];
};

/** Sliders de posicionamento econômico e de costumes. */
export const CandidateIdeologySliders = ({ economic, social, onEconomicChange, onSocialChange }: CandidateIdeologySlidersProps) => (
  <fieldset className="grid gap-6 sm:grid-cols-2">
    <legend className="sr-only">Posicionamento ideológico</legend>
    <Slider
      id="candidate-economic"
      label={`Economia — ${describeBand(economic, ECONOMIC_BANDS)}`}
      value={economic}
      min={IDEOLOGY_MIN}
      max={IDEOLOGY_MAX}
      step={IDEOLOGY_STEP}
      leftLabel="Esquerda"
      rightLabel="Direita"
      onChange={onEconomicChange}
    />
    <Slider
      id="candidate-social"
      label={`Costumes — ${describeBand(social, SOCIAL_BANDS)}`}
      value={social}
      min={IDEOLOGY_MIN}
      max={IDEOLOGY_MAX}
      step={IDEOLOGY_STEP}
      leftLabel="Progressista"
      rightLabel="Conservador"
      onChange={onSocialChange}
    />
  </fieldset>
);
