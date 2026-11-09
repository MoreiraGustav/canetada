import { Button } from '@/components/ui/Button';
import { PortraitImage } from '@/components/ui/PortraitImage';
import type { FaceSex } from '@/types';
import { CAREER_NAME_MAX_LENGTH, CAREER_POLITICAL_NAME_MAX_LENGTH } from '@/constants/career';

interface CareerIdentityFieldsProps {
  name: string;
  politicalName: string;
  sex: FaceSex;
  portraitSeed: number;
  onNameChange: (value: string) => void;
  onPoliticalNameChange: (value: string) => void;
  onSexChange: (value: FaceSex) => void;
  onRerollFace: () => void;
}

const SEX_OPTIONS: ReadonlyArray<{ id: FaceSex; label: string }> = [
  { id: 'f', label: 'Feminino' },
  { id: 'm', label: 'Masculino' },
];

const FALLBACK_NAME = 'Candidato(a)';
const LABEL_CLASS = 'mb-2 block font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft';
const INPUT_CLASS =
  'w-full border border-ink bg-paper px-3 py-2.5 font-display text-xl placeholder:font-serif placeholder:text-base placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-navy';

/** Nome civil, nome de urna, sexo e rosto do personagem. */
export const CareerIdentityFields = ({
  name,
  politicalName,
  sex,
  portraitSeed,
  onNameChange,
  onPoliticalNameChange,
  onSexChange,
  onRerollFace,
}: CareerIdentityFieldsProps) => (
  <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_9rem]">
    <div className="space-y-5">
      <div>
        <label htmlFor="career-name" className={LABEL_CLASS}>
          Nome civil
        </label>
        <input
          id="career-name"
          type="text"
          value={name}
          maxLength={CAREER_NAME_MAX_LENGTH}
          autoComplete="off"
          placeholder="Ex.: Ana Beatriz Coutinho"
          onChange={(event) => onNameChange(event.target.value)}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor="career-political-name" className={LABEL_CLASS}>
          Nome de urna
        </label>
        <input
          id="career-political-name"
          type="text"
          value={politicalName}
          maxLength={CAREER_POLITICAL_NAME_MAX_LENGTH}
          autoComplete="off"
          placeholder="Ex.: Ana do Bairro"
          onChange={(event) => onPoliticalNameChange(event.target.value)}
          className={INPUT_CLASS}
        />
        <p className="mt-1 font-sans text-[11px] text-ink-muted">É como as manchetes e a urna vão chamar você. Em branco, vale o nome civil.</p>
      </div>
      <fieldset>
        <legend className={LABEL_CLASS}>Sexo</legend>
        <div role="radiogroup" aria-label="Sexo" className="flex gap-2">
          {SEX_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={sex === option.id}
              onClick={() => onSexChange(option.id)}
              className={`border px-4 py-2 font-sans text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
                sex === option.id ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
    <div className="flex flex-col items-center gap-2">
      <PortraitImage portrait={{ seed: portraitSeed, traits: { sex } }} name={politicalName.trim() || name.trim() || FALLBACK_NAME} size="lg" />
      <Button variant="ghost" size="sm" onClick={onRerollFace}>
        Sortear outro rosto
      </Button>
    </div>
  </div>
);
