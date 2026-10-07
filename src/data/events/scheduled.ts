import type { GameEvent } from '@/types';

/** Eventos programados do calendário real (ocorrem obrigatoriamente na data, uma vez por partida). */
export const SCHEDULED_EVENTS: GameEvent[] = [
  {
    id: 'olimpiadas-los-angeles',
    category: 'opportunity',
    title: 'Olimpíadas de Los Angeles',
    icon: '🏅',
    description:
      'Começam os Jogos de Los Angeles e as primeiras medalhas brasileiras empolgam o país. O comitê olímpico pede ao governo verba garantida para os próximos anos.',
    frequency: 'moderate',
    scheduled: { year: 2028, month: 7 },
    oneTime: true,
    options: [
      {
        id: 'esporte-escolar',
        label: 'Lançar programa de esporte nas escolas',
        description: 'Gera uma política duradoura, mas custa e o resultado é de longo prazo.',
        impact: {
          debt: 0.1,
          approval: 1,
          sectors: { lowerClass: 2, middleClass: 1, market: -1 },
        },
        delayed: [{ impact: { ideb: 0.03, prestige: 1 }, delay: 3, duration: 12, label: 'Programa de esporte escolar' }],
        headline: 'Na onda das Olimpíadas, governo lança programa de esporte em 10 mil escolas',
      },
      {
        id: 'comitiva-los-angeles',
        label: 'Ir a Los Angeles e ver o presidente dos EUA',
        description: 'Aproxima o Brasil dos EUA, mas a viagem é vista como gasto à toa.',
        impact: {
          approval: -1,
          prestige: 1,
          relations: { eua: 4 },
          sectors: { lowerClass: -1, business: 1 },
        },
        headline: 'Presidente vai à abertura dos Jogos e tem encontro bilateral em Los Angeles',
        risk: {
          chance: 0.25,
          impact: { approval: -1, prestige: -2 },
          headline: 'Presidente dos EUA cancela encontro e viagem a Los Angeles frustra',
        },
      },
      {
        id: 'patrocinio-estatais',
        label: 'Garantir o patrocínio das estatais ao esporte',
        description: 'Assegura os próximos Jogos, mas o mercado critica o uso das estatais.',
        impact: {
          debt: 0.05,
          approval: 1,
          prestige: 1,
          sectors: { middleClass: 1, market: -2 },
        },
        headline: 'Petrobras, Caixa e BB renovam patrocínio ao esporte olímpico até 2032',
      },
    ],
  },
  {
    id: 'eleicoes-municipais-2028',
    category: 'social',
    title: 'Eleições Municipais de 2028',
    icon: '🗳️',
    description:
      'O país escolhe prefeitos e vereadores em 5.568 cidades. O resultado redesenha a base dos deputados e mede o governo a dois anos da eleição presidencial.',
    frequency: 'moderate',
    scheduled: { year: 2028, month: 10 },
    oneTime: true,
    options: [
      {
        id: 'campanha-aliados',
        label: 'Fazer campanha para aliados nas capitais',
        description: 'Fortalece a base se aliados vencerem, mas arrisca derrotas pessoais.',
        impact: {
          approval: -2,
          congressSupport: 4,
          sectors: { middleClass: -2, lowerClass: 1 },
        },
        headline: 'Presidente sobe em palanques nas capitais e eleição municipal vira teste nacional',
      },
      {
        id: 'neutralidade-institucional',
        label: 'Ficar neutro e seguir governando',
        description: 'Preserva a imagem, mas aliados reclamam da falta de apoio.',
        impact: {
          approval: 1,
          congressSupport: -2,
          sectors: { middleClass: 2, market: 1 },
        },
        headline: 'Presidente se mantém fora da campanha municipal; aliados reclamam de abandono',
      },
      {
        id: 'convenios-prefeitos',
        label: 'Prometer obras aos prefeitos eleitos',
        description: 'Atrai os novos prefeitos para a base, mas compromete o orçamento.',
        impact: {
          congressSupport: 3,
          debt: 0.2,
          sectors: { market: -2 },
        },
        delayed: [{ impact: { infrastructureKm: 300 }, delay: 3, duration: 8, label: 'Obras com as prefeituras' }],
        headline: 'Planalto promete obras a prefeitos eleitos e amplia base municipal',
      },
    ],
  },
  {
    id: 'orcamento-censo-2030',
    category: 'social',
    title: 'Verba para o Censo de 2030',
    icon: '📋',
    description:
      'O IBGE pede R$ 3 bilhões para o Censo, que visitará 75 milhões de lares. Sem a verba toda, a pesquisa pode atrasar, como o Censo 2020, feito só em 2022.',
    frequency: 'moderate',
    scheduled: { year: 2029, month: 8 },
    oneTime: true,
    options: [
      {
        id: 'orcamento-integral-censo',
        label: 'Garantir a verba integral do Censo',
        description: 'Dados confiáveis por uma década, com custo pequeno.',
        impact: {
          debt: 0.03,
          prestige: 1,
          sectors: { middleClass: 1, market: -1 },
        },
        delayed: [
          { impact: { potentialGrowth: 0.03 }, delay: 12, duration: 12, label: 'Políticas guiadas pelo Censo' },
        ],
        headline: 'Governo garante R$ 3 bi e Censo 2030 sairá no prazo',
      },
      {
        id: 'censo-enxuto',
        label: 'Fazer um Censo com questionário menor',
        description: 'Economiza, mas perde dados importantes sobre renda e moradia.',
        impact: {
          debt: 0.02,
          prestige: -1,
          sectors: { middleClass: -1 },
        },
        headline: 'Censo 2030 terá questionário reduzido; pesquisadores criticam cortes',
      },
      {
        id: 'adiar-censo',
        label: 'Adiar o Censo para 2031',
        description: 'Libera verba no ano eleitoral, mas deixa o país sem dados.',
        impact: {
          debt: -0.03,
          prestige: -3,
          sectors: { middleClass: -2, market: 1 },
        },
        delayed: [{ impact: { potentialGrowth: -0.03 }, delay: 6, duration: 12, label: 'Apagão estatístico' }],
        headline: 'Governo adia o Censo para 2031; servidores do IBGE protestam',
      },
    ],
  },
  {
    id: 'copa-do-mundo-2030',
    category: 'opportunity',
    title: 'Copa do Mundo de 2030',
    icon: '⚽',
    description:
      'Começa a Copa do centenário, com a seleção entre as favoritas e o país parado nos jogos. A quatro meses da eleição, a festa vira cálculo político.',
    frequency: 'moderate',
    scheduled: { year: 2030, month: 6 },
    oneTime: true,
    options: [
      {
        id: 'ponto-facultativo-jogos',
        label: 'Dar folga nos jogos do Brasil e pôr telões',
        description: 'Popular e festivo, mas freia a economia e irrita comércio e indústria.',
        impact: {
          approval: 2,
          gdpGrowth: -0.1,
          sectors: { lowerClass: 3, middleClass: 1, business: -3 },
        },
        headline: 'Governo decreta ponto facultativo nos jogos da seleção',
      },
      {
        id: 'agenda-comercial-copa',
        label: 'Usar a Copa para negócios na Europa e África',
        description: 'Aproxima novos parceiros, mas viajar em ano eleitoral é criticado.',
        impact: {
          approval: -1,
          debt: 0.05,
          prestige: 2,
          relations: { 'uniao-europeia': 3, africa: 3 },
          sectors: { business: 2, market: 1 },
        },
        headline: 'Presidente aproveita a Copa para missão comercial na Península Ibérica e no Marrocos',
      },
      {
        id: 'distancia-selecao',
        label: 'Manter distância da seleção',
        description: 'Evita acusação de uso eleitoral, mas deixa o palco aos adversários.',
        impact: {
          approval: -1,
          sectors: { middleClass: 1, market: 1 },
        },
        headline: 'Presidente evita associar imagem à seleção em ano eleitoral',
      },
    ],
  },
  {
    id: 'debates-presidenciais-2030',
    category: 'social',
    title: 'Campanha e Debates de 2030',
    icon: '🎤',
    description:
      'Começa a campanha para a eleição de outubro, com debates na TV e propaganda eleitoral. A oposição promete usar cada número ruim do governo contra você.',
    frequency: 'moderate',
    scheduled: { year: 2030, month: 8 },
    oneTime: true,
    options: [
      {
        id: 'participar-debates',
        label: 'Ir a todos os debates e defender o legado',
        description: 'Mostra confiança e atrai indecisos, mas promessas assustam o mercado.',
        impact: {
          approval: 2,
          exchangeRate: 0.05,
          sectors: { middleClass: 2, business: -1, market: -2 },
        },
        headline: 'Presidente enfrenta adversários em debate e defende resultados do governo',
      },
      {
        id: 'evitar-debates',
        label: 'Faltar aos debates e apostar na propaganda',
        description: 'Evita gafes e ataques, mas a ausência é explorada pela oposição.',
        impact: {
          approval: -2,
          congressSupport: 1,
          sectors: { middleClass: -4, lowerClass: 1 },
        },
        headline: 'Cadeira vazia: presidente falta a debate e vira alvo dos adversários',
      },
      {
        id: 'pacote-pre-eleitoral',
        label: 'Aprovar pacote de benefícios antes da eleição',
        description: 'Ganha votos dos mais pobres, mas a conta e a inflação chegam depois.',
        impact: {
          approval: 4,
          debt: 0.8,
          inflation: -0.2,
          exchangeRate: 0.15,
          sectors: { lowerClass: 7, market: -6, middleClass: -1 },
        },
        delayed: [{ impact: { inflation: 0.4, debt: 0.4 }, delay: 3, duration: 6, label: 'Conta das medidas eleitorais' }],
        headline: 'Congresso aprova pacote de benefícios a dois meses da eleição; mercado reage mal',
      },
    ],
  },
  {
    id: 'eleicoes-municipais-2032',
    category: 'social',
    title: 'Eleições Municipais de 2032',
    icon: '🗳️',
    description:
      'O país volta às urnas para escolher prefeitos. Com o fim do mandato perto, os partidos já preparam nomes para 2034 e testam a força do Planalto.',
    frequency: 'moderate',
    scheduled: { year: 2032, month: 10 },
    oneTime: true,
    options: [
      {
        id: 'construir-sucessao',
        label: 'Fazer campanha com um possível sucessor',
        description: 'Prepara a continuidade e une a base, mas politiza o governo.',
        impact: {
          approval: -2,
          congressSupport: 3,
          sectors: { middleClass: -2, lowerClass: 1 },
        },
        headline: 'Presidente apresenta seu sucessor em palanques das eleições municipais',
      },
      {
        id: 'frente-ampla-prefeitos',
        label: 'Apoiar candidatos do Centrão',
        description: 'Garante votos no Congresso até o fim, mas descaracteriza o governo.',
        impact: {
          approval: -1,
          congressSupport: 5,
          sectors: { middleClass: -3, environmentalists: -2, lowerClass: -1 },
        },
        headline: 'Planalto apoia candidatos do Centrão e garante base para o fim do mandato',
      },
      {
        id: 'neutralidade-2032',
        label: 'Ficar neutro e focar na gestão',
        description: 'Preserva a imagem, mas aliados já sentem o fim do governo.',
        impact: {
          approval: 1,
          congressSupport: -3,
          sectors: { market: 1, middleClass: 1 },
        },
        headline: 'Fora da campanha municipal, presidente vê aliados buscarem novos padrinhos',
      },
    ],
  },
  {
    id: 'copa-do-mundo-2034',
    category: 'opportunity',
    title: 'Copa do Mundo de 2034',
    icon: '🏆',
    description:
      'A Copa na Arábia Saudita mobiliza o país no último ano do mandato. Grupos de direitos humanos cobram os governos que mandarem autoridades.',
    frequency: 'moderate',
    scheduled: { year: 2034, month: 6 },
    oneTime: true,
    options: [
      {
        id: 'ponto-facultativo-jogos',
        label: 'Dar folga nos jogos do Brasil',
        description: 'Popular, mas reduz a atividade e irrita comércio e indústria.',
        impact: {
          approval: 2,
          gdpGrowth: -0.1,
          sectors: { lowerClass: 3, middleClass: 1, business: -3 },
        },
        headline: 'Governo decreta ponto facultativo nos jogos da seleção na Copa de 2034',
      },
      {
        id: 'acordos-golfo',
        label: 'Levar empresários ao Golfo por investimentos',
        description: 'Atrai capital árabe, mas a aliança com o regime saudita é criticada.',
        impact: {
          approval: -1,
          prestige: 1,
          sectors: { business: 3, environmentalists: -2, middleClass: -1 },
        },
        delayed: [{ impact: { foreignInvestment: 4 }, delay: 1, duration: 6, label: 'Investimentos do Golfo' }],
        headline: 'Presidente leva empresários à Copa e negocia investimentos de fundos sauditas',
      },
      {
        id: 'ausencia-diplomatica',
        label: 'Boicotar a Copa por direitos humanos',
        description: 'Mantém a coerência externa, mas fecha portas a investimentos no Golfo.',
        impact: {
          prestige: 1,
          foreignInvestment: -1,
          relations: { 'uniao-europeia': 2 },
          sectors: { environmentalists: 2, business: -2 },
        },
        headline: 'Governo não envia autoridades à Copa e cita direitos humanos',
      },
    ],
  },
];
