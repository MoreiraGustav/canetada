import type { Decision } from '@/types';

/** Ministério do Meio Ambiente: desmatamento, clima, conservação, energia e queimadas. */
export const MEIO_AMBIENTE_DECISIONS: Decision[] = [
  {
    id: 'fiscalizacao-desmatamento',
    ministry: 'meio-ambiente',
    title: 'Desmatamento na Amazônia',
    context:
      'Os alertas de desmatamento voltaram a subir e o Ibama tem poucos fiscais. Ruralistas pressionam por uma lei que facilita licenças ambientais.',
    minTurn: 2,
    weight: 1.5,
    options: [
      {
        id: 'reforcar-ibama',
        label: 'Reforçar o Ibama e as operações',
        description:
          'Derruba o desmatamento, mas custa caro e abre conflito com o agro.',
        impact: {
          ideologyEconomic: -2, ideologySocial: -4,
          primaryBalance: -0.03,
          congressSupport: -1,
          sectors: { environmentalists: 7, agribusiness: -5 },
          relations: { 'uniao-europeia': 3 },
        },
        delayed: [
          {
            impact: { deforestation: -1500, co2Emissions: -50, prestige: 3 },
            delay: 2,
            duration: 18,
            label: 'Fiscalização reforçada na Amazônia',
          },
        ],
        headline: 'Governo anuncia concurso no Ibama e megaoperação contra o desmatamento ilegal',
        flags: ['fiscalizacao-amazonia-reforcada'],
      },
      {
        id: 'operacoes-focadas',
        label: 'Focar nos municípios críticos',
        description:
          'Custo menor, mas o efeito é parcial e o desmatamento migra.',
        impact: { primaryBalance: -0.01, sectors: { environmentalists: 2, agribusiness: -2 } },
        delayed: [
          {
            impact: { deforestation: -500, co2Emissions: -15 },
            delay: 1,
            duration: 12,
            label: 'Operações em municípios prioritários',
          },
        ],
        headline: 'Ibama concentra operações em municípios campeões de desmatamento',
      },
      {
        id: 'licenciamento-flexivel',
        label: 'Apoiar a lei que facilita licenças',
        description:
          'Destrava obras e agrada o agro, mas o desmatamento sobe e a Europa reage.',
        impact: {
          ideologyEconomic: 4, ideologySocial: 3,
          congressSupport: 2,
          prestige: -2,
          sectors: { agribusiness: 8, business: 4, environmentalists: -10 },
          relations: { 'uniao-europeia': -5 },
        },
        delayed: [
          { impact: { potentialGrowth: 0.05 }, delay: 3, duration: 18, label: 'Licenças ambientais aceleradas' },
          {
            impact: { deforestation: 1200, co2Emissions: 40 },
            delay: 2,
            duration: 18,
            label: 'Afrouxamento do controle ambiental',
          },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -1, sectors: { agribusiness: -3 } },
        headline: 'Congresso aprova lei que facilita licenças; ambientalistas falam em "devastação"',
        failureHeadline: 'Sem votos, projeto do licenciamento ambiental volta à gaveta e irrita ruralistas',
        flags: ['flexibilizacao-ambiental'],
      },
    ],
  },
  {
    id: 'mercado-carbono',
    ministry: 'meio-ambiente',
    title: 'Regras do mercado de carbono',
    context:
      'O mercado de carbono foi criado por lei, mas faltam as regras. A indústria quer prazos longos; investidores querem regras sérias.',
    minTurn: 3,
    options: [
      {
        id: 'sbce-rigoroso',
        label: 'Limites rígidos de emissão',
        description:
          'Atrai capital verde, mas encarece a indústria e freia a economia.',
        impact: {
          ideologyEconomic: -3, ideologySocial: -2,
          gdpGrowth: -0.1,
          sectors: { business: -5, market: 1, environmentalists: 6 },
          relations: { 'uniao-europeia': 3 },
        },
        delayed: [
          {
            impact: { co2Emissions: -60, foreignInvestment: 3, prestige: 2 },
            delay: 6,
            duration: 24,
            label: 'Mercado regulado de carbono',
          },
        ],
        headline: 'Governo cria regras duras no mercado de carbono e indústria reclama de custos',
      },
      {
        id: 'sbce-gradual-florestal',
        label: 'Transição gradual com créditos florestais',
        description:
          'Equilibra interesses, mas especialistas temem créditos de baixa qualidade.',
        impact: { sectors: { business: -1, agribusiness: 3, environmentalists: 2 } },
        delayed: [
          {
            impact: { co2Emissions: -25, deforestation: -300, foreignInvestment: 2 },
            delay: 6,
            duration: 24,
            label: 'Transição gradual do carbono',
          },
        ],
        headline: 'Mercado de carbono terá transição gradual e espaço para créditos florestais',
      },
      {
        id: 'adiar-sbce',
        label: 'Adiar as regras',
        description:
          'Poupa a indústria agora, mas o país perde credibilidade e investidores.',
        impact: {
          ideologyEconomic: 2,
          prestige: -2,
          sectors: { business: 3, environmentalists: -5 },
          relations: { 'uniao-europeia': -3 },
        },
        delayed: [{ impact: { foreignInvestment: -1 }, delay: 3, duration: 12, label: 'Mercado de carbono parado' }],
        headline: 'Governo adia regras do mercado de carbono e frustra investidores',
      },
    ],
  },
  {
    id: 'unidades-conservacao',
    ministry: 'meio-ambiente',
    title: 'Terras indígenas e áreas protegidas',
    context:
      'Há terras indígenas prontas para demarcar e novas áreas protegidas propostas contra a grilagem. Ruralistas prometem reagir.',
    minTurn: 3,
    options: [
      {
        id: 'homologar-terras-indigenas',
        label: 'Demarcar terras e criar áreas protegidas',
        description:
          'Protege indígenas e florestas, mas o agro e o Congresso reagem duro.',
        impact: {
          ideologySocial: -6,
          congressSupport: -3,
          prestige: 2,
          sectors: { environmentalists: 8, agribusiness: -7, military: -1 },
          relations: { 'uniao-europeia': 2 },
        },
        delayed: [
          {
            impact: { deforestation: -600, co2Emissions: -20 },
            delay: 3,
            duration: 24,
            label: 'Novas áreas protegidas',
          },
        ],
        headline: 'Presidente homologa terras indígenas e cria unidades de conservação na Amazônia',
      },
      {
        id: 'ucs-uso-sustentavel',
        label: 'Criar reservas de uso sustentável',
        description:
          'Gera renda local, mas protege menos e recebe críticas dos dois lados.',
        impact: { ideologySocial: -2, primaryBalance: -0.01, sectors: { environmentalists: 3, agribusiness: -2, business: 1 } },
        delayed: [
          {
            impact: { deforestation: -300, poverty: -0.2 },
            delay: 3,
            duration: 18,
            label: 'Bioeconomia em áreas de uso sustentável',
          },
        ],
        headline: 'Governo cria reservas extrativistas e amplia concessões de florestas públicas',
      },
      {
        id: 'suspender-demarcacoes',
        label: 'Suspender novas demarcações',
        description:
          'Agrada ruralistas e o Congresso, mas gera críticas externas e invasões.',
        impact: {
          ideologySocial: 6,
          congressSupport: 3,
          prestige: -3,
          sectors: { agribusiness: 6, military: 2, environmentalists: -8 },
          relations: { 'uniao-europeia': -3 },
        },
        delayed: [
          { impact: { deforestation: 500, co2Emissions: 20 }, delay: 2, duration: 18, label: 'Avanço da grilagem' },
        ],
        headline: 'Planalto congela demarcações de terras indígenas e lideranças anunciam protestos',
      },
    ],
  },
  {
    id: 'transicao-energetica',
    ministry: 'meio-ambiente',
    title: 'Rumo da transição energética',
    context:
      'A Petrobras quer explorar petróleo na Foz do Amazonas; investidores esperam leilões de energia limpa. O governo precisa escolher a prioridade.',
    minTurn: 4,
    options: [
      {
        id: 'priorizar-margem-equatorial',
        label: 'Priorizar o petróleo na Foz do Amazonas',
        description:
          'Traz royalties e empregos no Norte, mas compromete as metas climáticas.',
        impact: {
          ideologyEconomic: 2,
          prestige: -2,
          sectors: { business: 5, market: 3, environmentalists: -9 },
          relations: { 'uniao-europeia': -3 },
        },
        delayed: [
          {
            impact: { tradeBalance: 6, foreignInvestment: 4, potentialGrowth: 0.05 },
            delay: 12,
            duration: 24,
            label: 'Petróleo na Foz do Amazonas',
          },
          { impact: { co2Emissions: 40 }, delay: 12, duration: 24, label: 'Expansão da produção de petróleo' },
        ],
        headline: 'Governo prioriza petróleo na Foz do Amazonas e Ibama libera perfuração',
        risk: {
          chance: 0.15,
          impact: { foreignInvestment: 3, sectors: { market: 3, business: 2 } },
          headline: 'Petrobras confirma grande descoberta de petróleo na Margem Equatorial',
        },
      },
      {
        id: 'leiloes-renovaveis',
        label: 'Leiloar eólicas no mar, solar e hidrogênio',
        description:
          'Atrai capital verde, mas os subsídios pesam na conta de luz e demoram.',
        impact: {
          ideologySocial: -2,
          primaryBalance: -0.03,
          inflation: 0.1,
          sectors: { environmentalists: 5, business: 2, middleClass: -1 },
          relations: { 'uniao-europeia': 2 },
        },
        delayed: [
          {
            impact: { renewableEnergy: 3, co2Emissions: -30, foreignInvestment: 3, potentialGrowth: 0.04 },
            delay: 6,
            duration: 24,
            label: 'Expansão das renováveis',
          },
        ],
        headline: 'Brasil realiza primeiro leilão de eólicas em alto-mar e mira hidrogênio verde',
      },
      {
        id: 'transicao-equilibrada',
        label: 'Explorar petróleo e usar royalties no verde',
        description:
          'Perfura e financia energia limpa, mas não agrada ninguém por inteiro.',
        impact: { sectors: { business: 2, market: 1, environmentalists: -4 } },
        delayed: [
          {
            impact: { tradeBalance: 3, renewableEnergy: 1.5, co2Emissions: 15 },
            delay: 9,
            duration: 24,
            label: 'Fundo de transição energética',
          },
        ],
        headline: 'Governo autoriza petróleo na Foz do Amazonas e cria fundo verde com royalties',
      },
    ],
  },
  {
    id: 'fundo-amazonia-clima',
    ministry: 'meio-ambiente',
    title: 'Fundo Amazônia e agenda climática',
    context:
      'Noruega e Alemanha oferecem novas doações ao Fundo Amazônia em troca de metas. Na cúpula do clima, o Brasil precisa se posicionar.',
    minTurn: 2,
    months: [9, 10, 11],
    options: [
      {
        id: 'meta-desmatamento-zero',
        label: 'Assumir meta de desmatamento zero até 2030',
        description:
          'Garante doações e protagonismo, mas é difícil de cumprir e irrita o agro.',
        impact: {
          ideologySocial: -4,
          prestige: 4,
          sectors: { environmentalists: 6, agribusiness: -4 },
          relations: { 'uniao-europeia': 5, china: 1 },
        },
        delayed: [
          {
            impact: { foreignInvestment: 3, deforestation: -400 },
            delay: 3,
            duration: 12,
            label: 'Novos aportes ao Fundo Amazônia',
          },
        ],
        headline: 'Brasil assume meta de desmatamento zero e recebe novas doações',
      },
      {
        id: 'aporte-tesouro-tfff',
        label: 'Pôr dinheiro público no fundo de florestas',
        description:
          'Atrai outros doadores ao fundo criado pelo Brasil, mas irrita o mercado.',
        impact: {
          ideologyEconomic: -2, ideologySocial: -2,
          debt: 0.3,
          prestige: 3,
          sectors: { environmentalists: 4, market: -2 },
          relations: { 'uniao-europeia': 3, africa: 2 },
        },
        delayed: [
          { impact: { foreignInvestment: 4 }, delay: 6, duration: 18, label: 'Capital atraído pelo fundo' },
        ],
        headline: 'Brasil aporta bilhões no fundo de florestas tropicais e cobra países ricos',
      },
      {
        id: 'recusar-condicionantes',
        label: 'Recusar condições estrangeiras',
        description:
          'Discurso de soberania agrada militares e o agro, mas trava as doações.',
        impact: {
          ideologySocial: 5,
          prestige: -3,
          sectors: { military: 4, agribusiness: 4, environmentalists: -6 },
          relations: { 'uniao-europeia': -5 },
        },
        delayed: [{ impact: { foreignInvestment: -2 }, delay: 2, duration: 12, label: 'Doações internacionais suspensas' }],
        headline: 'Governo rejeita condições de doadores e Noruega congela repasses ao Fundo Amazônia',
      },
    ],
  },
  {
    id: 'brigadas-queimadas',
    ministry: 'meio-ambiente',
    title: 'Temporada de queimadas',
    context:
      'A seca chegou cedo e os focos de incêndio crescem no Cerrado, no Pantanal e na Amazônia. O Ibama pede mais brigadistas e aviões.',
    repeatable: true,
    cooldown: 10,
    months: [6, 7, 8],
    options: [
      {
        id: 'brigadas-permanentes',
        label: 'Criar brigadas fixas e comprar aviões',
        description:
          'Previne incêndios e fumaça nos próximos anos, mas tem custo contínuo.',
        impact: { ideologySocial: -2, primaryBalance: -0.03, sectors: { environmentalists: 4, agribusiness: 1, lowerClass: 1 } },
        delayed: [
          {
            impact: { deforestation: -200, co2Emissions: -15, waterReserves: 2 },
            delay: 1,
            duration: 12,
            label: 'Brigadas federais permanentes',
          },
        ],
        headline: 'Governo cria brigadas permanentes contra incêndios e compra novas aeronaves',
      },
      {
        id: 'brigadas-temporarias',
        label: 'Contratar brigadistas temporários',
        description:
          'Gasto pontual: basta em anos normais, mas falha em secas fortes.',
        impact: { debt: 0.03, sectors: { environmentalists: -1 } },
        delayed: [{ impact: { co2Emissions: 10 }, delay: 0, duration: 4, label: 'Temporada de fogo' }],
        headline: 'Ibama contrata brigadistas temporários para a temporada de incêndios',
      },
      {
        id: 'penas-incendio-criminoso',
        label: 'Endurecer penas para quem põe fogo',
        description:
          'Ataca a causa do fogo e pune donos de terra, mas o agro reage.',
        impact: { ideologySocial: -3, sectors: { environmentalists: 4, agribusiness: -5, middleClass: 1 } },
        delayed: [
          { impact: { deforestation: -300, co2Emissions: -20 }, delay: 2, duration: 12, label: 'Combate ao fogo criminoso' },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -1, sectors: { environmentalists: -2 } },
        headline: 'Congresso aprova penas mais duras para incêndios criminosos em florestas',
        failureHeadline: 'Bancada ruralista barra projeto que endurece punição a incêndios florestais',
      },
      {
        id: 'repassar-estados',
        label: 'Deixar o combate a cargo dos estados',
        description:
          'Poupa verbas, mas os estados não dão conta e a fumaça cobre cidades.',
        impact: { ideologyEconomic: 2, debt: -0.02, approval: -1, sectors: { environmentalists: -5, lowerClass: -1 } },
        delayed: [
          {
            impact: { deforestation: 300, co2Emissions: 30, waterReserves: -3 },
            delay: 0,
            duration: 6,
            label: 'Incêndios sem combate federal',
          },
        ],
        headline: 'Fumaça das queimadas encobre capitais e governadores cobram ajuda federal',
      },
    ],
  },
  {
    id: 'credito-rural-verde',
    ministry: 'meio-ambiente',
    title: 'Crédito rural e clima',
    context:
      'No novo Plano Safra, o Meio Ambiente quer usar o crédito rural contra o desmatamento e para recuperar 28 milhões de hectares de pasto degradado.',
    repeatable: true,
    cooldown: 12,
    months: [5, 6, 7],
    options: [
      {
        id: 'condicionar-credito-car',
        label: 'Negar crédito a quem desmata',
        description:
          'Medida eficaz e bem vista no exterior, mas o agro e os ruralistas reagem.',
        impact: {
          ideologySocial: -4,
          congressSupport: -1,
          sectors: { environmentalists: 6, agribusiness: -6 },
          relations: { 'uniao-europeia': 2 },
        },
        delayed: [
          {
            impact: { deforestation: -600, co2Emissions: -20 },
            delay: 2,
            duration: 12,
            label: 'Crédito rural condicionado',
          },
        ],
        headline: 'Conselho Monetário veta crédito rural a propriedades com desmatamento ilegal',
      },
      {
        id: 'recuperacao-pastagens',
        label: 'Juros subsidiados para recuperar pastagens',
        description:
          'Agrada o agro e poupa a floresta, mas custa caro ao Tesouro.',
        impact: { debt: 0.2, sectors: { agribusiness: 5, environmentalists: 2, market: -2 } },
        delayed: [
          {
            impact: { co2Emissions: -15, potentialGrowth: 0.02, tradeBalance: 1 },
            delay: 3,
            duration: 18,
            label: 'Recuperação de pastagens degradadas',
          },
        ],
        headline: 'Governo lança linha bilionária para recuperar pastagens degradadas',
      },
      {
        id: 'manter-credito-rural',
        label: 'Manter as regras atuais do crédito rural',
        description:
          'Evita conflito com produtores, mas a Europa endurece as exigências.',
        impact: {
          ideologySocial: 2,
          prestige: -1,
          sectors: { agribusiness: 2, environmentalists: -4 },
          relations: { 'uniao-europeia': -2 },
        },
        delayed: [
          { impact: { tradeBalance: -0.5 }, delay: 3, duration: 12, label: 'Restrições europeias ao agro' },
        ],
        headline: 'Plano Safra sai sem exigências ambientais e ambientalistas criticam o governo',
      },
    ],
  },
  {
    id: 'mineracao-terras-indigenas',
    ministry: 'meio-ambiente',
    title: 'Mineração em terras indígenas',
    context:
      'O Congresso pode liberar a mineração em terras indígenas. Mineradoras apoiam; indígenas dizem que a proposta legaliza o garimpo.',
    minTurn: 4,
    options: [
      {
        id: 'aprovar-mineracao-ti',
        label: 'Apoiar a liberação ampla da mineração',
        description:
          'Atrai investimentos e agrada o Congresso, mas acelera o desmatamento.',
        impact: {
          ideologyEconomic: 4, ideologySocial: 5,
          congressSupport: 2,
          prestige: -3,
          sectors: { business: 4, agribusiness: 3, military: 2, environmentalists: -10 },
          relations: { 'uniao-europeia': -4 },
        },
        delayed: [
          {
            impact: { foreignInvestment: 2, tradeBalance: 2 },
            delay: 6,
            duration: 24,
            label: 'Mineração em terras indígenas',
          },
          {
            impact: { deforestation: 600, co2Emissions: 15 },
            delay: 3,
            duration: 24,
            label: 'Avanço da mineração sobre a floresta',
          },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -1, sectors: { business: -2 } },
        headline: 'Câmara aprova mineração em terras indígenas e lideranças anunciam ação no STF',
        failureHeadline: 'Projeto da mineração em terras indígenas é derrotado após pressão internacional',
        flags: ['flexibilizacao-ambiental'],
      },
      {
        id: 'rastreabilidade-ouro',
        label: 'Manter a proibição e rastrear o ouro',
        description:
          'Asfixia o garimpo ilegal, mas mineradoras protestam e a base se divide.',
        impact: {
          ideologySocial: -3,
          congressSupport: -1,
          prestige: 1,
          sectors: { environmentalists: 5, business: -2, agribusiness: -1 },
        },
        delayed: [
          { impact: { deforestation: -200, co2Emissions: -5 }, delay: 2, duration: 12, label: 'Rastreabilidade do ouro' },
        ],
        headline: 'Governo cria nota fiscal eletrônica do ouro para asfixiar o garimpo ilegal',
      },
      {
        id: 'mineracao-consulta-previa',
        label: 'Liberar só com aval das comunidades',
        description:
          'Meio-termo que não agrada ninguém e depende de votação incerta.',
        impact: { sectors: { business: 2, environmentalists: -2 } },
        delayed: [
          {
            impact: { foreignInvestment: 1, poverty: -0.1 },
            delay: 6,
            duration: 24,
            label: 'Mineração com aval indígena',
          },
          { impact: { deforestation: 150 }, delay: 3, duration: 24, label: 'Novas frentes de mineração' },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -1 },
        headline: 'Congresso aprova mineração em terras indígenas com aval das comunidades',
        failureHeadline: 'Ruralistas e ambientalistas derrubam acordo sobre mineração em terras indígenas',
      },
    ],
  },
  {
    id: 'residuos-solidos-lixoes',
    ministry: 'meio-ambiente',
    title: 'Fim dos lixões',
    context:
      'O prazo para acabar com os lixões venceu em 2024, mas muitas cidades ainda os usam. Prefeitos dizem não ter dinheiro para aterros.',
    repeatable: true,
    cooldown: 12,
    options: [
      {
        id: 'programa-aterros-reciclagem',
        label: 'Financiar aterros e reciclagem com catadores',
        description:
          'Reduz a poluição e melhora a saúde, mas custa caro e demora.',
        impact: { ideologyEconomic: -2, debt: 0.2, sectors: { environmentalists: 4, lowerClass: 1, market: -1 } },
        delayed: [
          {
            impact: { sanitation: 0.8, co2Emissions: -10, healthCoverage: 0.2 },
            delay: 3,
            duration: 18,
            label: 'Fechamento de lixões',
          },
        ],
        headline: 'Governo lança programa bilionário para acabar com lixões e apoiar catadores',
      },
      {
        id: 'prorrogar-prazo-lixoes',
        label: 'Prorrogar o prazo dos lixões',
        description:
          'Agrada prefeitos sem custo, mas a poluição do ar e dos rios continua.',
        impact: { congressSupport: 2, sectors: { environmentalists: -5, lowerClass: -1 } },
        delayed: [
          {
            impact: { co2Emissions: 8, waterReserves: -2, healthCoverage: -0.3 },
            delay: 2,
            duration: 12,
            label: 'Lixões em operação',
          },
        ],
        headline: 'Governo adia de novo o fim dos lixões e Ministério Público fala em crime ambiental',
      },
      {
        id: 'concessoes-residuos',
        label: 'Conceder o lixo a empresas, com taxa',
        description:
          'Atrai empresas, mas a nova taxa do lixo pesa no bolso das famílias.',
        impact: { ideologyEconomic: 4, sectors: { business: 4, market: 2, middleClass: -3, lowerClass: -2 } },
        delayed: [
          {
            impact: { sanitation: 0.6, co2Emissions: -8 },
            delay: 6,
            duration: 24,
            label: 'Concessões regionais de resíduos',
          },
        ],
        headline: 'Leilão de blocos regionais de resíduos atrai operadores; taxa do lixo gera queixas',
      },
    ],
  },
  {
    id: 'moratoria-soja',
    ministry: 'meio-ambiente',
    title: 'Moratória da Soja',
    context:
      'Desde 2006, exportadoras não compram soja de áreas desmatadas na Amazônia. Produtores querem derrubar o pacto; a Europa exige mantê-lo.',
    minTurn: 24,
    options: [
      {
        id: 'ampliar-moratoria-cerrado',
        label: 'Defender o pacto e ampliá-lo ao Cerrado',
        description: 'Protege florestas e o mercado europeu, mas o agro reage com força.',
        impact: {
          ideologySocial: -4,
          congressSupport: -2,
          prestige: 2,
          sectors: { environmentalists: 7, agribusiness: -7 },
          relations: { 'uniao-europeia': 4 },
        },
        delayed: [
          {
            impact: { deforestation: -700, co2Emissions: -25 },
            delay: 3,
            duration: 18,
            label: 'Moratória da Soja no Cerrado',
          },
        ],
        headline: 'Governo defende Moratória da Soja e propõe estendê-la ao Cerrado',
      },
      {
        id: 'moratoria-so-amazonia',
        label: 'Manter o pacto só na Amazônia',
        description: 'Evita a ruptura, mas o desmatamento migra para o Cerrado.',
        impact: { sectors: { environmentalists: 1, agribusiness: -1 } },
        delayed: [{ impact: { deforestation: 300 }, delay: 3, duration: 18, label: 'Desmatamento migra para o Cerrado' }],
        headline: 'Moratória da Soja segue restrita à Amazônia e Cerrado perde mata nativa',
      },
      {
        id: 'fim-moratoria-soja',
        label: 'Apoiar o fim do pacto',
        description: 'Agrada produtores e o Congresso, mas o desmatamento sobe e a Europa reage.',
        impact: {
          ideologyEconomic: 2, ideologySocial: 4,
          congressSupport: 2,
          prestige: -2,
          sectors: { agribusiness: 7, environmentalists: -7 },
          relations: { 'uniao-europeia': -4 },
        },
        delayed: [
          { impact: { deforestation: 800, co2Emissions: 25 }, delay: 2, duration: 18, label: 'Fim da Moratória da Soja' },
          { impact: { tradeBalance: -1 }, delay: 6, duration: 12, label: 'Barreiras europeias à soja' },
        ],
        headline: 'Governo apoia fim da Moratória da Soja e ambientalistas denunciam retrocesso',
        flags: ['flexibilizacao-ambiental'],
      },
    ],
  },
  {
    id: 'agrotoxicos-registro',
    ministry: 'meio-ambiente',
    title: 'Registro de agrotóxicos',
    context:
      'O Brasil é campeão no uso de agrotóxicos e vende produtos proibidos na Europa. O agro quer liberar novos registros mais rápido.',
    minTurn: 42,
    options: [
      {
        id: 'acelerar-registros',
        label: 'Acelerar a liberação de novos produtos',
        description: 'Barateia a produção e agrada o agro, mas cresce o risco à saúde.',
        impact: {
          ideologyEconomic: 3, ideologySocial: 2,
          congressSupport: 1,
          sectors: { agribusiness: 7, environmentalists: -7, middleClass: -1 },
          relations: { 'uniao-europeia': -2 },
        },
        delayed: [
          { impact: { tradeBalance: 1 }, delay: 3, duration: 12, label: 'Lavouras com insumos mais baratos' },
          { impact: { healthCoverage: -0.4 }, delay: 6, duration: 18, label: 'Intoxicações por agrotóxicos' },
        ],
        headline: 'Governo acelera registro de agrotóxicos e libera dezenas de novos produtos',
      },
      {
        id: 'banir-proibidos-europa',
        label: 'Banir produtos já proibidos na Europa',
        description: 'Protege a saúde e abre mercados, mas encarece a lavoura no curto prazo.',
        impact: {
          ideologySocial: -4,
          inflation: 0.1,
          sectors: { environmentalists: 6, agribusiness: -6, middleClass: 1 },
          relations: { 'uniao-europeia': 3 },
        },
        delayed: [
          {
            impact: { healthCoverage: 0.5, tradeBalance: 0.5 },
            delay: 6,
            duration: 18,
            label: 'Agricultura com menos veneno',
          },
        ],
        headline: 'Governo proíbe agrotóxicos banidos na Europa e agro fala em perda de produtividade',
      },
      {
        id: 'credito-bioinsumos',
        label: 'Financiar alternativas biológicas no campo',
        description: 'Reduz o uso de veneno sem proibir nada, mas custa e o efeito é lento.',
        impact: { debt: 0.1, sectors: { agribusiness: 2, environmentalists: 2, market: -1 } },
        delayed: [
          { impact: { healthCoverage: 0.3, co2Emissions: -5 }, delay: 6, duration: 24, label: 'Bioinsumos no campo' },
        ],
        headline: 'Governo lança crédito para bioinsumos e mira redução de agrotóxicos',
      },
    ],
  },
  {
    id: 'confisco-terras-griladas',
    ministry: 'meio-ambiente',
    title: 'Confisco de terras griladas',
    context:
      'Ambientalistas e sem-terra pedem desmatamento zero imediato e o confisco de terras griladas na Amazônia para reforma agrária e reservas.',
    conditions: [{ kind: 'indicator', indicator: 'ideologyEconomic', comparator: 'lte', value: -40 }],
    weight: 2,
    minTurn: 5,
    options: [
      {
        id: 'confiscar-terras-griladas',
        label: 'Desmatamento zero já e confisco de griladas',
        description: 'Freia a destruição e redistribui terras, mas o agro declara guerra.',
        impact: {
          ideologyEconomic: -12,
          ideologySocial: -4,
          congressSupport: -5,
          prestige: 4,
          sectors: { environmentalists: 12, lowerClass: 4, agribusiness: -14, business: -5, market: -6 },
          relations: { 'uniao-europeia': 5 },
        },
        delayed: [
          { impact: { deforestation: -1800, co2Emissions: -60 }, delay: 2, duration: 18, label: 'Desmatamento zero na Amazônia' },
          { impact: { tradeBalance: -2 }, delay: 2, duration: 12, label: 'Produção rural em xeque' },
        ],
        legislative: 'pec',
        failureImpact: { congressSupport: -3, sectors: { environmentalists: -3, agribusiness: -3 } },
        headline: 'Congresso aprova confisco de terras griladas e desmatamento zero imediato',
        failureHeadline: 'Bancada ruralista derruba emenda do confisco de terras griladas',
        flags: ['fiscalizacao-amazonia-reforcada'],
        risk: {
          chance: 0.3,
          impact: { approval: -1, securityTrust: -3, sectors: { agribusiness: -4, lowerClass: -2 } },
          headline: 'Conflitos por terra explodem no Pará após o início dos confiscos',
        },
      },
      {
        id: 'retomar-terras-publicas',
        label: 'Retomar só terras públicas griladas',
        description: 'Ataca a grilagem em áreas da União, com resistência menor do agro.',
        impact: { ideologyEconomic: -5, sectors: { environmentalists: 5, agribusiness: -5 } },
        delayed: [
          { impact: { deforestation: -600, co2Emissions: -20 }, delay: 2, duration: 18, label: 'Retomada de terras públicas' },
        ],
        headline: 'Governo retoma milhões de hectares de terras públicas griladas na Amazônia',
      },
      {
        id: 'manter-politica-ambiental',
        label: 'Manter a política atual',
        description: 'Evita guerra com o agro, mas ambientalistas acusam o governo de recuar.',
        impact: { ideologyEconomic: 2, sectors: { environmentalists: -5, agribusiness: 2 } },
        headline: 'Planalto descarta confisco de terras e ambientalistas falam em recuo',
      },
    ],
  },
  {
    id: 'saida-acordo-paris',
    ministry: 'meio-ambiente',
    title: 'Saída do Acordo de Paris',
    context:
      'Aliados querem tirar o Brasil do Acordo de Paris e abrir parques e reservas à mineração e ao agro, em nome da soberania e do desenvolvimento.',
    conditions: [{ kind: 'indicator', indicator: 'ideologySocial', comparator: 'gte', value: 40 }],
    weight: 2,
    minTurn: 5,
    options: [
      {
        id: 'sair-paris-abrir-reservas',
        label: 'Sair de Paris e abrir áreas protegidas',
        description: 'Atrai mineradoras e agrada o agro, mas a Europa ameaça sanções.',
        impact: {
          ideologySocial: 10,
          ideologyEconomic: 5,
          prestige: -6,
          sectors: { agribusiness: 10, military: 6, business: 4, middleClass: -2, environmentalists: -14 },
          relations: { 'uniao-europeia': -10, china: -2 },
        },
        delayed: [
          { impact: { deforestation: 1800, co2Emissions: 70 }, delay: 2, duration: 18, label: 'Avanço sobre áreas protegidas' },
          { impact: { foreignInvestment: 2, tradeBalance: 2 }, delay: 6, duration: 18, label: 'Mineração em áreas protegidas' },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -2, prestige: -2, sectors: { agribusiness: -3 } },
        headline: 'Brasil deixa o Acordo de Paris e Congresso abre reservas à mineração',
        failureHeadline: 'Congresso barra abertura de reservas e saída de Paris vira só discurso',
        flags: ['flexibilizacao-ambiental'],
        risk: {
          chance: 0.35,
          impact: { tradeBalance: -4, foreignInvestment: -3, sectors: { agribusiness: -5, business: -2 } },
          headline: 'União Europeia congela acordo com o Mercosul e barra carne brasileira',
        },
      },
      {
        id: 'licencas-rapidas-sem-sair',
        label: 'Ficar em Paris e acelerar licenças',
        description: 'Destrava obras sem romper com o mundo, mas agrada menos a base.',
        impact: { ideologySocial: 4, ideologyEconomic: 3, sectors: { agribusiness: 4, business: 3, environmentalists: -5 } },
        delayed: [
          { impact: { deforestation: 400, co2Emissions: 15 }, delay: 2, duration: 18, label: 'Licenças aceleradas' },
        ],
        headline: 'Governo mantém Acordo de Paris, mas acelera licenças para mineração e agro',
      },
      {
        id: 'manter-compromissos-clima',
        label: 'Manter os compromissos climáticos',
        description: 'Preserva mercados e prestígio, mas a base acusa o governo de ceder.',
        impact: { ideologySocial: -3, prestige: 1, sectors: { agribusiness: -3, military: -2, environmentalists: 3 } },
        headline: 'Planalto descarta deixar Acordo de Paris e base ruralista protesta',
      },
    ],
  },
];
