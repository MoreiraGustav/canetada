import type { Decision } from '@/types';

/** Ministério das Relações Exteriores: acordos comerciais, alinhamentos, BRICS, conflitos e cooperação Sul-Sul. */
export const RELACOES_EXTERIORES_DECISIONS: Decision[] = [
  {
    id: 'ratificacao-mercosul-ue',
    ministry: 'relacoes-exteriores',
    title: 'Acordo Mercosul-União Europeia',
    context:
      'O acordo Mercosul-UE, negociado por 25 anos, aguarda o Congresso. O agro quer o mercado europeu; a indústria teme a concorrência.',
    minTurn: 3,
    weight: 1.5,
    options: [
      {
        id: 'ratificar-acordo',
        label: 'Ratificar o acordo agora',
        description: 'Abre mercados e atrai investimento, mas expõe a indústria aos europeus.',
        impact: {
          ideologyEconomic: 3,
          prestige: 4,
          sectors: { agribusiness: 6, market: 5, business: -3 },
          relations: { 'uniao-europeia': 10, argentina: 3 },
        },
        delayed: [
          {
            impact: { tradeBalance: 5, foreignInvestment: 4, potentialGrowth: 0.08 },
            delay: 6,
            duration: 24,
            label: 'Acordo Mercosul-UE em vigor',
          },
          {
            impact: { unemployment: 0.1 },
            delay: 6,
            duration: 12,
            label: 'Indústria se ajusta à concorrência',
          },
        ],
        legislative: 'ordinary',
        failureImpact: { prestige: -2, sectors: { agribusiness: -3 }, relations: { 'uniao-europeia': -5 } },
        headline: 'Congresso ratifica acordo Mercosul-UE e cria grande área de livre comércio',
        failureHeadline: 'Câmara rejeita acordo Mercosul-UE e Bruxelas fala em "oportunidade perdida"',
        flags: ['acordo-mercosul-ue-assinado'],
      },
      {
        id: 'exigir-salvaguardas',
        label: 'Exigir proteções para a indústria',
        description: 'Protege a indústria, mas atrasa o acordo e frustra o agro e os europeus.',
        impact: {
          ideologyEconomic: -2,
          prestige: -1,
          sectors: { business: 4, agribusiness: -3 },
          relations: { 'uniao-europeia': -3, argentina: -2 },
        },
        headline: 'Brasil condiciona acordo com a UE a proteções para a indústria',
      },
      {
        id: 'rejeitar-anexo-ambiental',
        label: 'Rejeitar as exigências ambientais',
        description: 'Agrada militares e indústria, mas isola o país e enterra o acordo.',
        impact: {
          ideologySocial: 3,
          prestige: -3,
          sectors: { military: 2, business: 2, environmentalists: -4, agribusiness: -2 },
          relations: { 'uniao-europeia': -8 },
        },
        headline: 'Governo rejeita exigências ambientais da UE e acordo volta à estaca zero',
      },
    ],
  },
  {
    id: 'alinhamento-eua-china',
    ministry: 'relacoes-exteriores',
    title: 'Disputa entre Estados Unidos e China',
    context:
      'Os EUA querem um acordo de terras raras e menos tecnologia chinesa. A China, maior compradora do Brasil, oferece crédito para obras.',
    minTurn: 4,
    weight: 1.5,
    conditions: [
      { kind: 'flag', flag: 'alinhamento-eua', present: false },
      { kind: 'flag', flag: 'alinhamento-china', present: false },
    ],
    options: [
      {
        id: 'alinhar-eua',
        label: 'Fechar acordo de minerais com os EUA',
        description: 'Atrai investimento americano, mas a China retalia e o agro teme perdas.',
        impact: {
          ideologyEconomic: 4, ideologySocial: 3,
          sectors: { market: 4, military: 3, agribusiness: -4 },
          relations: { eua: 10, china: -8, russia: -3 },
        },
        delayed: [
          { impact: { foreignInvestment: 4 }, delay: 3, duration: 12, label: 'Investimento americano em minerais' },
          { impact: { tradeBalance: -4 }, delay: 3, duration: 12, label: 'Retaliação comercial chinesa' },
        ],
        headline: 'Brasil fecha acordo de terras raras com os EUA e China ameaça cortar soja',
        flags: ['alinhamento-eua'],
      },
      {
        id: 'alinhar-china',
        label: 'Aderir à Nova Rota da Seda',
        description: 'Traz dinheiro chinês para portos e ferrovias, mas irrita Washington.',
        impact: {
          ideologyEconomic: -3,
          sectors: { agribusiness: 4, business: 2, market: -4, military: -3 },
          relations: { china: 10, eua: -8, russia: 2 },
        },
        delayed: [
          {
            impact: { foreignInvestment: 5, tradeBalance: 3, infrastructureKm: 300 },
            delay: 6,
            duration: 24,
            label: 'Projetos da Nova Rota da Seda',
          },
        ],
        headline: 'Brasil adere à Nova Rota da Seda e Casa Branca promete "rever a relação"',
        flags: ['alinhamento-china'],
      },
      {
        id: 'equidistancia-pragmatica',
        label: 'Não escolher lado',
        description: 'Preserva o comércio com ambos, mas nenhuma potência oferece vantagens.',
        impact: { prestige: 1, sectors: { market: -1 }, relations: { eua: -2, china: -2 } },
        headline: 'Itamaraty se recusa a escolher lado entre EUA e China',
      },
    ],
  },
  {
    id: 'brics-moedas-locais',
    ministry: 'relacoes-exteriores',
    title: 'Comércio em moedas locais no BRICS',
    context:
      'No BRICS, Rússia e China querem pagamentos sem o dólar. Os EUA ameaçam com tarifas quem tentar substituir a moeda americana.',
    minTurn: 2,
    options: [
      {
        id: 'defender-unidade-comum',
        label: 'Defender uma moeda comum do BRICS',
        description: 'Agrada Moscou e Pequim, mas o real cai e Washington ameaça retaliar.',
        impact: {
          ideologyEconomic: -5,
          exchangeRate: 0.2,
          prestige: 1,
          sectors: { market: -6, business: -2 },
          relations: { china: 5, russia: 6, india: 2, eua: -10 },
        },
        delayed: [{ impact: { tradeBalance: -4 }, delay: 2, duration: 12, label: 'Retaliação comercial americana' }],
        headline: 'Brasil defende moeda comum do BRICS e Washington ameaça sobretaxa',
        risk: {
          chance: 0.3,
          impact: { prestige: -2, relations: { india: -3 } },
          headline: 'Índia rejeita moeda comum e proposta brasileira fica isolada no BRICS',
        },
      },
      {
        id: 'moedas-locais-bilateral',
        label: 'Usar moedas locais com parceiros',
        description: 'Barateia o comércio com China e Argentina, com leve atrito com os EUA.',
        impact: {
          ideologyEconomic: -2,
          sectors: { agribusiness: 2, market: -2 },
          relations: { china: 4, argentina: 3, eua: -3 },
        },
        delayed: [
          { impact: { tradeBalance: 2, exchangeRate: -0.05 }, delay: 3, duration: 12, label: 'Comércio em moedas locais' },
        ],
        headline: 'Brasil amplia comércio em moedas locais com China e Argentina',
      },
      {
        id: 'manter-dolar',
        label: 'Esfriar a pauta e manter o dólar',
        description: 'Acalma o mercado e os EUA, mas desagrada os sócios do BRICS.',
        impact: {
          ideologyEconomic: 2,
          prestige: -1,
          sectors: { market: 3 },
          relations: { eua: 4, china: -3, russia: -4 },
        },
        headline: 'Brasil rejeita moeda comum e diz que BRICS não é bloco antiocidental',
      },
    ],
  },
  {
    id: 'posicao-conflitos-onu',
    ministry: 'relacoes-exteriores',
    title: 'Discurso na Assembleia Geral da ONU',
    context:
      'O Brasil abre a Assembleia da ONU, com as guerras na Ucrânia e no Oriente Médio em pauta. A Rússia fornece fertilizantes ao agro.',
    repeatable: true,
    cooldown: 11,
    months: [9],
    options: [
      {
        id: 'condenar-russia',
        label: 'Condenar a invasão russa',
        description: 'Aproxima o país do Ocidente, mas Moscou pode cortar os fertilizantes.',
        impact: {
          sectors: { market: 2, agribusiness: -4 },
          relations: { eua: 5, 'uniao-europeia': 6, russia: -10, china: -3, india: -2 },
        },
        delayed: [
          { impact: { inflation: 0.1, tradeBalance: -1 }, delay: 1, duration: 8, label: 'Fertilizantes mais caros' },
        ],
        headline: 'Na ONU, presidente condena a Rússia e Moscou ameaça cortar fertilizantes',
      },
      {
        id: 'mediacao-paz',
        label: 'Propor plano de paz com China e Índia',
        description: 'Reforça a imagem de mediador, mas EUA e Europa veem favor a Moscou.',
        impact: {
          prestige: 3,
          relations: { china: 4, india: 3, russia: 2, eua: -3, 'uniao-europeia': -3 },
        },
        headline: 'Brasil propõe plano de paz com China e Índia e é criticado pelo Ocidente',
        risk: {
          chance: 0.3,
          impact: { prestige: -2, relations: { 'uniao-europeia': -2, eua: -2 } },
          headline: 'Moscou e Kiev ignoram plano de paz e proposta brasileira perde força',
        },
      },
      {
        id: 'condenar-ofensiva-gaza',
        label: 'Liderar a condenação da ofensiva em Gaza',
        description: 'Agrada árabes e africanos, mas abre crise com os EUA e divide religiosos.',
        impact: {
          ideologyEconomic: -2, ideologySocial: -3,
          prestige: 2,
          sectors: { middleClass: -2, environmentalists: 2 },
          relations: { africa: 5, eua: -6, 'uniao-europeia': -1 },
        },
        headline: 'Presidente faz duras críticas à ofensiva em Gaza na ONU e EUA convocam embaixador',
      },
      {
        id: 'neutralidade-comercial',
        label: 'Manter neutralidade e priorizar o comércio',
        description: 'Preserva fertilizantes e mercados, mas o país perde relevância.',
        impact: {
          prestige: -3,
          sectors: { agribusiness: 3 },
          relations: { russia: 3, eua: -2, 'uniao-europeia': -3 },
        },
        headline: 'Discurso cauteloso na ONU é visto como omissão por diplomatas',
      },
    ],
  },
  {
    id: 'crise-migratoria-venezuela',
    ministry: 'relacoes-exteriores',
    title: 'Migrantes na fronteira com a Venezuela',
    context:
      'A crise em Caracas multiplicou a chegada de venezuelanos a Roraima. Os abrigos estão lotados e o governo estadual pede fechar a fronteira.',
    minTurn: 5,
    weight: 0.8,
    options: [
      {
        id: 'ampliar-acolhida',
        label: 'Ampliar abrigos e redistribuir migrantes',
        description: 'Elogiado pela ONU, mas caro e com resistência nos estados que recebem.',
        impact: {
          ideologySocial: -3,
          debt: 0.1,
          prestige: 3,
          sectors: { military: 2, environmentalists: 2, lowerClass: -1 },
          relations: { eua: 2, 'uniao-europeia': 2 },
        },
        delayed: [
          { impact: { unemployment: -0.05 }, delay: 3, duration: 12, label: 'Migrantes empregados em outros estados' },
        ],
        headline: 'Governo amplia acolhida a venezuelanos e ONU elogia resposta brasileira',
      },
      {
        id: 'restringir-fronteira',
        label: 'Restringir a entrada e reforçar a fronteira',
        description: 'Atende à pressão local, mas viola regras de refúgio e gera críticas.',
        impact: {
          ideologySocial: 5,
          approval: 1,
          prestige: -4,
          sectors: { military: 4, middleClass: 2, environmentalists: -4 },
          relations: { 'uniao-europeia': -3 },
        },
        headline: 'Brasil restringe entrada de venezuelanos em Roraima e ONU se preocupa',
      },
      {
        id: 'mediar-caracas',
        label: 'Mediar o diálogo político em Caracas',
        description: 'Ataca a causa, mas soa como apoio ao regime e não alivia Roraima.',
        impact: {
          ideologyEconomic: -3,
          prestige: 2,
          sectors: { middleClass: -3, market: -2 },
          relations: { russia: 2, china: 1, eua: -3 },
        },
        delayed: [{ impact: { healthCoverage: -0.3 }, delay: 0, duration: 6, label: 'Rede de saúde de Roraima sobrecarregada' }],
        headline: 'Itamaraty lança mediação na Venezuela e oposição acusa governo de proteger Maduro',
      },
    ],
  },
  {
    id: 'cooperacao-sul-sul-africa',
    ministry: 'relacoes-exteriores',
    title: 'África e vaga no Conselho da ONU',
    context:
      'O Brasil quer um assento permanente no Conselho de Segurança da ONU. O apoio dos países africanos é decisivo para essa campanha.',
    minTurn: 3,
    options: [
      {
        id: 'ofensiva-africa',
        label: 'Investir em parcerias com a África',
        description: 'Ganha aliados e mercados, mas é criticado como gasto no exterior.',
        impact: {
          ideologyEconomic: -2,
          debt: 0.1,
          prestige: 3,
          sectors: { market: -2, middleClass: -2 },
          relations: { africa: 10, india: 2 },
        },
        delayed: [
          { impact: { tradeBalance: 2, prestige: 2 }, delay: 6, duration: 24, label: 'Parcerias com a África' },
        ],
        headline: 'Brasil abre embaixadas na África e renegocia dívidas de países do continente',
      },
      {
        id: 'campanha-csnu-g4',
        label: 'Liderar campanha pela reforma da ONU',
        description: 'Aproxima Índia e Europa, mas a China resiste e o resultado é incerto.',
        impact: {
          prestige: 2,
          relations: { india: 5, 'uniao-europeia': 3, africa: 2, china: -4 },
        },
        delayed: [{ impact: { prestige: 3 }, delay: 6, duration: 18, label: 'Campanha pela reforma da ONU' }],
        headline: 'Brasil lidera ofensiva por reforma do Conselho de Segurança e China reage',
      },
      {
        id: 'foco-grandes-mercados',
        label: 'Priorizar acordos com grandes mercados',
        description: 'Agrada empresários, mas afasta a África e enfraquece a candidatura.',
        impact: {
          ideologyEconomic: 2,
          prestige: -2,
          sectors: { business: 2, market: 2 },
          relations: { africa: -4, india: -2, eua: 2 },
        },
        headline: 'Itamaraty reduz presença na África e prioriza agenda comercial com países ricos',
      },
    ],
  },
  {
    id: 'cupula-mercosul',
    ministry: 'relacoes-exteriores',
    title: 'Cúpula de presidentes do Mercosul',
    context:
      'Na cúpula do Mercosul, o Uruguai quer negociar acordos sozinho e a Argentina quer baixar a tarifa comum de importação do bloco.',
    repeatable: true,
    cooldown: 11,
    minTurn: 2,
    months: [7, 12],
    options: [
      {
        id: 'reduzir-tec',
        label: 'Propor corte na tarifa comum do Mercosul',
        description: 'Barateia máquinas e insumos importados, mas a indústria teme demissões.',
        impact: { ideologyEconomic: 4, inflation: -0.1, sectors: { market: 4, agribusiness: 2, business: -5 }, relations: { argentina: 4 } },
        delayed: [
          {
            impact: { potentialGrowth: 0.04, unemployment: 0.1 },
            delay: 6,
            duration: 18,
            label: 'Abertura comercial do Mercosul',
          },
        ],
        headline: 'Brasil propõe corte da tarifa do Mercosul e indústria teme perder empregos',
      },
      {
        id: 'integracao-fisica',
        label: 'Financiar estrada e gasoduto com vizinhos',
        description: 'Integra a região e traz gás argentino barato, mas usa dinheiro público.',
        impact: {
          ideologyEconomic: -2,
          debt: 0.2,
          prestige: 1,
          sectors: { business: 2, market: -3, middleClass: -2 },
          relations: { argentina: 6 },
        },
        delayed: [
          {
            impact: { tradeBalance: 2, infrastructureKm: 200, inflation: -0.1 },
            delay: 9,
            duration: 24,
            label: 'Integração física do Mercosul',
          },
        ],
        headline: 'Brasil financiará rodovia até o Pacífico e gasoduto com a Argentina',
      },
      {
        id: 'flexibilizar-bloco',
        label: 'Deixar sócios negociarem acordos sozinhos',
        description: 'Destrava acordos, mas enfraquece o bloco e irrita a Argentina.',
        impact: { ideologyEconomic: 3, prestige: -2, sectors: { agribusiness: 2, market: 2, business: -2 }, relations: { argentina: -2 } },
        delayed: [{ impact: { tradeBalance: -1 }, delay: 6, duration: 12, label: 'Perda de preferências no Mercosul' }],
        headline: 'Mercosul flexibiliza regras e sócios poderão negociar acordos por conta própria',
      },
    ],
  },
  {
    id: 'repatriacao-brasileiros',
    ministry: 'relacoes-exteriores',
    title: 'Brasileiros retidos em zona de conflito',
    context:
      'Uma guerra no Oriente Médio deixou mais de 3 mil brasileiros sem saída. Os aeroportos estão fechados e as famílias pedem resgate.',
    repeatable: true,
    cooldown: 14,
    minTurn: 3,
    options: [
      {
        id: 'operacao-fab',
        label: 'Resgatar com aviões da Força Aérea',
        description: 'Rápido e popular, mas caro, arriscado e dependente de acordos delicados.',
        impact: {
          approval: 1,
          debt: 0.03,
          prestige: 2,
          sectors: { military: 3, middleClass: 2, lowerClass: 1, market: -1 },
          relations: { eua: -1 },
        },
        headline: 'Aviões da FAB resgatam brasileiros em zona de guerra e pousam sob aplausos',
      },
      {
        id: 'voos-fretados-vizinhos',
        label: 'Fretar voos a partir de países vizinhos',
        description: 'Custa menos, mas exige chegar à fronteira e gera críticas das famílias.',
        impact: { approval: -1, sectors: { middleClass: -3, lowerClass: -1, market: 1 } },
        headline: 'Itamaraty fretará voos a partir da Jordânia e do Egito; famílias criticam demora',
      },
      {
        id: 'mediacao-cessar-fogo',
        label: 'Priorizar um cessar-fogo na ONU',
        description: 'Reforça a imagem de mediador, mas o resgate atrasa e a oposição critica.',
        impact: {
          prestige: 3,
          approval: -1,
          sectors: { middleClass: -3, environmentalists: 3 },
          relations: { africa: 2, china: 2, eua: -3 },
        },
        headline: 'Brasil propõe cessar-fogo na ONU enquanto brasileiros aguardam resgate',
      },
    ],
  },
  {
    id: 'acordo-comercial-bilateral',
    ministry: 'relacoes-exteriores',
    title: 'Negociação comercial fora do Mercosul',
    context:
      'O Brasil negocia acordos com Índia, Canadá e Emirados Árabes. O agro quer novos mercados; a indústria teme a concorrência.',
    repeatable: true,
    cooldown: 12,
    minTurn: 4,
    options: [
      {
        id: 'acordo-amplo',
        label: 'Fechar acordo amplo de livre comércio',
        description: 'Abre mercados ao agro, mas expõe a indústria e depende do Congresso.',
        impact: {
          ideologyEconomic: 3,
          prestige: 1,
          sectors: { agribusiness: 5, market: 3, business: -5, lowerClass: -1 },
          relations: { india: 5 },
        },
        delayed: [
          {
            impact: { tradeBalance: 3, foreignInvestment: 2, potentialGrowth: 0.04 },
            delay: 6,
            duration: 24,
            label: 'Novo acordo comercial em vigor',
          },
          { impact: { unemployment: 0.1 }, delay: 6, duration: 12, label: 'Indústria se ajusta às importações' },
        ],
        legislative: 'ordinary',
        failureImpact: { prestige: -1, sectors: { agribusiness: -2 }, relations: { india: -3 } },
        headline: 'Congresso aprova acordo comercial e agro comemora acesso a novos mercados',
        failureHeadline: 'Pressão da indústria trava aprovação de acordo comercial no Congresso',
      },
      {
        id: 'acordo-setorial',
        label: 'Fechar acordo só para alguns produtos',
        description: 'Pouca resistência, mas ganhos modestos frustram exportadores.',
        impact: { sectors: { agribusiness: -1, business: 1 }, relations: { india: 2 } },
        delayed: [{ impact: { tradeBalance: 1 }, delay: 4, duration: 12, label: 'Tarifas menores para alguns produtos' }],
        headline: 'Brasil fecha acordo comercial restrito a uma lista de produtos',
      },
      {
        id: 'suspender-negociacao',
        label: 'Suspender a rodada para proteger a indústria',
        description: 'Agrada indústria e sindicatos, mas o agro perde mercados.',
        impact: {
          ideologyEconomic: -3,
          prestige: -2,
          sectors: { business: 4, lowerClass: 1, agribusiness: -5, market: -3 },
          relations: { india: -3 },
        },
        delayed: [{ impact: { tradeBalance: -1 }, delay: 3, duration: 12, label: 'Mercados perdidos para concorrentes' }],
        headline: 'Itamaraty suspende negociação comercial após pressão da indústria; agro reage',
      },
    ],
  },
  {
    id: 'tarifa-itaipu-paraguai',
    ministry: 'relacoes-exteriores',
    title: 'Tarifa de Itaipu com o Paraguai',
    context:
      'A dívida da usina de Itaipu foi quitada e o Paraguai quer vender sua parte da energia mais caro. A tarifa pesa na conta de luz.',
    minTurn: 12,
    options: [
      {
        id: 'exigir-tarifa-baixa',
        label: 'Exigir tarifa baixa na renegociação',
        description: 'Alivia a conta de luz, mas azeda a relação com o vizinho.',
        impact: { inflation: -0.1, prestige: -2, sectors: { middleClass: 2, business: 2 }, relations: { argentina: -3 } },
        headline: 'Brasil endurece com o Paraguai e Itaipu terá tarifa menor',
      },
      {
        id: 'tarifa-alta-com-obras',
        label: 'Aceitar tarifa maior com obras no Paraguai',
        description: 'Fortalece a vizinhança, mas a conta de luz sobe para os brasileiros.',
        impact: { inflation: 0.1, prestige: 2, sectors: { middleClass: -2, business: -2 }, relations: { argentina: 3 } },
        delayed: [{ impact: { tradeBalance: 1 }, delay: 6, duration: 18, label: 'Integração com o Paraguai' }],
        headline: 'Acordo de Itaipu eleva tarifa e financia obras de integração com o Paraguai',
      },
      {
        id: 'comprar-energia-paraguaia',
        label: 'Comprar a energia que sobra ao Paraguai',
        description: 'Garante energia limpa por anos, mas exige subsídio do Tesouro.',
        impact: { primaryBalance: -0.05, prestige: 1, sectors: { environmentalists: 2, market: -2 } },
        delayed: [
          { impact: { renewableEnergy: 1, waterReserves: 2 }, delay: 3, duration: 12, label: 'Energia paraguaia de Itaipu' },
        ],
        headline: 'Brasil comprará energia excedente do Paraguai em Itaipu por dez anos',
      },
    ],
  },
  {
    id: 'tensao-venezuela-guiana',
    ministry: 'relacoes-exteriores',
    title: 'Tensão entre Venezuela e Guiana',
    context:
      'A Venezuela ameaça anexar parte da Guiana, e suas tropas só chegariam lá cruzando Roraima. Os EUA oferecem enviar militares à região.',
    minTurn: 24,
    options: [
      {
        id: 'reforcar-roraima-e-mediar',
        label: 'Reforçar tropas em Roraima e mediar',
        description: 'Impede a passagem e eleva o prestígio, mas custa caro ao orçamento.',
        impact: { debt: 0.1, prestige: 3, sectors: { military: 5, market: -1 }, relations: { russia: -2 } },
        headline: 'Exército reforça Roraima e Brasil chama Venezuela e Guiana para negociar',
      },
      {
        id: 'apoiar-presenca-americana',
        label: 'Apoiar a presença militar americana',
        description: 'Assusta Caracas sem custo, mas fere a tradição de autonomia regional.',
        impact: {
          ideologyEconomic: 3, ideologySocial: 2,
          prestige: -2,
          sectors: { market: 2, military: -3, environmentalists: -2 },
          relations: { eua: 6, russia: -5, china: -3 },
        },
        headline: 'Brasil apoia presença militar americana na Guiana e vizinhos criticam',
      },
      {
        id: 'neutralidade-na-crise',
        label: 'Manter neutralidade e só falar na ONU',
        description: 'Evita atrito com Caracas, mas o país parece omisso na própria região.',
        impact: { prestige: -3, sectors: { military: -2, middleClass: -1 }, relations: { russia: 2, eua: -3 } },
        delayed: [{ impact: { securityTrust: -1 }, delay: 1, duration: 6, label: 'Incerteza na fronteira norte' }],
        headline: 'Itamaraty evita tomar partido na crise entre Venezuela e Guiana',
      },
    ],
  },

  // ─── Agenda radical (só para governos já afastados do centro) ──────────
  {
    id: 'alianca-sul-global',
    ministry: 'relacoes-exteriores',
    title: 'Aliança estratégica do Sul Global',
    context:
      'Aliados propõem uma aliança com China, Rússia e governos de esquerda da região, com comércio fora do dólar e cooperação militar.',
    conditions: [{ kind: 'indicator', indicator: 'ideologyEconomic', comparator: 'lte', value: -40 }],
    weight: 2,
    minTurn: 5,
    options: [
      {
        id: 'firmar-alianca-sul-global',
        label: 'Firmar a aliança e abandonar o dólar',
        description: 'Atrai crédito chinês e russo, mas os EUA retaliam e o real despenca.',
        impact: {
          ideologyEconomic: -11,
          exchangeRate: 0.5,
          prestige: -1,
          sectors: { lowerClass: 8, environmentalists: 2, market: -12, business: -8, military: -8, agribusiness: -5 },
          relations: { china: 10, russia: 10, india: 3, eua: -12, 'uniao-europeia': -6 },
        },
        delayed: [
          { impact: { foreignInvestment: 5, infrastructureKm: 300 }, delay: 6, duration: 24, label: 'Crédito chinês e russo' },
          { impact: { tradeBalance: -6 }, delay: 2, duration: 12, label: 'Retaliação comercial americana' },
        ],
        headline: 'Brasil firma aliança com China e Rússia e anuncia comércio sem o dólar',
        flags: ['alinhamento-china'],
        risk: {
          chance: 0.3,
          impact: { exchangeRate: 0.3, inflation: 0.3, foreignInvestment: -4, sectors: { market: -4, agribusiness: -3 } },
          headline: 'EUA impõem sanções e tarifas pesadas sobre produtos brasileiros',
        },
      },
      {
        id: 'cooperacao-sul-limitada',
        label: 'Ampliar a cooperação sem romper com os EUA',
        description: 'Aproxima China e vizinhos com menos risco, mas a militância vê timidez.',
        impact: {
          ideologyEconomic: -4,
          sectors: { lowerClass: 2, market: -3 },
          relations: { china: 5, russia: 3, eua: -4 },
        },
        delayed: [{ impact: { tradeBalance: 1 }, delay: 3, duration: 12, label: 'Acordos com o Sul Global' }],
        headline: 'Brasil amplia acordos com China e vizinhos, mas evita romper com Washington',
      },
      {
        id: 'recusar-alianca-sul-global',
        label: 'Recusar a aliança e manter a autonomia',
        description: 'Preserva todas as parcerias, mas a base acusa o governo de ceder aos EUA.',
        impact: {
          ideologyEconomic: 2,
          sectors: { lowerClass: -3, market: 3 },
          relations: { china: -3, russia: -3, eua: 2 },
        },
        headline: 'Itamaraty rejeita aliança com China e Rússia e reafirma não alinhamento',
      },
    ],
  },
  {
    id: 'alinhamento-automatico-eua',
    ministry: 'relacoes-exteriores',
    title: 'Alinhamento automático com os EUA',
    context:
      'Aliados querem alinhar o país aos EUA: levar a embaixada em Israel para Jerusalém e deixar o BRICS. O agro teme perder a China.',
    conditions: [{ kind: 'indicator', indicator: 'ideologySocial', comparator: 'gte', value: 40 }],
    weight: 2,
    minTurn: 5,
    options: [
      {
        id: 'jerusalem-e-saida-brics',
        label: 'Mudar a embaixada e sair do BRICS',
        description: 'Garante o apoio de Washington, mas a China e o mundo árabe retaliam.',
        impact: {
          ideologyEconomic: 5,
          ideologySocial: 10,
          prestige: -3,
          sectors: { military: 8, middleClass: 4, market: 2, agribusiness: -10, environmentalists: -8, lowerClass: -2 },
          relations: { eua: 12, china: -12, russia: -10, india: -6, africa: -8, 'uniao-europeia': -3 },
        },
        delayed: [
          { impact: { tradeBalance: -6 }, delay: 2, duration: 18, label: 'Retaliação chinesa e árabe' },
          { impact: { foreignInvestment: 4 }, delay: 3, duration: 18, label: 'Investimento americano' },
        ],
        headline: 'Brasil leva embaixada a Jerusalém, deixa o BRICS e Pequim promete resposta',
        flags: ['alinhamento-eua'],
        risk: {
          chance: 0.3,
          impact: { tradeBalance: -3, sectors: { agribusiness: -5, business: -2 } },
          headline: 'Países árabes suspendem compras de frango brasileiro após mudança de embaixada',
        },
      },
      {
        id: 'acordo-preferencial-eua',
        label: 'Acordo preferencial com os EUA, sem rupturas',
        description: 'Aproxima Washington sem romper com a China, mas a base queria mais.',
        impact: {
          ideologyEconomic: 3,
          ideologySocial: 2,
          sectors: { market: 3, military: 2, agribusiness: -1 },
          relations: { eua: 6, china: -3 },
        },
        headline: 'Brasil e EUA assinam acordo de cooperação sem mexer no BRICS',
      },
      {
        id: 'manter-pragmatismo-externo',
        label: 'Manter o pragmatismo comercial',
        description: 'Preserva o comércio com a China, mas a militância vê traição.',
        impact: {
          ideologySocial: -2,
          prestige: 1,
          sectors: { agribusiness: 3, military: -4, middleClass: -2 },
          relations: { china: 2 },
        },
        headline: 'Planalto desiste de mudar embaixada e prioriza o comércio com a China',
      },
    ],
  },
];
