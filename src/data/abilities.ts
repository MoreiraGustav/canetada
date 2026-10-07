import type { Ability } from '@/types';

/** Habilidades especiais: um bônus passivo por candidato (GDD §2.4). */
export const ABILITIES: Ability[] = [
  {
    id: 'articulador-nato',
    name: 'Articulador Nato',
    icon: '🤝',
    description: '+10% de chance de aprovar leis e PECs no Congresso.',
    modifiers: { voteChanceBonus: 0.1 },
  },
  {
    id: 'negociador-habil',
    name: 'Negociador Hábil',
    icon: '📜',
    description: 'Negociações com o Congresso custam 40% menos em emendas e desgaste político.',
    modifiers: { negotiationCostMultiplier: 0.6 },
  },
  {
    id: 'carisma-popular',
    name: 'Carisma Popular',
    icon: '🎙️',
    description: 'O desgaste natural da aprovação ao longo do mandato cai pela metade.',
    modifiers: { approvalDecayMultiplier: 0.5 },
  },
  {
    id: 'ficha-limpa',
    name: 'Ficha Limpa',
    icon: '🧼',
    description: 'Trajetória sem investigações: escândalos políticos ocorrem com metade da frequência.',
    modifiers: { scandalWeightMultiplier: 0.5 },
  },
  {
    id: 'diplomata',
    name: 'Diplomata',
    icon: '🌐',
    description: 'Ganhos de relação com outros países são 50% maiores.',
    modifiers: { diplomacyMultiplier: 1.5 },
  },
  {
    id: 'gestor-de-crises',
    name: 'Gestor de Crises',
    icon: '🧯',
    description: 'Impactos negativos de crises, desastres e escândalos são 25% menores.',
    modifiers: { crisisImpactMultiplier: 0.75 },
  },
  {
    id: 'credibilidade-economica',
    name: 'Credibilidade Econômica',
    icon: '📊',
    description: 'Mercado financeiro e empresários confiam mais no governo (+8 pontos de equilíbrio).',
    modifiers: { economicConfidenceBonus: 8 },
  },
];
