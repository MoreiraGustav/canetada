import type { DiplomaticAction } from '@/types';

/** Ações diplomáticas disponíveis uma vez por turno (GDD §4.3). */
export const DIPLOMATIC_ACTIONS: DiplomaticAction[] = [
  {
    id: 'visita-de-estado',
    name: 'Visita de Estado',
    icon: '✈️',
    description: 'Viagem oficial do presidente com agenda de alto nível. Forte impulso na relação, que se dissipa em parte com o tempo.',
    relationDelta: 8,
    impact: { prestige: 1 },
    targetRelationDecay: 5,
    decayDuration: 6,
    headline: 'Presidente faz visita de Estado a {country} e assina memorandos de cooperação',
  },
  {
    id: 'missao-comercial',
    name: 'Missão Comercial',
    icon: '🚢',
    description: 'Comitiva de ministros e empresários em busca de novos mercados. Ganho modesto, porém duradouro, na relação e no comércio.',
    relationDelta: 4,
    impact: { tradeBalance: 1.5, sectors: { business: 1 } },
    targetRelationDecay: 1,
    decayDuration: 4,
    headline: 'Missão comercial a {country} abre mercados para produtos brasileiros',
  },
  {
    id: 'cupula-bilateral',
    name: 'Cúpula Bilateral',
    icon: '🏛️',
    description: 'Encontro de chefes de Estado com declaração conjunta. Eleva o prestígio, mas a agenda externa é criticada internamente.',
    relationDelta: 6,
    impact: { prestige: 2, approval: -0.5 },
    targetRelationDecay: 3,
    decayDuration: 5,
    headline: 'Cúpula com {country} termina com declaração conjunta e agenda de investimentos',
  },
];
