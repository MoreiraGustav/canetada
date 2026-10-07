import type { BackgroundDefinition } from '@/types';

/**
 * Trajetórias de candidatos (GDD §2.4, Opção B).
 * `sectorAffinity` e `startingImpact` valem apenas para candidatos customizados;
 * `modifiers` valem para todos.
 */
export const BACKGROUNDS: BackgroundDefinition[] = [
  {
    id: 'politico-veterano',
    name: 'Político Veterano',
    icon: '🏛️',
    description:
      'Décadas de mandatos e trânsito livre no Congresso. Sabe montar maiorias, mas carrega o desgaste da velha política.',
    sectorAffinity: { middleClass: -3 },
    startingImpact: { congressSupport: 6 },
    modifiers: { voteChanceBonus: 0.04 },
  },
  {
    id: 'empresario',
    name: 'Empresário',
    icon: '💼',
    description:
      'Construiu uma grande empresa e promete gerir o país com eficiência privada. Agrada ao mercado, desperta desconfiança entre os mais pobres.',
    sectorAffinity: { business: 8, market: 5, lowerClass: -3 },
    startingImpact: { congressSupport: -3 },
    modifiers: { economicConfidenceBonus: 3 },
  },
  {
    id: 'militar',
    name: 'Militar',
    icon: '🎖️',
    description:
      'Oficial da reserva com carreira nas Forças Armadas. Transmite disciplina e ordem, mas enfrenta resistência de ambientalistas e da comunidade internacional.',
    sectorAffinity: { military: 10, environmentalists: -5 },
    startingImpact: { securityTrust: 4, prestige: -2 },
    modifiers: { crisisImpactMultiplier: 0.9 },
  },
  {
    id: 'academico',
    name: 'Acadêmico',
    icon: '🎓',
    description:
      'Professor e pesquisador respeitado, com passagem por organismos internacionais. Tem credibilidade técnica, mas pouca experiência de articulação.',
    sectorAffinity: { environmentalists: 8, middleClass: 3 },
    startingImpact: { congressSupport: -5 },
    modifiers: { diplomacyMultiplier: 1.15 },
  },
  {
    id: 'ativista',
    name: 'Ativista',
    icon: '✊',
    description:
      'Liderança de movimentos sociais com forte vínculo com as bases. Mobiliza as ruas, mas assusta o mercado e o empresariado.',
    sectorAffinity: { lowerClass: 6, environmentalists: 6, market: -6, business: -4 },
    startingImpact: { approval: 2, congressSupport: -4 },
    modifiers: { approvalDecayMultiplier: 0.85 },
  },
];
