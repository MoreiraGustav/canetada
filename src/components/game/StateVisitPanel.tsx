import type { CityVisitView, TravelStateView } from '@/types';
import { formatNumber } from '@/utils/format';
import { CITY_KIND_LABELS, REGION_LABELS } from '@/utils/labels';
import { PresidentialActionCard } from './PresidentialActionCard';

interface StateVisitPanelProps {
  view: TravelStateView;
  cities: readonly CityVisitView[];
  /** A viagem do mês ainda está livre. */
  canTravel: boolean;
  onVisit: (cityId: string) => void;
}

interface FactProps {
  label: string;
  value: string;
}

const Fact = ({ label, value }: FactProps) => (
  <div>
    <dt className="font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</dt>
    <dd className="font-sans text-sm font-semibold text-ink">{value}</dd>
  </div>
);

/** Ficha do estado escolhido no mapa e as agendas possíveis em três cidades. */
export const StateVisitPanel = ({ view, cities, canTravel, onVisit }: StateVisitPanelProps) => {
  const { state } = view;
  return (
    <div>
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{REGION_LABELS[state.region]}</p>
      <h3 className="font-display text-2xl font-bold leading-tight text-ink">
        {state.name} <span className="text-ink-muted">({state.uf})</span>
      </h3>
      <dl className="my-3 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-rule py-2 sm:grid-cols-4">
        <Fact label="Aprovação estimada" value={`${formatNumber(view.approval, 0)}%`} />
        <Fact label="Bancada federal" value={`${state.seats} deputados`} />
        <Fact label="População" value={`${formatNumber(state.population, 1)} mi`} />
        <Fact label="Capital" value={state.capital} />
      </dl>
      <p className="mb-3 font-serif text-sm leading-snug text-ink-soft">
        {view.cooldownLeft > 0
          ? `Você esteve aqui há pouco: volte em ${view.cooldownLeft} ${view.cooldownLeft === 1 ? 'mês' : 'meses'}.`
          : canTravel
            ? 'Uma viagem por mês. A bancada do estado conta no Congresso, e um eleitorado hostil aumenta o risco de vaias.'
            : 'A viagem deste mês já foi feita. No próximo mês você pode escolher outro destino.'}
      </p>
      <div className="grid gap-2.5 xl:grid-cols-1">
        {cities.map(({ city, view: action }) =>
          action ? (
            <PresidentialActionCard
              key={city.id}
              view={action}
              monthUsed={!canTravel}
              onTake={() => onVisit(city.id)}
              kicker={`${CITY_KIND_LABELS[city.kind]} · ${city.name}`}
              note={city.hook}
              usedLabel="Viagem do mês já feita"
            />
          ) : null,
        )}
      </div>
    </div>
  );
};
