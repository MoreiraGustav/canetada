import type { Bloc, Country } from '@/types';

/**
 * Países/blocos com mecânica ativa (GDD §4.3).
 * `economicWeight` aproxima a participação no comércio exterior brasileiro (MDIC 2024).
 */
export const COUNTRIES: Country[] = [
  {
    id: 'eua',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    initialRelation: 60,
    interests: ['Comércio', 'Democracia', 'Segurança hemisférica'],
    blocs: [],
    economicWeight: 0.22,
    description:
      'Segundo maior parceiro comercial e principal fonte de investimento direto. Sensível a aproximações com China e Rússia e a tarifas sobre aço e etanol.',
  },
  {
    id: 'china',
    name: 'China',
    flag: '🇨🇳',
    initialRelation: 70,
    interests: ['Commodities', 'Investimento em infraestrutura', 'BRICS'],
    blocs: ['brics'],
    economicWeight: 0.3,
    description:
      'Maior parceiro comercial do Brasil, destino de soja, minério e petróleo. Interessada em portos, energia e ferrovias.',
  },
  {
    id: 'uniao-europeia',
    name: 'União Europeia',
    flag: '🇪🇺',
    initialRelation: 65,
    interests: ['Acordo Mercosul–UE', 'Meio ambiente', 'Direitos humanos'],
    blocs: [],
    economicWeight: 0.2,
    description:
      'Grande investidora e compradora de produtos agrícolas. Condiciona acordos comerciais a compromissos ambientais na Amazônia.',
  },
  {
    id: 'argentina',
    name: 'Argentina',
    flag: '🇦🇷',
    initialRelation: 75,
    interests: ['Mercosul', 'Integração regional', 'Indústria automotiva'],
    blocs: ['mercosul'],
    economicWeight: 0.08,
    description:
      'Principal sócio do Mercosul e maior comprador de manufaturados brasileiros. Crises cambiais no vizinho afetam a indústria nacional.',
  },
  {
    id: 'russia',
    name: 'Rússia',
    flag: '🇷🇺',
    initialRelation: 55,
    interests: ['BRICS', 'Fertilizantes', 'Geopolítica'],
    blocs: ['brics'],
    economicWeight: 0.05,
    description:
      'Fornecedora estratégica de fertilizantes e diesel. Aproximar-se de Moscou gera atrito com EUA e União Europeia.',
  },
  {
    id: 'india',
    name: 'Índia',
    flag: '🇮🇳',
    initialRelation: 50,
    interests: ['BRICS', 'Comércio', 'Biocombustíveis'],
    blocs: ['brics'],
    economicWeight: 0.07,
    description:
      'Mercado em rápida expansão para açúcar, petróleo e óleos vegetais. Parceira em fóruns multilaterais e na agenda de biocombustíveis.',
  },
  {
    id: 'africa',
    name: 'África',
    flag: '🌍',
    initialRelation: 50,
    interests: ['Cooperação Sul-Sul', 'Lusofonia', 'Agricultura tropical'],
    blocs: ['brics'],
    economicWeight: 0.08,
    description:
      'Bloco de parceiros que inclui os países lusófonos e a África do Sul. Demanda cooperação técnica em agricultura, saúde e educação.',
  },
];

export const BLOCS: Bloc[] = [
  {
    id: 'brics',
    name: 'BRICS',
    icon: '🌎',
    members: ['china', 'russia', 'india', 'africa'],
    description: 'Fórum das grandes economias emergentes. Defende o multilateralismo e alternativas ao dólar no comércio.',
  },
  {
    id: 'mercosul',
    name: 'Mercosul',
    icon: '🤝',
    members: ['argentina'],
    description: 'União aduaneira sul-americana e principal instrumento de integração comercial regional do Brasil.',
  },
];
