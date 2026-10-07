import type { Bloc, Country } from '@/types';

interface DiplomacyBlocListProps {
  blocs: readonly Bloc[];
  countries: readonly Country[];
}

/** Blocos multilaterais (BRICS, Mercosul) e seus membros com mecânica ativa. */
export const DiplomacyBlocList = ({ blocs, countries }: DiplomacyBlocListProps) => (
  <ul className="space-y-3">
    {blocs.map((bloc) => {
      const members = countries.filter((country) => bloc.members.includes(country.id));
      return (
        <li key={bloc.id} className="border border-rule p-3">
          <p className="font-serif text-sm font-semibold text-ink">
            <span aria-hidden="true" className="mr-1.5">
              {bloc.icon}
            </span>
            {bloc.name}
          </p>
          <p className="mt-1 font-serif text-sm leading-snug text-ink-soft">{bloc.description}</p>
          {members.length > 0 && (
            <p className="mt-1 font-sans text-[11px] text-ink-muted">
              Membros acompanhados: {members.map((country) => `${country.flag} ${country.name}`).join(' · ')}
            </p>
          )}
        </li>
      );
    })}
  </ul>
);
