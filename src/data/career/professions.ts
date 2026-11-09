import type { CareerProfession } from '@/types';

/**
 * Origens profissionais do personagem. Os pontos somam-se ao ponto de partida
 * (`CAREER_BASE_METRICS`) e cada profissão destrava uma ação própria na agenda.
 * `background` é a trajetória equivalente quando o personagem chega ao Planalto.
 */
export const CAREER_PROFESSIONS: CareerProfession[] = [
  {
    id: 'advogado',
    name: 'Advogado(a)',
    icon: '⚖️',
    description: 'Conhece as leis e circula entre dirigentes. Começa com influência e boa reputação, mas pouca base.',
    startingMetrics: { partyInfluence: 5, reputation: 5, localPopularity: 3 },
    background: 'politico-veterano',
  },
  {
    id: 'professor',
    name: 'Professor(a)',
    icon: '📚',
    description: 'Respeitado(a) por alunos e famílias do bairro. Reputação alta e base fiel, mas pouco trânsito no partido.',
    startingMetrics: { reputation: 8, electoralBase: 6, localPopularity: 4 },
    background: 'academico',
  },
  {
    id: 'medico',
    name: 'Médico(a)',
    icon: '🩺',
    description: 'O doutor(a) que todo mundo conhece na cidade. Popular e confiável, mas novato(a) na política.',
    startingMetrics: { localPopularity: 8, reputation: 6, electoralBase: 3 },
    background: 'academico',
  },
  {
    id: 'empresario',
    name: 'Empresário(a)',
    icon: '💼',
    description: 'Tem contatos e ajuda a financiar o partido. Influência rápida, mas o eleitor desconfia.',
    startingMetrics: { partyInfluence: 8, localPopularity: 4, nationalRecognition: 2, reputation: -5 },
    background: 'empresario',
  },
  {
    id: 'policial',
    name: 'Policial',
    icon: '🚓',
    description: 'Discurso de ordem e segurança com apelo popular. Boa base, mas pouca habilidade de articulação.',
    startingMetrics: { localPopularity: 7, electoralBase: 5, reputation: 2 },
    background: 'militar',
  },
  {
    id: 'sindicalista',
    name: 'Sindicalista',
    icon: '✊',
    description: 'Vem das greves e assembleias: base organizada e trânsito no partido, mas assusta o empresariado.',
    startingMetrics: { electoralBase: 10, partyInfluence: 5, reputation: -2 },
    background: 'ativista',
  },
  {
    id: 'comunicador',
    name: 'Comunicador(a)',
    icon: '🎙️',
    description: 'Radialista, apresentador(a) ou influenciador(a): todo mundo conhece, mas a fama é volátil.',
    startingMetrics: { localPopularity: 12, nationalRecognition: 5, reputation: -4 },
    background: 'politico-veterano',
  },
  {
    id: 'lider-religioso',
    name: 'Líder religioso(a)',
    icon: '⛪',
    description: 'Fala toda semana para uma comunidade fiel. Base enorme, mas fora dela o eleitor estranha.',
    startingMetrics: { electoralBase: 12, localPopularity: 5, nationalRecognition: -1 },
    background: 'ativista',
  },
  {
    id: 'produtor-rural',
    name: 'Produtor(a) rural',
    icon: '🌾',
    description: 'Liderança do agro e das cooperativas. Influência e base no interior, pouca presença na capital.',
    startingMetrics: { partyInfluence: 6, electoralBase: 6, localPopularity: 2 },
    background: 'empresario',
  },
  {
    id: 'servidor-publico',
    name: 'Servidor(a) público(a)',
    icon: '🗂️',
    description: 'Conhece a máquina por dentro: chega mais fácil aos cargos de confiança, mas pouca gente sabe quem é.',
    startingMetrics: { partyInfluence: 6, reputation: 5, electoralBase: 2 },
    background: 'academico',
  },
  {
    id: 'estudante',
    name: 'Liderança estudantil',
    icon: '🎓',
    description: 'Vem do grêmio e do movimento estudantil: energia, militância e redes, mas pouca experiência.',
    startingMetrics: { partyInfluence: 6, electoralBase: 4, localPopularity: 2, nationalRecognition: 1 },
    background: 'ativista',
  },
];
