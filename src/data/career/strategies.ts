import type { CampaignStrategy } from '@/types';

/**
 * Estratégias de campanha do modo carreira: cada uma soma força eleitoral de um
 * jeito (fixa ou proporcional a um indicador) e deixa uma marca, ganhe ou perca.
 */
export const CAMPAIGN_STRATEGIES: CampaignStrategy[] = [
  {
    id: 'corpo-a-corpo',
    name: 'Corpo a corpo nas ruas',
    icon: '👟',
    description: 'Caminhadas e comícios de bairro: rende onde há base organizada.',
    strength: 2,
    bonusWeights: { electoralBase: 0.06 },
    impact: { electoralBase: 2, localPopularity: 1 },
  },
  {
    id: 'tv-e-redes',
    name: 'TV, rádio e redes sociais',
    icon: '📺',
    description: 'Alcança quem você nunca encontrou, mas boatos rondam.',
    strength: 1,
    bonusWeights: { localPopularity: 0.04, nationalRecognition: 0.05 },
    impact: { nationalRecognition: 2 },
    risk: {
      chance: 0.2,
      impact: { reputation: -4 },
      headline: 'Notícia falsa contra {nome} se espalha nos grupos de mensagem',
    },
  },
  {
    id: 'aliancas-caciques',
    name: 'Alianças com os caciques',
    icon: '🎩',
    description: 'Chefes políticos trazem votos prontos, mas cobram a conta.',
    strength: 4,
    impact: { partyInfluence: 3, reputation: -3 },
  },
  {
    id: 'campanha-propositiva',
    name: 'Campanha propositiva',
    icon: '💡',
    description: 'Propostas e debates firmam a imagem; rende mais a quem é respeitado.',
    strength: 1,
    bonusWeights: { reputation: 0.05 },
    impact: { reputation: 2 },
  },
  {
    id: 'ataque-ao-adversario',
    name: 'Ataque ao adversário',
    icon: '🥊',
    description: 'Desconstruir o rival rende votos, mas o tiro pode sair pela culatra.',
    strength: 5,
    impact: { reputation: -1 },
    risk: {
      chance: 0.3,
      impact: { reputation: -6 },
      headline: 'Ataque de {nome} ao rival é desmentido e vira munição contra a campanha',
    },
  },
];
