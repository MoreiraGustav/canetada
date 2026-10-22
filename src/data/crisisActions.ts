import type { PresidentialAction } from '@/types';

/**
 * Gabinete de crise: medidas de emergência, uma por mês, liberadas só quando um
 * indicador entra no vermelho (`conditions`). São mais fortes que as decisões
 * comuns — servem para estancar a bola de neve —, mas toda medida tem custo
 * (contas, setores, efeito rebote ou risco de dar errado).
 */
export const CRISIS_ACTIONS: PresidentialAction[] = [
  {
    id: 'venda-de-reservas',
    name: 'Vender reservas para segurar o dólar',
    icon: '💵',
    description: 'O BC vende dólares e o câmbio recua, mas as reservas não são infinitas.',
    impact: { exchangeRate: -0.45, inflation: -0.15, prestige: -1, sectors: { market: 2, business: 2 } },
    risk: {
      chance: 0.25,
      impact: { exchangeRate: 0.2, sectors: { market: -3 } },
      headline: 'Mesmo após venda bilionária de reservas, dólar volta a subir',
    },
    cooldown: 6,
    conditions: [{ kind: 'indicator', indicator: 'exchangeRate', comparator: 'gt', value: 6.2 }],
    headline: 'Banco Central vende US$ 20 bilhões das reservas e o dólar recua',
  },
  {
    id: 'segurar-combustiveis',
    name: 'Segurar preço de combustível e energia',
    icon: '⛽',
    description: 'Derruba a inflação já, mas o subsídio pesa e o preço volta depois.',
    impact: { inflation: -0.8, primaryBalance: -0.15, sectors: { lowerClass: 3, middleClass: 2, market: -4 } },
    delayed: [{ impact: { inflation: 0.4 }, delay: 5, duration: 4, label: 'Represamento de preços' }],
    cooldown: 8,
    conditions: [{ kind: 'indicator', indicator: 'inflation', comparator: 'gt', value: 6 }],
    headline: 'Governo congela tarifas e banca desconto no diesel para conter a inflação',
  },
  {
    id: 'zerar-imposto-alimentos',
    name: 'Zerar imposto de importação de alimentos',
    icon: '🧺',
    description: 'Comida importada mais barata alivia o bolso; produtores reclamam.',
    impact: { inflation: -0.35, primaryBalance: -0.04, sectors: { lowerClass: 2, agribusiness: -3 } },
    cooldown: 6,
    conditions: [{ kind: 'indicator', indicator: 'inflation', comparator: 'gt', value: 5.5 }],
    headline: 'Governo zera imposto de importação de arroz, feijão e carne até o fim do ano',
  },
  {
    id: 'frentes-de-trabalho',
    name: 'Frentes de trabalho emergenciais',
    icon: '👷',
    description: 'Contrata desempregados para obras locais: emprego rápido, gasto alto.',
    impact: { unemployment: -0.5, debt: 0.4, primaryBalance: -0.1, sectors: { lowerClass: 4, market: -3 } },
    cooldown: 8,
    conditions: [{ kind: 'indicator', indicator: 'unemployment', comparator: 'gt', value: 9.5 }],
    headline: 'Programa emergencial contrata 400 mil desempregados para obras nos municípios',
  },
  {
    id: 'credito-emergencial',
    name: 'Crédito emergencial para empresas',
    icon: '🏦',
    description: 'Bancos públicos socorrem empresas e seguram empregos; a dívida sobe.',
    impact: { gdpGrowth: 0.6, unemployment: -0.2, debt: 0.8, sectors: { business: 5, lowerClass: 1, market: -2 } },
    risk: {
      chance: 0.2,
      impact: { debt: 0.4, sectors: { middleClass: -2 } },
      headline: 'Calote em linha emergencial deixa rombo nos bancos públicos',
    },
    cooldown: 10,
    conditions: [{ kind: 'indicator', indicator: 'gdpGrowth', comparator: 'lt', value: 0.5 }],
    headline: 'BNDES e Caixa abrem linha de R$ 80 bilhões para salvar empresas e empregos',
  },
  {
    id: 'contingenciamento',
    name: 'Contingenciar o orçamento',
    icon: '✂️',
    description: 'Congela gastos de todos os ministérios: acalma o mercado, trava serviços.',
    impact: { primaryBalance: 0.4, gdpGrowth: -0.2, approval: -1, sectors: { market: 6, lowerClass: -2, middleClass: -2, environmentalists: -2 } },
    cooldown: 6,
    conditions: [
      {
        kind: 'any',
        conditions: [
          { kind: 'indicator', indicator: 'primaryBalance', comparator: 'lt', value: -1.2 },
          { kind: 'indicator', indicator: 'debt', comparator: 'gt', value: 85 },
        ],
      },
    ],
    headline: 'Fazenda bloqueia R$ 45 bilhões do orçamento para conter rombo nas contas',
    flags: ['corte-de-gastos'],
  },
  {
    id: 'reforma-ministerial',
    name: 'Reforma ministerial',
    icon: '🔄',
    description: 'Entrega pastas a partidos: base maior, imagem de loteamento.',
    impact: { congressSupport: 7, approval: 1, sectors: { middleClass: -2 } },
    risk: {
      chance: 0.2,
      impact: { approval: -2, congressSupport: -2 },
      headline: 'Novo ministro mal toma posse e já é alvo de denúncia na imprensa',
    },
    cooldown: 12,
    conditions: [
      {
        kind: 'any',
        conditions: [
          { kind: 'indicator', indicator: 'approval', comparator: 'lt', value: 35 },
          { kind: 'indicator', indicator: 'congressSupport', comparator: 'lt', value: 40 },
        ],
      },
    ],
    headline: 'Presidente faz reforma ministerial e entrega quatro pastas a partidos aliados',
  },
  {
    id: 'pacto-nacional',
    name: 'Convocar um pacto nacional',
    icon: '🤝',
    description: 'Reúne Poderes e governadores: trégua política, mas exige repasses.',
    impact: { approval: 2.5, congressSupport: 3, primaryBalance: -0.08, sectors: { market: -1 } },
    cooldown: 12,
    conditions: [{ kind: 'indicator', indicator: 'approval', comparator: 'lt', value: 30 }],
    headline: 'Em gesto de união, Presidente reúne os três Poderes e governadores no Planalto',
  },
  {
    id: 'forca-nacional',
    name: 'Força Nacional nos estados críticos',
    icon: '🚔',
    description: 'Reforço federal derruba a violência, mas ativistas temem abusos.',
    impact: { homicideRate: -1.2, securityTrust: 5, debt: 0.15, sectors: { middleClass: 3, military: 3, environmentalists: -2 } },
    risk: {
      chance: 0.2,
      impact: { securityTrust: -4, sectors: { lowerClass: -3 } },
      headline: 'Operação da Força Nacional termina com mortes e moradores denunciam abusos',
    },
    cooldown: 8,
    conditions: [
      {
        kind: 'any',
        conditions: [
          { kind: 'indicator', indicator: 'homicideRate', comparator: 'gt', value: 24 },
          { kind: 'indicator', indicator: 'securityTrust', comparator: 'lt', value: 35 },
        ],
      },
    ],
    headline: 'Força Nacional desembarca em cinco estados para conter onda de violência',
  },
  {
    id: 'plano-energia-emergencial',
    name: 'Plano emergencial de energia e água',
    icon: '💧',
    description: 'Termelétricas e obras evitam o racionamento, com conta de luz mais cara.',
    impact: { waterReserves: 8, inflation: 0.2, debt: 0.3, co2Emissions: 15, sectors: { business: 3, environmentalists: -3 } },
    cooldown: 10,
    conditions: [{ kind: 'indicator', indicator: 'waterReserves', comparator: 'lt', value: 45 }],
    headline: 'Governo aciona termelétricas e obras emergenciais para evitar racionamento',
  },
  {
    id: 'ofensiva-na-cpi',
    name: 'Mobilizar a base contra a CPI',
    icon: '🛡️',
    description: 'Aliados ocupam a CPI e esvaziam as sessões; a oposição grita "abafa".',
    impact: { congressSupport: 3, sectors: { middleClass: -2 } },
    risk: {
      chance: 0.3,
      impact: { approval: -2, congressSupport: -2 },
      headline: 'Manobra da base na CPI vaza e oposição acusa governo de abafar investigação',
    },
    cooldown: 6,
    conditions: [{ kind: 'flag', flag: 'cpi-instalada', present: true }],
    headline: 'Base aliada assume relatoria da CPI e ritmo das investigações desacelera',
  },
  {
    id: 'defesa-contra-impeachment',
    name: 'Montar a defesa contra o impeachment',
    icon: '⚖️',
    description: 'Cargos e emendas para segurar votos na Câmara; a imagem do governo sofre.',
    impact: { congressSupport: 8, debt: 0.3, approval: -1, sectors: { middleClass: -3 } },
    cooldown: 6,
    conditions: [{ kind: 'flag', flag: 'impeachment-aberto', present: true }],
    headline: 'Planalto libera emendas e cargos para barrar o impeachment na Câmara',
    flags: ['negociacao-recente'],
  },
];
