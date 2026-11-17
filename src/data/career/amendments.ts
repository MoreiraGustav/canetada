import type { AmendmentTarget } from '@/types';

/**
 * Destinos das emendas do semestre. O valor (`{valor}`) vem do cargo: emendas
 * individuais da LOA no Congresso; nas Assembleias e Câmaras Municipais, uma fração
 * da receita do estado ou do município dividida entre as cadeiras.
 */
export const CAREER_AMENDMENT_TARGETS: AmendmentTarget[] = [
  {
    id: 'saude-nos-redutos',
    name: 'Saúde nos seus redutos',
    icon: '🏥',
    description: 'Equipamentos e reformas de postos onde você tem votos.',
    impact: { electoralBase: 2, reputation: 0.5 },
    headline: 'Emenda de {nome} leva {valor} para a saúde nos redutos',
  },
  {
    id: 'obras-nos-bairros',
    name: 'Asfalto e praças nos bairros',
    icon: '🚧',
    description: 'O eleitor vê a obra na porta de casa, mas esquece rápido.',
    impact: { localPopularity: 2, electoralBase: 1 },
    headline: 'Emendas de {nome} somam {valor} em asfalto e praças',
  },
  {
    id: 'escolas-e-creches',
    name: 'Escolas e creches',
    icon: '📚',
    description: 'Constrói reputação de gente séria, mas rende poucos votos.',
    impact: { reputation: 1.5, localPopularity: 0.5 },
    headline: 'Emenda de {nome} destina {valor} a escolas e creches',
  },
  {
    id: 'prefeituras-aliadas',
    name: 'Prefeituras aliadas',
    icon: '🤝',
    description: 'Prefeitos aliados viram cabos eleitorais, e o partido nota.',
    levels: ['estadual', 'federal'],
    impact: { electoralBase: 1.5, partyInfluence: 1.5, relations: { padrinho: 2 } },
    headline: 'Prefeitos aliados recebem {valor} em emendas de {nome}',
  },
  {
    id: 'entidades-sociais',
    name: 'Entidades e ONGs de aliados',
    icon: '🤲',
    description: 'Amplia a rede de apoio, mas ONG mal fiscalizada vira caso.',
    impact: { electoralBase: 3 },
    risk: {
      chance: 0.2,
      impact: { reputation: -6 },
      headline: 'Entidade que recebeu emenda de {nome} não presta contas',
      flags: ['emendas-suspeitas'],
    },
    headline: 'Emenda de {nome} repassa {valor} a entidades sociais',
  },
  {
    id: 'emenda-pix',
    name: 'Transferência especial (emenda Pix)',
    icon: '⚡',
    description: 'Cai direto no caixa do prefeito, sem projeto. Rápido e opaco.',
    levels: ['estadual', 'federal'],
    impact: { electoralBase: 3.5, partyInfluence: 1 },
    risk: {
      chance: 0.25,
      impact: { reputation: -7 },
      headline: 'Emenda Pix de {nome} some sem rastro e vira alvo de investigação',
      flags: ['emendas-suspeitas'],
    },
    headline: '{nome} envia {valor} em emenda Pix a prefeituras aliadas',
  },
];
