import type { Party } from '@/types';

/**
 * Partidos reais do Brasil (mundo "Brasil real").
 *
 * `seats` = bancadas eleitas para a Câmara dos Deputados em 4 de outubro de 2026
 * (posse em fevereiro de 2027), que somam 513. Fontes: Agência Câmara
 * ("PL sai na frente na eleição da Câmara dos Deputados, com 121 eleitos", 05/10/2026),
 * CNN Brasil (05/10/2026) e TV Senado (07/10/2026) para os totais por partido/federação;
 * PT (05/10/2026), PCdoB (05/10/2026), PSOL (08/10/2026), Metrópoles (14/10/2026) e
 * Polêmica Paraíba (20/10/2026) para a divisão dentro das federações.
 *
 * Federações: os partidos federados aparecem separados com a própria bancada
 * (PT 70 + PCdoB 11 + PV 7 = 88 da Brasil da Esperança; União 46 + PP 41 = 87 da
 * União Progressista; PSOL 14 da federação PSOL-Rede, que somou 15; PSDB 11 e
 * Cidadania 0). As legendas mínimas (Solidariedade-PRD, 7, e Rede, 1) estão em "Outros".
 *
 * Ideologias são aproximações para o jogo; `congressBase` segue o tamanho da bancada.
 */
export const REAL_PARTIES: Party[] = [
  {
    id: 'real-pl',
    name: 'Partido Liberal',
    acronym: 'PL',
    color: '#0A3D8F',
    economicIdeology: 60,
    socialIdeology: 80,
    description:
      'Fundado em 2006 como PR, da fusão do antigo PL com o Prona, retomou a sigla PL em 2019. De direita conservadora, abriga Jair e Flávio Bolsonaro e elegeu a maior bancada da Câmara em 2026.',
    congressBase: 6,
    seats: 121,
    world: 'real',
  },
  {
    id: 'real-pt',
    name: 'Partido dos Trabalhadores',
    acronym: 'PT',
    color: '#C8102E',
    economicIdeology: -50,
    socialIdeology: -30,
    description:
      'Fundado em 1980 por sindicalistas, intelectuais e movimentos sociais, é o principal partido da esquerda brasileira. Defende transferência de renda, valorização do salário mínimo e Estado indutor; lidera a federação Brasil da Esperança.',
    congressBase: 4,
    seats: 70,
    world: 'real',
  },
  {
    id: 'real-uniao',
    name: 'União Brasil',
    acronym: 'UNIÃO',
    color: '#1679B5',
    economicIdeology: 40,
    socialIdeology: 35,
    description:
      'Criado em 2022 pela fusão do DEM com o PSL, é de centro-direita e liberal na economia. Em 2026 disputou a eleição federado com o PP, na União Progressista.',
    congressBase: 2,
    seats: 46,
    world: 'real',
  },
  {
    id: 'real-psd',
    name: 'Partido Social Democrático',
    acronym: 'PSD',
    color: '#D9820F',
    economicIdeology: 20,
    socialIdeology: 15,
    description:
      'Fundado em 2011 por Gilberto Kassab, é um partido de centro, pragmático e com grande presença nas prefeituras. Lançou Ronaldo Caiado à Presidência em 2026.',
    congressBase: 2,
    seats: 43,
    world: 'real',
  },
  {
    id: 'real-pp',
    name: 'Progressistas',
    acronym: 'PP',
    color: '#203F71',
    economicIdeology: 45,
    socialIdeology: 45,
    description:
      'Herdeiro da Arena e do PDS, é de centro-direita e um dos pilares do centrão, com forte presença no interior. Em 2026 disputou a eleição federado com o União Brasil.',
    congressBase: 1,
    seats: 41,
    world: 'real',
  },
  {
    id: 'real-republicanos',
    name: 'Republicanos',
    acronym: 'REPUBLICANOS',
    color: '#0070C5',
    economicIdeology: 35,
    socialIdeology: 65,
    description:
      'Fundado em 2005 como PRB e renomeado em 2019, é de centro-direita, conservador nos costumes e com forte base entre eleitores evangélicos.',
    congressBase: 1,
    seats: 41,
    world: 'real',
  },
  {
    id: 'real-mdb',
    name: 'Movimento Democrático Brasileiro',
    acronym: 'MDB',
    color: '#2E7D46',
    economicIdeology: 15,
    socialIdeology: 15,
    description:
      'Nascido em 1966 como a oposição legal ao regime militar, é um partido de centro com enorme capilaridade municipal. Pragmático, integrou a maioria dos governos desde a redemocratização.',
    congressBase: 1,
    seats: 36,
    world: 'real',
  },
  {
    id: 'real-podemos',
    name: 'Podemos',
    acronym: 'PODE',
    color: '#3D9A2E',
    economicIdeology: 30,
    socialIdeology: 30,
    description:
      'Antigo PTN, adotou o nome Podemos em 2017. De centro-direita, defende mecanismos de participação direta e foi um dos partidos que mais cresceram na Câmara em 2026.',
    congressBase: 0,
    seats: 27,
    world: 'real',
  },
  {
    id: 'real-psb',
    name: 'Partido Socialista Brasileiro',
    acronym: 'PSB',
    color: '#D4A400',
    economicIdeology: -30,
    socialIdeology: -20,
    description:
      'Fundado em 1947 e refundado em 1985, é um partido de centro-esquerda. É a legenda do vice-presidente Geraldo Alckmin e integra a coligação de Lula em 2026.',
    congressBase: -2,
    seats: 15,
    world: 'real',
  },
  {
    id: 'real-psol',
    name: 'Partido Socialismo e Liberdade',
    acronym: 'PSOL',
    color: '#E0402A',
    economicIdeology: -80,
    socialIdeology: -70,
    description:
      'Fundado em 2004 por dissidentes do PT, é de esquerda, com pautas de direitos humanos, meio ambiente e taxação de grandes fortunas. Disputa eleições em federação com a Rede.',
    congressBase: -3,
    seats: 14,
    world: 'real',
  },
  {
    id: 'real-pcdob',
    name: 'Partido Comunista do Brasil',
    acronym: 'PCdoB',
    color: '#8B0000',
    economicIdeology: -75,
    socialIdeology: -45,
    description:
      'Organizado em 1962 a partir de uma cisão do PCB, é um partido comunista e aliado histórico do PT, com quem forma a federação Brasil da Esperança desde 2022.',
    congressBase: -3,
    seats: 11,
    world: 'real',
  },
  {
    id: 'real-psdb',
    name: 'Partido da Social Democracia Brasileira',
    acronym: 'PSDB',
    color: '#1F3FB5',
    economicIdeology: 25,
    socialIdeology: 0,
    description:
      'Fundado em 1988 por dissidentes do PMDB, governou o país com Fernando Henrique Cardoso (1995–2002). De centro, social-democrata na origem e defensor de reformas liberais; é federado com o Cidadania.',
    congressBase: -3,
    seats: 11,
    world: 'real',
  },
  {
    id: 'real-novo',
    name: 'Partido Novo',
    acronym: 'NOVO',
    color: '#E0601A',
    economicIdeology: 85,
    socialIdeology: 35,
    description:
      'Fundado em 2011 e registrado em 2015, defende Estado enxuto, privatizações e corte de gastos. Liberal na economia e linha-dura na segurança, lançou Romeu Zema à Presidência em 2026.',
    congressBase: -4,
    seats: 10,
    world: 'real',
  },
  {
    id: 'real-pv',
    name: 'Partido Verde',
    acronym: 'PV',
    color: '#00703C',
    economicIdeology: -25,
    socialIdeology: -45,
    description:
      'Fundado em 1986, é o partido ambientalista brasileiro, com pautas de sustentabilidade e energia limpa. Integra a federação Brasil da Esperança com PT e PCdoB.',
    congressBase: -4,
    seats: 7,
    world: 'real',
  },
  {
    id: 'real-pdt',
    name: 'Partido Democrático Trabalhista',
    acronym: 'PDT',
    color: '#C21E56',
    economicIdeology: -40,
    socialIdeology: -15,
    description:
      'Criado por Leonel Brizola na redemocratização, herdeiro do trabalhismo de Getúlio Vargas e João Goulart. De centro-esquerda, defende educação pública em tempo integral e desenvolvimentismo.',
    congressBase: -4,
    seats: 6,
    world: 'real',
  },
  {
    id: 'real-avante',
    name: 'Avante',
    acronym: 'AVANTE',
    color: '#088F8F',
    economicIdeology: 10,
    socialIdeology: 20,
    description:
      'Antigo PTdoB, adotou o nome Avante em 2017. Legenda de centro e bancada pequena, lançou o escritor Augusto Cury à Presidência em 2026.',
    congressBase: -5,
    seats: 5,
    world: 'real',
  },
  {
    id: 'real-missao',
    name: 'Missão',
    acronym: 'MISSÃO',
    color: '#C7951A',
    economicIdeology: 65,
    socialIdeology: 40,
    description:
      'Criado por integrantes do Movimento Brasil Livre (MBL) e registrado pelo TSE em 2025, é de direita e liberal na economia. Lançou Renan Santos à Presidência e elegeu um deputado em 2026.',
    congressBase: -6,
    seats: 1,
    world: 'real',
  },
  {
    id: 'real-outros',
    name: 'Outros partidos',
    acronym: 'OUT',
    color: '#6D6A75',
    economicIdeology: 5,
    socialIdeology: 10,
    description:
      'Legendas com bancadas mínimas eleitas em 2026: a federação Solidariedade-PRD (Renovação Solidária) e a Rede Sustentabilidade, federada ao PSOL.',
    congressBase: -5,
    seats: 8,
    world: 'real',
  },
];
