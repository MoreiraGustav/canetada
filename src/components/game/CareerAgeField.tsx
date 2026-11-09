import { Slider } from '@/components/ui/Slider';
import {
  CAREER_MAX_START_AGE,
  CAREER_MIN_START_AGE,
  CAREER_START_YEAR,
  ELECTION_INTERVAL_YEARS,
  MUNICIPAL_ELECTION_REFERENCE_YEAR,
} from '@/constants/career';

interface CareerAgeFieldProps {
  age: number;
  onChange: (age: number) => void;
}

/** Eleições municipais a cada 4 anos (2028, 2032...); gerais dois anos depois (2030, 2034...). */
const CYCLE_YEARS = 2 * ELECTION_INTERVAL_YEARS;
const GENERAL_ELECTION_FIRST_YEAR = MUNICIPAL_ELECTION_REFERENCE_YEAR + ELECTION_INTERVAL_YEARS;
const MUNICIPAL_ELECTION_FIRST_YEAR = MUNICIPAL_ELECTION_REFERENCE_YEAR;

interface Milestone {
  label: string;
  /** Idade mínima (Constituição, art. 14, § 3º, VI). */
  minAge: number;
  firstElection: number;
  /** Vereador: idade conferida no registro; os demais, na posse (ano seguinte à eleição). */
  checkedAtPosse: boolean;
}

const MILESTONES: readonly Milestone[] = [
  { label: 'Vereador(a)', minAge: 18, firstElection: MUNICIPAL_ELECTION_FIRST_YEAR, checkedAtPosse: false },
  { label: 'Prefeito(a)', minAge: 21, firstElection: MUNICIPAL_ELECTION_FIRST_YEAR, checkedAtPosse: true },
  { label: 'Deputado(a)', minAge: 21, firstElection: GENERAL_ELECTION_FIRST_YEAR, checkedAtPosse: true },
  { label: 'Governador(a)', minAge: 30, firstElection: GENERAL_ELECTION_FIRST_YEAR, checkedAtPosse: true },
  { label: 'Senador(a) e Presidente', minAge: 35, firstElection: GENERAL_ELECTION_FIRST_YEAR, checkedAtPosse: true },
];

/** Primeiro ano de eleição em que a idade permite disputar o cargo. */
const firstEligibleYear = (age: number, milestone: Milestone): number => {
  let year = milestone.firstElection;
  const ageAt = (electionYear: number): number => age + (electionYear - CAREER_START_YEAR) + (milestone.checkedAtPosse ? 1 : 0);
  while (ageAt(year) < milestone.minAge) year += CYCLE_YEARS;
  return year;
};

/** Idade no início da carreira e quando cada cargo fica ao alcance. */
export const CareerAgeField = ({ age, onChange }: CareerAgeFieldProps) => (
  <div>
    <Slider
      id="career-age"
      label={`Idade em ${CAREER_START_YEAR}: ${age} anos`}
      value={age}
      min={CAREER_MIN_START_AGE}
      max={CAREER_MAX_START_AGE}
      leftLabel={`${CAREER_MIN_START_AGE} anos`}
      rightLabel={`${CAREER_MAX_START_AGE} anos`}
      onChange={onChange}
    />
    <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-wider text-ink-soft">Primeira eleição possível pela idade</p>
    <ul className="mt-2 grid gap-1 sm:grid-cols-2">
      {MILESTONES.map((milestone) => (
        <li key={milestone.label} className="flex justify-between gap-2 border-b border-rule py-1 font-serif text-sm text-ink-soft">
          <span>{milestone.label}</span>
          <span className="font-sans font-semibold tabular-nums text-ink">{firstEligibleYear(age, milestone)}</span>
        </li>
      ))}
    </ul>
    <p className="mt-2 font-sans text-[11px] text-ink-muted">
      Idade é só o mínimo: para ganhar, você ainda precisa de votos, partido e reputação.
    </p>
  </div>
);
