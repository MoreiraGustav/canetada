import { useState } from 'react';
import { useCityVisits, useTravelMap } from '@/stores/selectors';
import { useGameStore } from '@/stores/useGameStore';
import { BrazilMap } from './BrazilMap';
import { ImpactLegend } from './ImpactLegend';
import { StateVisitPanel } from './StateVisitPanel';

const LEGEND_STOPS: ReadonlyArray<{ label: string; className: string }> = [
  { label: 'Rejeição', className: 'bg-negative' },
  { label: 'Dividido', className: 'bg-paper-deep' },
  { label: 'Apoio', className: 'bg-positive' },
];

/** Viagens pelo Brasil: mapa com a popularidade por estado e as agendas no estado escolhido. */
export const TravelPanel = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const map = useTravelMap();
  const cities = useCityVisits(selectedId);
  const visitCity = useGameStore((state) => state.visitCity);
  const selected = map.states.find((view) => view.state.id === selectedId) ?? null;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div>
        <p className="mb-2 font-serif text-sm leading-relaxed text-ink-soft">
          {map.canTravel
            ? 'Escolha um estado no mapa para planejar a viagem do mês. As cores mostram a popularidade estimada do governo em cada um.'
            : 'A viagem deste mês já foi feita. O mapa mostra a popularidade estimada por estado (✈ = visitado há pouco).'}
        </p>
        <BrazilMap viewBox={map.viewBox} states={map.states} selectedId={selectedId} onSelect={setSelectedId} />
        <ul className="mt-2 flex flex-wrap items-center gap-3 font-sans text-[11px] text-ink-soft" aria-label="Legenda do mapa">
          {LEGEND_STOPS.map((stop) => (
            <li key={stop.label} className="flex items-center gap-1">
              <span aria-hidden="true" className={`inline-block h-3 w-5 border border-rule ${stop.className}`} />
              {stop.label}
            </li>
          ))}
          <li>Malha: IBGE</li>
        </ul>
      </div>
      <div>
        {selected ? (
          <>
            <ImpactLegend className="mb-3" />
            <StateVisitPanel view={selected} cities={cities} canTravel={map.canTravel} onVisit={(cityId) => visitCity(selected.state.id, cityId)} />
          </>
        ) : (
          <p className="border border-dashed border-rule p-6 text-center font-serif text-sm text-ink-muted">
            Clique em um estado para ver as cidades, a bancada e o que cada agenda rende.
          </p>
        )}
      </div>
    </div>
  );
};
