import type { Decision } from '@/types';

/** Ministério da Infraestrutura: obras públicas, ferrovias, concessões, saneamento, estatais e energia. */
export const INFRAESTRUTURA_DECISIONS: Decision[] = [
  {
    id: 'novo-pac',
    ministry: 'infraestrutura',
    title: 'Nova carteira do PAC',
    context:
      'Prefeitos e governadores cobram a retomada de milhares de obras paradas. A Casa Civil quer um novo PAC, mas há pouco espaço no orçamento.',
    minTurn: 2,
    weight: 1.5,
    options: [
      {
        id: 'pac-ampliado',
        label: 'Lançar um PAC amplo com dinheiro público',
        description:
          'Gera empregos e agrada prefeitos, mas pesa nas contas e na inflação.',
        impact: {
          ideologyEconomic: -3,
          primaryBalance: -0.2,
          gdpGrowth: 0.3,
          approval: 1,
          congressSupport: 2,
          sectors: { business: 5, lowerClass: 3, market: -5 },
        },
        delayed: [
          { impact: { unemployment: -0.3 }, delay: 1, duration: 12, label: 'Canteiros de obras do Novo PAC' },
          {
            impact: { infrastructureKm: 1500, potentialGrowth: 0.1 },
            delay: 3,
            duration: 24,
            label: 'Obras do Novo PAC',
          },
          { impact: { inflation: 0.2 }, delay: 2, duration: 10, label: 'Demanda aquecida pelas obras' },
        ],
        headline: 'Governo lança novo PAC com investimento bilionário e promete retomar obras paradas',
        flags: ['novo-pac-lancado'],
        risk: {
          chance: 0.3,
          impact: { debt: 0.3, approval: -1, sectors: { middleClass: -2 } },
          headline: 'TCU aponta sobrepreço e obras do PAC estouram o orçamento',
        },
      },
      {
        id: 'pac-obras-paradas',
        label: 'Só concluir as obras paradas',
        description:
          'Custa menos e arrisca menos, mas gera pouco emprego e popularidade.',
        impact: { primaryBalance: -0.05, sectors: { business: 2, market: -1 } },
        delayed: [
          {
            impact: { infrastructureKm: 500, potentialGrowth: 0.04 },
            delay: 2,
            duration: 18,
            label: 'Retomada de obras paradas',
          },
        ],
        headline: 'Novo PAC terá foco na conclusão de obras paralisadas, anuncia Casa Civil',
        flags: ['novo-pac-lancado'],
      },
      {
        id: 'pac-ppp',
        label: 'Fazer o PAC em parceria com empresas',
        description:
          'Alivia o orçamento e atrai investidores, mas as obras demoram mais.',
        impact: { ideologyEconomic: 3, congressSupport: -1, sectors: { market: 4, business: 3, lowerClass: -1 } },
        delayed: [
          {
            impact: { infrastructureKm: 700, foreignInvestment: 3, potentialGrowth: 0.06 },
            delay: 6,
            duration: 24,
            label: 'Parcerias privadas do PAC',
          },
        ],
        headline: 'Novo PAC aposta em parcerias com o setor privado e mercado aprova',
        flags: ['novo-pac-lancado'],
      },
    ],
  },
  {
    id: 'ferrovias-ferrograo',
    ministry: 'infraestrutura',
    title: 'Ferrogrão e novas ferrovias',
    context:
      'O agro pede a Ferrogrão, ferrovia de Mato Grosso ao Pará que passa perto de um parque nacional. Outras ferrovias seguem lentas por falta de verba.',
    minTurn: 3,
    options: [
      {
        id: 'leiloar-ferrograo',
        label: 'Destravar e leiloar a Ferrogrão',
        description:
          'Barateia o frete de grãos e atrai investidores, mas ameaça a floresta.',
        impact: {
          ideologyEconomic: 3,
          sectors: { agribusiness: 8, business: 3, environmentalists: -8 },
          relations: { china: 3 },
        },
        delayed: [
          {
            impact: { infrastructureKm: 900, tradeBalance: 3, potentialGrowth: 0.06 },
            delay: 12,
            duration: 24,
            label: 'Construção da Ferrogrão',
          },
          { impact: { deforestation: 400 }, delay: 6, duration: 24, label: 'Pressão no entorno da Ferrogrão' },
        ],
        headline: 'Governo leiloa a Ferrogrão e agro comemora corredor de exportação pelo Pará',
        risk: {
          chance: 0.25,
          impact: { foreignInvestment: -2, sectors: { agribusiness: -4, business: -3, market: -2 } },
          headline: 'Leilão da Ferrogrão atrai um só interessado e obra deve atrasar',
        },
      },
      {
        id: 'priorizar-fiol-fico',
        label: 'Concluir as ferrovias já em obras',
        description:
          'Menor risco ambiental, mas exige dinheiro do Tesouro e o mercado reclama.',
        impact: { ideologyEconomic: -2, debt: 0.3, sectors: { agribusiness: 3, business: 2, market: -2 } },
        delayed: [
          {
            impact: { infrastructureKm: 700, potentialGrowth: 0.04, tradeBalance: 1 },
            delay: 6,
            duration: 18,
            label: 'Obras de ferrovias em andamento',
          },
        ],
        headline: 'Governo injeta recursos para concluir ferrovias na Bahia e no Centro-Oeste',
      },
      {
        id: 'autorizacoes-ferroviarias',
        label: 'Deixar empresas construírem ferrovias',
        description:
          'Não custa ao Tesouro, mas poucos projetos saem do papel.',
        impact: { ideologyEconomic: 4, congressSupport: -1, sectors: { market: 3, business: 2, agribusiness: 1 } },
        delayed: [
          {
            impact: { infrastructureKm: 400, foreignInvestment: 2 },
            delay: 12,
            duration: 24,
            label: 'Ferrovias autorizadas',
          },
        ],
        headline: 'Ministério aposta em ferrovias privadas autorizadas e descarta aporte público',
      },
    ],
  },
  {
    id: 'concessoes-rodovias',
    ministry: 'infraestrutura',
    title: 'Concessões de rodovias',
    context:
      'Boa parte das rodovias federais está em mau estado. O ministério prepara novas concessões e precisa escolher o modelo de leilão.',
    repeatable: true,
    cooldown: 12,
    minTurn: 2,
    options: [
      {
        id: 'concessoes-outorga',
        label: 'Leiloar pelo maior pagamento ao governo',
        description:
          'Gera receita e investimentos, mas os pedágios ficam mais caros.',
        impact: { ideologyEconomic: 4, debt: -0.1, sectors: { market: 5, business: 4, middleClass: -3, lowerClass: -1 } },
        delayed: [
          {
            impact: { infrastructureKm: 800, foreignInvestment: 3, potentialGrowth: 0.04 },
            delay: 6,
            duration: 24,
            label: 'Investimentos das concessionárias',
          },
        ],
        headline: 'Leilão de rodovias federais rende bilhões ao governo; pedágio sobe',
        risk: {
          chance: 0.15,
          impact: { debt: -0.15, foreignInvestment: 1, sectors: { market: 3 } },
          headline: 'Leilão de rodovias tem ágio recorde e reforça o caixa do governo',
        },
      },
      {
        id: 'concessoes-menor-tarifa',
        label: 'Leiloar pelo menor pedágio',
        description:
          'Pedágio mais barato, mas sem receita e com risco de obras atrasadas.',
        impact: { ideologyEconomic: 2, sectors: { middleClass: 2, business: 1, market: -2 } },
        delayed: [
          {
            impact: { infrastructureKm: 400, foreignInvestment: 1 },
            delay: 6,
            duration: 24,
            label: 'Concessões por menor pedágio',
          },
        ],
        headline: 'Governo leiloa rodovias pelo critério de menor pedágio e caminhoneiros aprovam',
      },
      {
        id: 'obras-dnit',
        label: 'Manter as rodovias com o governo',
        description:
          'Estradas sem pedágio agradam, mas custam ao orçamento e andam devagar.',
        impact: { ideologyEconomic: -3, primaryBalance: -0.08, sectors: { middleClass: 2, lowerClass: 1, market: -3 } },
        delayed: [
          { impact: { infrastructureKm: 500 }, delay: 3, duration: 18, label: 'Obras rodoviárias federais' },
        ],
        headline: 'DNIT ganha reforço no orçamento para recuperar estradas sem pedágio',
      },
    ],
  },
  {
    id: 'marco-saneamento',
    ministry: 'infraestrutura',
    title: 'Metas do saneamento',
    context:
      'A lei exige levar água e esgoto a quase todos até 2033, mas metade do país ainda não tem esgoto. Estados pedem mais prazo.',
    minTurn: 3,
    options: [
      {
        id: 'cobrar-metas-concessoes',
        label: 'Cobrar as metas e estimular leilões',
        description:
          'Atrai bilhões, mas irrita governadores e pode encarecer a conta de água.',
        impact: { ideologyEconomic: 4, congressSupport: -2, sectors: { market: 5, business: 3, lowerClass: -1 } },
        delayed: [
          {
            impact: { sanitation: 4, healthCoverage: 1, foreignInvestment: 3 },
            delay: 6,
            duration: 30,
            label: 'Concessões de saneamento',
          },
        ],
        headline: 'Governo condiciona verbas ao cumprimento do marco do saneamento e acelera leilões',
      },
      {
        id: 'financiamento-publico-saneamento',
        label: 'Financiar as empresas públicas de água',
        description:
          'Crédito barato com apoio político, mas eleva a dívida e a obra é lenta.',
        impact: { ideologyEconomic: -3, debt: 0.4, sectors: { lowerClass: 3, market: -2 } },
        delayed: [
          {
            impact: { sanitation: 2.5, healthCoverage: 0.8 },
            delay: 3,
            duration: 24,
            label: 'Financiamento público do saneamento',
          },
        ],
        headline: 'BNDES e FGTS abrem linha bilionária para saneamento de companhias estaduais',
      },
      {
        id: 'prorrogar-prazos-saneamento',
        label: 'Prorrogar os prazos do saneamento',
        description:
          'Agrada governadores, mas investidores recuam e o esgoto a céu aberto fica.',
        impact: { congressSupport: 3, sectors: { market: -4, business: -2 } },
        delayed: [{ impact: { sanitation: 0.5 }, delay: 3, duration: 18, label: 'Saneamento em ritmo lento' }],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -1 },
        headline: 'Congresso adia metas do saneamento e investidores falam em insegurança jurídica',
        failureHeadline: 'Câmara rejeita adiar metas do saneamento e mantém prazo de 2033',
      },
    ],
  },
  {
    id: 'privatizacao-estatais',
    ministry: 'infraestrutura',
    title: 'Futuro das estatais deficitárias',
    context:
      'Os Correios acumulam prejuízos bilionários e perdem mercado. A equipe econômica quer privatizar; sindicatos e parte da base resistem.',
    minTurn: 4,
    options: [
      {
        id: 'privatizar-correios',
        label: 'Propor a privatização dos Correios',
        description:
          'Poupa o Tesouro e agrada o mercado, mas gera greves e resistência.',
        impact: {
          ideologyEconomic: 7,
          debt: -0.3,
          congressSupport: -2,
          sectors: { market: 8, business: 3, lowerClass: -2, middleClass: -1 },
        },
        delayed: [
          { impact: { primaryBalance: 0.05 }, delay: 3, duration: 12, label: 'Fim dos aportes aos Correios' },
          { impact: { unemployment: 0.1 }, delay: 2, duration: 8, label: 'Reestruturação pós-privatização' },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -2, sectors: { market: -4 } },
        headline: 'Congresso aprova privatização dos Correios e promete manter atendimento universal',
        failureHeadline: 'Plenário derruba privatização dos Correios em derrota para o governo',
        flags: ['privatizacao-aprovada'],
        risk: {
          chance: 0.25,
          impact: { debt: 0.15, approval: -1, sectors: { market: -3, lowerClass: -2 } },
          headline: 'Leilão dos Correios atrai uma só proposta e estatal sai abaixo do esperado',
        },
      },
      {
        id: 'reestruturar-correios',
        label: 'Reestruturar sob controle estatal',
        description:
          'Corta agências e pessoal aos poucos, mas desagrada servidores e usuários.',
        impact: { ideologyEconomic: 2, debt: 0.1, sectors: { market: 2, lowerClass: -1, middleClass: -1 } },
        delayed: [{ impact: { primaryBalance: 0.03 }, delay: 6, duration: 12, label: 'Reestruturação dos Correios' }],
        headline: 'Correios abrem demissão voluntária e fecham agências para estancar prejuízo',
      },
      {
        id: 'capitalizar-estatais',
        label: 'Socorrer as estatais com dinheiro público',
        description:
          'Preserva empregos e agrada sindicatos, mas o mercado reage mal.',
        impact: { ideologyEconomic: -5, debt: 0.3, congressSupport: 1, sectors: { lowerClass: 1, market: -5 } },
        delayed: [
          { impact: { primaryBalance: -0.05 }, delay: 6, duration: 12, label: 'Prejuízos recorrentes das estatais' },
        ],
        headline: 'Tesouro faz aporte bilionário nos Correios e descarta privatização',
      },
    ],
  },
  {
    id: 'leilao-transmissao-energia',
    ministry: 'infraestrutura',
    title: 'Falta de linhas de transmissão',
    context:
      'Usinas eólicas e solares do Nordeste são desligadas por falta de linhas de transmissão. Ao mesmo tempo, a conta de luz não para de subir.',
    minTurn: 3,
    options: [
      {
        id: 'mega-leilao-transmissao',
        label: 'Fazer um mega-leilão de transmissão',
        description:
          'Escoa a energia limpa e atrai investimento, mas encarece a conta de luz.',
        impact: { ideologyEconomic: 2, sectors: { business: 4, market: 2, environmentalists: 2, middleClass: -2 } },
        delayed: [
          { impact: { foreignInvestment: 4 }, delay: 3, duration: 12, label: 'Leilão de transmissão' },
          {
            impact: { renewableEnergy: 2, potentialGrowth: 0.05, co2Emissions: -10 },
            delay: 12,
            duration: 24,
            label: 'Novas linhas de transmissão',
          },
          { impact: { inflation: 0.1 }, delay: 6, duration: 12, label: 'Encargos de transmissão na tarifa' },
        ],
        headline: 'Leilão de transmissão bate recorde e promete fim dos cortes de energia no Nordeste',
        risk: {
          chance: 0.2,
          impact: { inflation: -0.05, foreignInvestment: 2, sectors: { business: 2, middleClass: 2 } },
          headline: 'Mega-leilão de transmissão tem deságio recorde e alivia a conta de luz',
        },
      },
      {
        id: 'termicas-gas',
        label: 'Contratar usinas térmicas a gás',
        description:
          'Reduz o risco de apagão, mas encarece a energia e aumenta as emissões.',
        impact: { inflation: 0.15, sectors: { business: 2, environmentalists: -5 } },
        delayed: [
          {
            impact: { waterReserves: 3, renewableEnergy: -1.5, co2Emissions: 25 },
            delay: 3,
            duration: 18,
            label: 'Térmicas a gás contratadas',
          },
        ],
        headline: 'Governo contrata térmicas a gás e ambientalistas criticam retrocesso na matriz',
      },
      {
        id: 'conter-tarifa',
        label: 'Adiar leilões para conter a conta de luz',
        description:
          'Alivia a conta agora, mas os cortes continuam e investidores recuam.',
        impact: { ideologyEconomic: -2, sectors: { middleClass: 2, lowerClass: 1, business: -3, environmentalists: -3 } },
        delayed: [
          {
            impact: { renewableEnergy: -1, potentialGrowth: -0.03, foreignInvestment: -1 },
            delay: 3,
            duration: 18,
            label: 'Transmissão estagnada',
          },
        ],
        headline: 'Governo adia leilões de transmissão e cortes de energia renovável se agravam',
      },
    ],
  },
  {
    id: 'conta-de-luz-cde',
    ministry: 'infraestrutura',
    title: 'Reajuste da conta de luz',
    context:
      'A Aneel prevê alta da conta de luz acima da inflação, puxada por R$ 40 bilhões por ano em subsídios pagos por todos os consumidores.',
    repeatable: true,
    cooldown: 10,
    minTurn: 3,
    options: [
      {
        id: 'tesouro-banca-cde',
        label: 'Usar o Tesouro para segurar a conta',
        description:
          'Alivia o bolso agora, mas o custo vai para o contribuinte.',
        impact: {
          ideologyEconomic: -3,
          inflation: -0.2,
          primaryBalance: -0.1,
          approval: 1,
          sectors: { middleClass: 3, lowerClass: 2, business: 2, market: -5 },
        },
        delayed: [{ impact: { inflation: 0.2 }, delay: 8, duration: 6, label: 'Fim do alívio tarifário' }],
        headline: 'Tesouro aporta bilhões e governo segura reajuste da conta de luz',
      },
      {
        id: 'repassar-reajuste',
        label: 'Deixar o reajuste chegar à conta',
        description:
          'Preserva as contas públicas, mas pesa no bolso e na inflação.',
        impact: { ideologyEconomic: 2, inflation: 0.2, approval: -1, sectors: { lowerClass: -3, middleClass: -3, business: -2, market: 3 } },
        delayed: [{ impact: { foreignInvestment: 1 }, delay: 2, duration: 12, label: 'Regras estáveis no setor elétrico' }],
        headline: 'Conta de luz sobe acima da inflação e Aneel aprova reajustes em série',
      },
      {
        id: 'cortar-subsidios-cde',
        label: 'Cortar subsídios na conta de luz',
        description:
          'Baixa a conta de vez, mas enfrenta lobby e irrita renováveis e o campo.',
        impact: { ideologyEconomic: 3, congressSupport: -2, sectors: { business: -3, environmentalists: -3, agribusiness: -2, market: 4 } },
        delayed: [{ impact: { inflation: -0.3 }, delay: 3, duration: 12, label: 'Redução de encargos na tarifa' }],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -1, sectors: { market: -2 } },
        headline: 'Congresso corta subsídios da conta de luz após embate com o setor elétrico',
        failureHeadline: 'Lobby do setor elétrico derruba projeto que cortava subsídios da conta de luz',
      },
    ],
  },
  {
    id: 'concessoes-aeroportos-portos',
    ministry: 'infraestrutura',
    title: 'Concessões de aeroportos e portos',
    context:
      'A Infraero ainda opera aeroportos no prejuízo e portos públicos têm contratos vencidos. O governo prepara novos leilões e precisa definir o modelo.',
    repeatable: true,
    cooldown: 12,
    minTurn: 4,
    options: [
      {
        id: 'blocos-com-deficitarios',
        label: 'Leiloar aeroportos bons junto com os ruins',
        description:
          'Garante obras nos aeroportos regionais, mas as tarifas sobem.',
        impact: { ideologyEconomic: 4, debt: -0.1, sectors: { market: 4, business: 3, middleClass: -2, lowerClass: -1 } },
        delayed: [
          {
            impact: { foreignInvestment: 3, potentialGrowth: 0.03 },
            delay: 4,
            duration: 18,
            label: 'Investimentos em aeroportos concedidos',
          },
        ],
        headline: 'Leilão de aeroportos arrecada bilhões e inclui terminais regionais da Amazônia',
      },
      {
        id: 'arrendamentos-portuarios',
        label: 'Priorizar portos e dragagem',
        description:
          'Reduz as filas de navios, mas exige dinheiro público e leva anos.',
        impact: { ideologyEconomic: 2, debt: 0.15, sectors: { agribusiness: 4, business: 2, market: 1, environmentalists: -2 } },
        delayed: [
          { impact: { tradeBalance: 2, potentialGrowth: 0.03 }, delay: 6, duration: 18, label: 'Modernização portuária' },
        ],
        headline: 'Governo leiloa terminais portuários e anuncia dragagem em Santos e Paranaguá',
      },
      {
        id: 'investimento-infraero',
        label: 'Manter na Infraero com verba pública',
        description:
          'Mantém tarifas baixas e empregos, mas consome verba e o mercado reclama.',
        impact: { ideologyEconomic: -4, primaryBalance: -0.05, congressSupport: 2, sectors: { market: -4, business: -2, lowerClass: 1 } },
        delayed: [
          { impact: { foreignInvestment: -1 }, delay: 2, duration: 12, label: 'Investidores recuam' },
        ],
        headline: 'Governo suspende concessões e Infraero recebe verba para aeroportos regionais',
      },
    ],
  },
  {
    id: 'pavimentacao-br-319',
    ministry: 'infraestrutura',
    title: 'Pavimentação da BR-319',
    context:
      'A BR-319, única estrada entre Manaus e o resto do país, tem 400 km de terra. Cientistas temem que o asfalto traga desmatamento.',
    minTurn: 4,
    options: [
      {
        id: 'asfaltar-trecho-do-meio',
        label: 'Asfaltar logo, com licença simplificada',
        description:
          'Atende o Amazonas e Rondônia, mas atrai grilagem e desmatamento.',
        impact: {
          ideologySocial: 3,
          primaryBalance: -0.03,
          congressSupport: 2,
          sectors: { agribusiness: 4, business: 2, lowerClass: 1, environmentalists: -10 },
          relations: { 'uniao-europeia': -3 },
        },
        delayed: [
          { impact: { infrastructureKm: 400 }, delay: 6, duration: 18, label: 'Pavimentação da BR-319' },
          {
            impact: { deforestation: 800, co2Emissions: 20 },
            delay: 6,
            duration: 30,
            label: 'Nova frente de desmatamento na BR-319',
          },
        ],
        headline: 'Governo autoriza asfaltar a BR-319 e cientistas alertam para desmatamento',
      },
      {
        id: 'br-319-governanca',
        label: 'Asfaltar com áreas protegidas e fiscalização',
        description:
          'Reduz o risco ambiental, mas encarece, atrasa e não agrada ninguém.',
        impact: { primaryBalance: -0.05, sectors: { agribusiness: 1, environmentalists: -2, market: -2 } },
        delayed: [
          { impact: { infrastructureKm: 400 }, delay: 12, duration: 24, label: 'BR-319 com proteção ambiental' },
          { impact: { deforestation: 200 }, delay: 12, duration: 24, label: 'Pressão no entorno da BR-319' },
        ],
        headline: 'BR-319 será asfaltada com cinturão de áreas protegidas, anuncia governo',
      },
      {
        id: 'manutencao-hidrovia-madeira',
        label: 'Só manter a estrada e investir no rio Madeira',
        description:
          'Evita o risco ambiental, mas frustra o Amazonas e a bancada do Norte.',
        impact: {
          ideologySocial: -2,
          debt: 0.05,
          congressSupport: -2,
          sectors: { environmentalists: 5, agribusiness: -3, lowerClass: -2, business: -1 },
        },
        delayed: [
          {
            impact: { tradeBalance: 0.5, infrastructureKm: 100 },
            delay: 4,
            duration: 12,
            label: 'Dragagem da hidrovia do Madeira',
          },
        ],
        headline: 'Governo descarta asfaltar a BR-319 e aposta na hidrovia do Madeira',
      },
    ],
  },
  {
    id: 'internet-no-interior',
    ministry: 'infraestrutura',
    title: 'Internet no interior do país',
    context:
      'Milhões de pessoas no campo e em cidades pequenas não têm sinal de celular nem internet boa. Operadoras dizem que não compensa investir.',
    minTurn: 12,
    options: [
      {
        id: 'fundo-conectividade-publica',
        label: 'Usar fundo público para levar a rede',
        description: 'Conecta o interior rápido, mas tira verba de outras áreas.',
        impact: { ideologyEconomic: -2, primaryBalance: -0.06, congressSupport: 2, sectors: { agribusiness: 3, lowerClass: 2, market: -3 } },
        delayed: [
          { impact: { digitalConnectivity: 2.5, potentialGrowth: 0.04 }, delay: 3, duration: 18, label: 'Rede pública no interior' },
        ],
        headline: 'Governo usa fundo de telecomunicações para levar internet a 5 mil localidades',
      },
      {
        id: 'trocar-multas-por-antenas',
        label: 'Trocar multas das operadoras por antenas',
        description: 'Não custa ao Tesouro, mas perdoa multas e a cobertura avança devagar.',
        impact: { ideologyEconomic: 2, debt: 0.05, sectors: { business: 3, market: 1, middleClass: -2 } },
        delayed: [{ impact: { digitalConnectivity: 1.5 }, delay: 6, duration: 24, label: 'Antenas no lugar de multas' }],
        headline: 'Operadoras trocarão multas bilionárias por antenas em cidades sem sinal',
      },
      {
        id: 'internet-via-satelite',
        label: 'Contratar internet via satélite estrangeira',
        description: 'Chega rápido a áreas remotas, mas cria dependência de empresa de fora.',
        impact: { primaryBalance: -0.02, sectors: { agribusiness: 2, military: -3, business: -2 }, relations: { eua: 2 } },
        delayed: [{ impact: { digitalConnectivity: 1 }, delay: 1, duration: 8, label: 'Internet por satélite' }],
        headline: 'Governo contrata internet via satélite para escolas e postos de saúde remotos',
      },
    ],
  },
  {
    id: 'transporte-publico-metropolitano',
    ministry: 'infraestrutura',
    title: 'Ônibus e metrô nas grandes cidades',
    context:
      'Passagens caras e ônibus lotados afastam passageiros do transporte público. Prefeitos pedem ajuda federal para baratear a tarifa.',
    minTurn: 36,
    options: [
      {
        id: 'subsidio-federal-tarifa',
        label: 'Subsidiar a passagem com verba federal',
        description: 'Barateia a tarifa já e é popular, mas cria despesa difícil de cortar.',
        impact: { ideologyEconomic: -4, primaryBalance: -0.1, approval: 2, co2Emissions: -5, sectors: { lowerClass: 5, middleClass: 2, market: -5 } },
        delayed: [
          { impact: { primaryBalance: -0.05, approval: -2 }, delay: 8, duration: 12, label: 'Subsídio de tarifa sem fonte' },
        ],
        headline: 'União passa a subsidiar passagens de ônibus e tarifas caem nas capitais',
      },
      {
        id: 'metro-e-corredores',
        label: 'Financiar metrôs e corredores de ônibus',
        description: 'Melhora a mobilidade de vez, mas as obras levam anos e elevam a dívida.',
        impact: { ideologyEconomic: -2, debt: 0.4, sectors: { business: 4, middleClass: 1, market: -2 } },
        delayed: [
          {
            impact: { infrastructureKm: 300, co2Emissions: -15, potentialGrowth: 0.04 },
            delay: 6,
            duration: 24,
            label: 'Obras de metrô e corredores',
          },
        ],
        headline: 'Governo financia novas linhas de metrô e corredores de ônibus em dez capitais',
      },
      {
        id: 'onibus-eletricos',
        label: 'Trocar a frota por ônibus elétricos',
        description: 'Reduz poluição e custos no futuro, mas não baixa a passagem agora.',
        impact: { ideologySocial: -2, debt: 0.15, sectors: { environmentalists: 5, business: 2, lowerClass: -2 } },
        delayed: [
          { impact: { co2Emissions: -20, renewableEnergy: 0.5 }, delay: 4, duration: 18, label: 'Ônibus elétricos nas capitais' },
        ],
        headline: 'BNDES financia troca de ônibus a diesel por elétricos nas capitais',
      },
    ],
  },

  // ─── Agenda radical (só para governos já afastados do centro) ──────────
  {
    id: 'reestatizar-eletrobras',
    ministry: 'infraestrutura',
    title: 'Reestatizar a Eletrobras',
    context:
      'Sindicatos e movimentos pedem retomar o controle da Eletrobras, privatizada em 2022. Acionistas e o mercado falam em quebra de contrato.',
    conditions: [{ kind: 'indicator', indicator: 'ideologyEconomic', comparator: 'lte', value: -40 }],
    weight: 2,
    minTurn: 6,
    options: [
      {
        id: 'recomprar-controle-eletrobras',
        label: 'Recomprar o controle e reestatizar',
        description: 'Devolve a energia ao Estado, mas custa bilhões e assusta investidores.',
        impact: {
          ideologyEconomic: -12,
          debt: 1.2,
          exchangeRate: 0.3,
          foreignInvestment: -3,
          congressSupport: -3,
          sectors: { lowerClass: 9, environmentalists: 2, middleClass: -3, business: -9, market: -14 },
        },
        delayed: [
          { impact: { foreignInvestment: -4, potentialGrowth: -0.1 }, delay: 2, duration: 18, label: 'Investidores deixam o setor elétrico' },
          { impact: { inflation: -0.2 }, delay: 6, duration: 12, label: 'Tarifas sob controle estatal' },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -3, sectors: { lowerClass: -3, market: -4 } },
        headline: 'Congresso aprova reestatização da Eletrobras e ações da empresa despencam',
        failureHeadline: 'Câmara barra reestatização da Eletrobras e impõe derrota ao Planalto',
        risk: {
          chance: 0.3,
          impact: { debt: 0.5, prestige: -1, sectors: { market: -4, business: -2 } },
          headline: 'Acionistas estrangeiros processam o Brasil pela reestatização da Eletrobras',
        },
      },
      {
        id: 'ampliar-voto-uniao-eletrobras',
        label: 'Negociar mais poder de voto para a União',
        description: 'Recupera influência sem recompra, mas a militância vê meio-termo.',
        impact: { ideologyEconomic: -5, foreignInvestment: -1, sectors: { lowerClass: 3, business: -2, market: -5 } },
        headline: 'Governo e Eletrobras fecham acordo que amplia poder de voto da União',
      },
      {
        id: 'manter-eletrobras-privada',
        label: 'Manter a Eletrobras privada',
        description: 'Tranquiliza investidores, mas frustra a base e os movimentos.',
        impact: { ideologyEconomic: 3, approval: -1, congressSupport: -1, sectors: { lowerClass: -4, environmentalists: -2, market: 3 } },
        headline: 'Planalto descarta reestatizar a Eletrobras e movimentos acusam recuo',
      },
    ],
  },
  {
    id: 'privatizar-petrobras',
    ministry: 'infraestrutura',
    title: 'Privatizar a Petrobras',
    context:
      'A equipe econômica propõe vender o controle da Petrobras, maior empresa do país. Petroleiros e nacionalistas falam em entregar o pré-sal.',
    conditions: [{ kind: 'indicator', indicator: 'ideologyEconomic', comparator: 'gte', value: 40 }],
    weight: 2,
    minTurn: 6,
    options: [
      {
        id: 'vender-controle-petrobras',
        label: 'Vender o controle da Petrobras',
        description: 'Rende bilhões e agrada o mercado, mas gera greves e revolta nacionalista.',
        impact: {
          ideologyEconomic: 13,
          debt: -1.5,
          exchangeRate: -0.2,
          approval: -2,
          congressSupport: -4,
          sectors: { market: 12, business: 6, lowerClass: -10, middleClass: -4, military: -8 },
        },
        delayed: [
          { impact: { foreignInvestment: 6, potentialGrowth: 0.1 }, delay: 3, duration: 18, label: 'Petrobras sob controle privado' },
          { impact: { inflation: 0.2 }, delay: 2, duration: 12, label: 'Combustível sem preço controlado' },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -3, sectors: { market: -6 } },
        headline: 'Congresso autoriza venda do controle da Petrobras e ações disparam',
        failureHeadline: 'Senado derruba privatização da Petrobras em dura derrota do governo',
        flags: ['privatizacao-aprovada'],
        risk: {
          chance: 0.3,
          impact: { approval: -2, gdpGrowth: -0.3, sectors: { lowerClass: -3, middleClass: -3 } },
          headline: 'Greve dos petroleiros paralisa refinarias e falta combustível nos postos',
        },
      },
      {
        id: 'vender-refinarias-petrobras',
        label: 'Vender refinarias e subsidiárias',
        description: 'Encolhe a estatal sem perder o controle, mas o mercado queria mais.',
        impact: { ideologyEconomic: 5, debt: -0.5, sectors: { market: 5, business: 2, lowerClass: -3, military: -2 } },
        delayed: [{ impact: { foreignInvestment: 2 }, delay: 3, duration: 12, label: 'Venda de ativos da Petrobras' }],
        headline: 'Petrobras põe refinarias à venda, mas União mantém o controle da empresa',
        risk: {
          chance: 0.2,
          impact: { inflation: 0.1, sectors: { middleClass: -2, lowerClass: -1 } },
          headline: 'Refinaria vendida reajusta preços e combustível sobe no Nordeste',
        },
      },
      {
        id: 'manter-petrobras-estatal',
        label: 'Manter a Petrobras estatal',
        description: 'Evita a briga com petroleiros, mas frustra o mercado e a base liberal.',
        impact: { ideologyEconomic: -2, sectors: { market: -6, business: -2, military: 2 } },
        headline: 'Governo engaveta privatização da Petrobras e mercado reage mal',
      },
    ],
  },
];
