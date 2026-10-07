import type { CpiTopic } from '@/types';

/** Temas de CPI abertos quando a base aliada enfraquece (GDD §4.2). */
export const CPI_TOPICS: CpiTopic[] = [
  {
    id: 'cpi-emendas',
    name: 'CPI das Emendas Parlamentares',
    description: 'Investiga a distribuição de emendas e suspeitas de desvio em convênios com prefeituras.',
  },
  {
    id: 'cpi-combustiveis',
    name: 'CPI dos Combustíveis',
    description: 'Apura a política de preços da estatal de petróleo e a atuação de distribuidoras.',
  },
  {
    id: 'cpi-obras-publicas',
    name: 'CPI das Obras Públicas',
    description: 'Examina contratos superfaturados e aditivos em grandes obras federais.',
  },
  {
    id: 'cpi-fundos-de-pensao',
    name: 'CPI dos Fundos de Pensão',
    description: 'Investiga investimentos temerários de fundos de previdência de estatais.',
  },
  {
    id: 'cpi-contratos-saude',
    name: 'CPI dos Contratos da Saúde',
    description: 'Apura compras emergenciais de medicamentos e equipamentos sem licitação.',
  },
  {
    id: 'cpi-apostas-online',
    name: 'CPI das Apostas Online',
    description: 'Investiga a regulação das plataformas de apostas e a influência de seus lobistas no governo.',
  },
  {
    id: 'cpi-descontos-previdenciarios',
    name: 'CPI dos Descontos Previdenciários',
    description: 'Apura descontos indevidos em aposentadorias e a omissão de órgãos de controle.',
  },
  {
    id: 'cpi-agencias-reguladoras',
    name: 'CPI das Agências Reguladoras',
    description: 'Examina indicações políticas e decisões favoráveis a grupos econômicos em agências reguladoras.',
  },
];
