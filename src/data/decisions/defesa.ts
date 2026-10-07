import type { Decision } from '@/types';

/** Ministério da Defesa: orçamento militar, fronteiras, GLO e projetos estratégicos. */
export const DEFESA_DECISIONS: Decision[] = [
  {
    id: 'orcamento-defesa',
    ministry: 'defesa',
    title: 'Orçamento das Forças Armadas',
    context:
      'Os militares dizem que a verba de investimento é a menor em 20 anos e ameaça projetos. A Fazenda resiste a gastar mais.',
    repeatable: true,
    cooldown: 12,
    options: [
      {
        id: 'ampliar-defesa',
        label: 'Ampliar o orçamento de defesa',
        description: 'Moderniza as Forças e a indústria de defesa, mas pesa nas contas.',
        impact: { ideologySocial: 3, primaryBalance: -0.08, prestige: 1, sectors: { military: 7, business: 1, environmentalists: -2 } },
        delayed: [{ impact: { potentialGrowth: 0.02 }, delay: 6, duration: 24, label: 'Base industrial de defesa' }],
        headline: 'Governo eleva verba de investimento das Forças Armadas',
      },
      {
        id: 'manter-defesa',
        label: 'Manter o orçamento atual',
        description: 'Sem custo extra, mas os militares seguem insatisfeitos.',
        impact: { sectors: { military: -1 } },
        headline: 'Orçamento militar fica estável e projetos seguem em ritmo lento',
      },
      {
        id: 'cortar-defesa',
        label: 'Cortar despesas militares',
        description: 'Libera recursos e agrada o mercado, mas gera mal-estar nos quartéis.',
        impact: { ideologySocial: -2, primaryBalance: 0.06, securityTrust: -1, sectors: { military: -7, market: 2 } },
        headline: 'Corte no orçamento da Defesa gera mal-estar entre comandantes',
      },
    ],
  },
  {
    id: 'operacao-fronteiras',
    ministry: 'defesa',
    title: 'Operação nas fronteiras',
    context:
      'Cresce o contrabando de armas e cocaína pelas fronteiras com Paraguai, Bolívia e Colômbia, abastecendo facções nas grandes cidades.',
    repeatable: true,
    cooldown: 10,
    options: [
      {
        id: 'operacao-fronteira-ampla',
        label: 'Operação ampla das Forças Armadas',
        description: 'Reprime o tráfico com forte presença militar, mas o custo é alto.',
        impact: { ideologySocial: 3, debt: 0.1, securityTrust: 3, sectors: { military: 4, middleClass: 1 } },
        delayed: [{ impact: { homicideRate: -0.4 }, delay: 0, duration: 6, label: 'Fronteiras reforçadas' }],
        headline: 'Forças Armadas iniciam maior operação de fronteira da década',
        risk: {
          chance: 0.2,
          impact: { approval: -1, securityTrust: -3, sectors: { military: -2 } },
          headline: 'Militares trocam tiros com contrabandistas e operação na fronteira deixa mortos',
        },
      },
      {
        id: 'cooperacao-vizinhos',
        label: 'Cooperação policial com países vizinhos',
        description: 'Integra a inteligência regional e melhora relações, com efeito gradual.',
        impact: { debt: 0.04, prestige: 1, relations: { argentina: 3 } },
        delayed: [{ impact: { homicideRate: -0.2 }, delay: 1, duration: 8, label: 'Cooperação regional' }],
        headline: 'Brasil e vizinhos criam centro integrado contra o crime transnacional',
      },
      {
        id: 'operacao-pontual',
        label: 'Ações pontuais da Polícia Federal',
        description: 'Custo baixo, mas pouco efeito sobre o fluxo de armas e drogas.',
        impact: { securityTrust: 1, homicideRate: -0.1 },
        headline: 'PF apreende carregamento de armas na fronteira com o Paraguai',
      },
    ],
  },
  {
    id: 'glo-seguranca-publica',
    ministry: 'defesa',
    title: 'Pedido de Forças Armadas nas ruas',
    context:
      'Após uma onda de ataques de facções, um governador pede que as Forças Armadas assumam o policiamento no estado.',
    conditions: [{ kind: 'indicator', indicator: 'homicideRate', comparator: 'gt', value: 18 }],
    repeatable: true,
    cooldown: 12,
    weight: 1.5,
    options: [
      {
        id: 'decretar-glo',
        label: 'Enviar as Forças Armadas às ruas',
        description: 'Resposta forte e popular, mas o efeito tende a ser passageiro.',
        impact: {
          ideologySocial: 6,
          debt: 0.1,
          approval: 1,
          securityTrust: 4,
          homicideRate: -0.5,
          sectors: { military: 3, middleClass: 3, environmentalists: -4 },
        },
        delayed: [{ impact: { homicideRate: 0.3 }, delay: 3, duration: 6, label: 'Fim do efeito das tropas' }],
        headline: 'Presidente envia Forças Armadas e tropas ocupam ruas da capital',
        flags: ['glo-decretada'],
        risk: {
          chance: 0.25,
          impact: { approval: -2, securityTrust: -5, sectors: { lowerClass: -4, environmentalists: -3 } },
          headline: 'Ação de militares em comunidade deixa civis mortos e gera protestos',
        },
      },
      {
        id: 'forca-nacional',
        label: 'Enviar a Força Nacional',
        description: 'Apoio federal sem militarizar a polícia, com efeito moderado.',
        impact: { debt: 0.05, securityTrust: 2, homicideRate: -0.3, sectors: { middleClass: 1 } },
        headline: 'Força Nacional chega ao estado para reforçar a segurança',
      },
      {
        id: 'negar-glo',
        label: 'Negar o pedido',
        description: 'Evita usar militares como polícia, mas o governo é acusado de omissão.',
        impact: { ideologySocial: -3, congressSupport: -1, sectors: { middleClass: -2, military: -2, environmentalists: 2 } },
        headline: 'Planalto nega tropas e governador acusa governo federal de omissão',
      },
    ],
  },
  {
    id: 'programa-submarino-nuclear',
    ministry: 'defesa',
    title: 'Submarino de propulsão nuclear',
    context:
      'O programa do submarino nuclear, feito com a França, entra na fase decisiva. A Marinha pede para acelerar o cronograma.',
    minTurn: 4,
    options: [
      {
        id: 'acelerar-prosub',
        label: 'Acelerar o programa do submarino',
        description: 'Mostra força e domínio tecnológico, mas exige bilhões.',
        impact: {
          ideologySocial: 2,
          debt: 0.4,
          prestige: 3,
          sectors: { military: 6, business: 2 },
          relations: { 'uniao-europeia': 2, eua: -1 },
        },
        delayed: [{ impact: { potentialGrowth: 0.02 }, delay: 6, duration: 24, label: 'Tecnologia naval' }],
        headline: 'Governo acelera submarino nuclear e Brasil se aproxima de clube restrito',
        risk: {
          chance: 0.3,
          impact: { debt: 0.3, sectors: { middleClass: -2, market: -2 } },
          headline: 'TCU aponta estouro bilionário no custo do submarino nuclear',
        },
      },
      {
        id: 'manter-cronograma-prosub',
        label: 'Manter o cronograma',
        description: 'Segue o programa sem pressão extra nas contas.',
        impact: { debt: 0.1, sectors: { military: 1 } },
        headline: 'Submarino nuclear segue no cronograma previsto, informa a Marinha',
      },
      {
        id: 'adiar-prosub',
        label: 'Adiar o programa',
        description: 'Poupa recursos agora, mas a Marinha protesta e o país perde prestígio.',
        impact: { debt: -0.1, prestige: -1, sectors: { military: -5 } },
        headline: 'Adiamento do submarino nuclear frustra a Marinha',
      },
    ],
  },
  {
    id: 'ciberdefesa',
    ministry: 'defesa',
    title: 'Defesa cibernética',
    context:
      'Ataques hackers pararam sistemas de ministérios e de uma distribuidora de energia. Os militares pedem investimento em defesa digital.',
    options: [
      {
        id: 'investir-ciberdefesa',
        label: 'Investir em capacidade nacional',
        description: 'Fortalece a autonomia tecnológica, com custo considerável.',
        impact: { debt: 0.15, prestige: 1, securityTrust: 1, sectors: { military: 3, business: 1 } },
        headline: 'Governo cria plano nacional de defesa cibernética',
      },
      {
        id: 'parceria-eua-ciber',
        label: 'Parceria com os Estados Unidos',
        description: 'Tecnologia e inteligência rápidas, mas irrita a China.',
        impact: { debt: 0.05, sectors: { military: 2 }, relations: { eua: 4, china: -3 } },
        headline: 'Brasil assina acordo de cooperação cibernética com os EUA',
      },
      {
        id: 'adiar-ciberdefesa',
        label: 'Manter a estrutura atual',
        description: 'Sem custo extra, mas sistemas críticos seguem vulneráveis.',
        impact: { sectors: { military: -2, business: -1 } },
        headline: 'Especialistas alertam para vulnerabilidade de sistemas do governo',
      },
    ],
  },
  {
    id: 'missao-paz-onu',
    ministry: 'defesa',
    title: 'Missão de paz da ONU',
    context:
      'A ONU pede que o Brasil comande uma missão de paz num país africano em guerra civil, como já fez no Haiti.',
    repeatable: true,
    cooldown: 18,
    minTurn: 3,
    options: [
      {
        id: 'enviar-tropas',
        label: 'Aceitar o comando da missão',
        description: 'Eleva o prestígio, mas custa caro e expõe militares a riscos.',
        impact: { debt: 0.1, prestige: 4, approval: -1, sectors: { military: 3 }, relations: { africa: 4 } },
        headline: 'Brasil assume comando de missão de paz da ONU na África',
        risk: {
          chance: 0.15,
          impact: { approval: -2, sectors: { military: -4, middleClass: -2 } },
          headline: 'Ataque a base da ONU mata soldados brasileiros em missão de paz',
        },
      },
      {
        id: 'apoio-logistico',
        label: 'Oferecer apenas apoio logístico',
        description: 'Contribui sem enviar tropas de combate.',
        impact: { debt: 0.03, prestige: 1, relations: { africa: 1 } },
        headline: 'Brasil enviará apoio logístico, mas não tropas, à missão da ONU',
      },
      {
        id: 'recusar-missao',
        label: 'Recusar o convite',
        description: 'Evita custos e riscos, mas reduz a projeção internacional do país.',
        impact: { prestige: -2, sectors: { military: -1 } },
        headline: 'Itamaraty recusa missão da ONU e diplomatas veem perda de protagonismo',
      },
    ],
  },
  {
    id: 'segundo-lote-gripen',
    ministry: 'defesa',
    title: 'Novos caças para a Aeronáutica',
    context:
      'A Aeronáutica já opera os primeiros caças Gripen, parte montada pela Embraer. Agora pede um segundo lote para trocar aviões antigos.',
    minTurn: 4,
    options: [
      {
        id: 'encomendar-segundo-lote',
        label: 'Encomendar novo lote feito no Brasil',
        description:
          'Moderniza a defesa aérea e a indústria, mas o contrato bilionário pesa.',
        impact: {
          debt: 0.4,
          prestige: 1,
          sectors: { military: 6, business: 3, market: -2, lowerClass: -1 },
          relations: { 'uniao-europeia': 3 },
        },
        delayed: [
          {
            impact: { potentialGrowth: 0.02, tradeBalance: 0.5 },
            delay: 6,
            duration: 24,
            label: 'Indústria aeronáutica de defesa',
          },
        ],
        headline: 'FAB encomenda novo lote de caças Gripen e Embraer amplia produção em São Paulo',
      },
      {
        id: 'cacas-usados-eua',
        label: 'Comprar caças usados dos EUA',
        description:
          'Mais barato e rápido, mas sem tecnologia própria e dependente dos EUA.',
        impact: { debt: 0.15, sectors: { military: 2, business: -2 }, relations: { eua: 4, 'uniao-europeia': -2 } },
        headline: 'Brasil negocia caças F-16 usados com os EUA e Saab reage',
      },
      {
        id: 'adiar-segundo-lote',
        label: 'Adiar a encomenda',
        description:
          'Poupa recursos agora, mas deixa falhas na defesa aérea e na indústria.',
        impact: { prestige: -1, sectors: { military: -5, business: -2, market: 1 } },
        headline: 'Governo adia novos caças e Aeronáutica fala em risco à defesa do espaço aéreo',
      },
    ],
  },
  {
    id: 'reajuste-soldo-militar',
    ministry: 'defesa',
    title: 'Salários e previdência militar',
    context:
      'Os militares pedem aumento salarial para conter a saída de técnicos. A Fazenda exige mudar a previdência militar, com déficit de R$ 50 bilhões.',
    repeatable: true,
    cooldown: 12,
    options: [
      {
        id: 'reajuste-soldo-acima-inflacao',
        label: 'Conceder reajuste acima da inflação',
        description:
          'Agrada os quartéis e segura os técnicos, mas aumenta a folha e o déficit.',
        impact: { ideologySocial: 3, securityTrust: 1, sectors: { military: 7, market: -2, middleClass: -1 } },
        delayed: [{ impact: { primaryBalance: -0.06 }, delay: 0, duration: 12, label: 'Folha militar reajustada' }],
        headline: 'Militares terão reajuste acima da inflação; impacto na folha preocupa a Fazenda',
      },
      {
        id: 'reajuste-com-reforma-previdencia',
        label: 'Reajuste com reforma da previdência militar',
        description:
          'Cria idade mínima para a reserva: alivia as contas, mas divide a tropa.',
        impact: { ideologyEconomic: 3, sectors: { military: -2, market: 4, middleClass: 1 } },
        delayed: [
          { impact: { primaryBalance: 0.08 }, delay: 6, duration: 24, label: 'Reforma da previdência militar' },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -1, sectors: { military: -2 } },
        headline: 'Congresso aprova reajuste dos militares com idade mínima para a reserva',
        failureHeadline: 'Pressão da bancada da segurança derruba mudanças na previdência militar',
      },
      {
        id: 'congelar-soldos',
        label: 'Manter os salários sem reajuste',
        description: 'Preserva o caixa, mas aumenta o mal-estar e a saída de técnicos.',
        impact: { ideologyEconomic: 2, primaryBalance: 0.02, securityTrust: -1, sectors: { military: -6, market: 1 } },
        headline: 'Sem reajuste, comandantes alertam para debandada de técnicos das Forças Armadas',
      },
    ],
  },
  {
    id: 'operacao-garimpo-amazonia',
    ministry: 'defesa',
    title: 'Garimpo ilegal em terras indígenas',
    context:
      'O garimpo ilegal voltou às terras Yanomami e Munduruku, poluindo rios com mercúrio. O governo pede apoio militar para retirar os invasores.',
    repeatable: true,
    cooldown: 10,
    options: [
      {
        id: 'operacao-conjunta-garimpo',
        label: 'Operação conjunta com PF e Ibama',
        description:
          'Desmonta o garimpo, mas é cara e gera atrito com políticos da região.',
        impact: {
          ideologySocial: -3,
          debt: 0.1,
          prestige: 1,
          congressSupport: -1,
          sectors: { environmentalists: 5, military: 2, agribusiness: -1 },
        },
        delayed: [
          {
            impact: { deforestation: -300, co2Emissions: -10, healthCoverage: 0.2 },
            delay: 0,
            duration: 8,
            label: 'Retirada de garimpeiros ilegais',
          },
        ],
        headline: 'Forças Armadas e PF iniciam operação para retirar garimpeiros de terras indígenas',
        risk: {
          chance: 0.2,
          impact: { approval: -1, congressSupport: -1, securityTrust: -2, sectors: { military: -2 } },
          headline: 'Garimpeiros armados emboscam agentes e operação na Amazônia deixa mortos',
        },
      },
      {
        id: 'apoio-logistico-garimpo',
        label: 'Ceder só aviões e transporte',
        description: 'Custo menor, mas os garimpeiros voltam quando a fiscalização sai.',
        impact: { debt: 0.03, sectors: { environmentalists: 1, military: -1 } },
        delayed: [{ impact: { deforestation: -100 }, delay: 0, duration: 4, label: 'Apoio logístico às operações' }],
        headline: 'Defesa cede aviões e helicópteros, mas não tropas, contra o garimpo ilegal',
      },
      {
        id: 'priorizar-fronteira',
        label: 'Manter as tropas na fronteira',
        description:
          'Evita desgaste político no Norte, mas o garimpo avança e o mundo reage.',
        impact: {
          ideologySocial: 3,
          prestige: -2,
          sectors: { environmentalists: -6, military: 1, agribusiness: 1 },
          relations: { 'uniao-europeia': -2 },
        },
        delayed: [
          { impact: { deforestation: 300, co2Emissions: 10 }, delay: 1, duration: 8, label: 'Avanço do garimpo ilegal' },
        ],
        headline: 'Garimpo ilegal avança em terra Yanomami e ONU cobra o governo brasileiro',
      },
    ],
  },
  {
    id: 'base-alcantara',
    ministry: 'defesa',
    title: 'Base de foguetes de Alcântara',
    context:
      'Empresas americanas querem lançar foguetes da base de Alcântara, no Maranhão. A expansão exige retirar comunidades quilombolas.',
    minTurn: 20,
    options: [
      {
        id: 'expandir-alcantara-eua',
        label: 'Expandir a base para empresas americanas',
        description: 'Atrai receita e tecnologia, mas desaloja quilombolas e a China reage.',
        impact: {
          ideologyEconomic: 3, ideologySocial: 2,
          prestige: 1,
          sectors: { military: 5, business: 2, environmentalists: -5, lowerClass: -1 },
          relations: { eua: 5, china: -2 },
        },
        delayed: [
          {
            impact: { foreignInvestment: 1, potentialGrowth: 0.02 },
            delay: 6,
            duration: 24,
            label: 'Lançamentos comerciais em Alcântara',
          },
        ],
        headline: 'Governo amplia base de Alcântara e assina contratos com empresas americanas',
      },
      {
        id: 'alcantara-titular-quilombos',
        label: 'Usar a área atual e titular os quilombos',
        description: 'Resolve o conflito histórico, mas limita os lançamentos da Aeronáutica.',
        impact: { ideologySocial: -4, prestige: 1, sectors: { environmentalists: 4, military: -3, lowerClass: 1 }, relations: { eua: 1 } },
        delayed: [{ impact: { foreignInvestment: 0.5 }, delay: 6, duration: 18, label: 'Lançamentos na área atual' }],
        headline: 'Acordo titula terras quilombolas em Alcântara e mantém base na área atual',
      },
      {
        id: 'foguete-nacional',
        label: 'Priorizar um foguete nacional na base',
        description: 'Busca autonomia espacial, mas custa caro e o resultado leva anos.',
        impact: { ideologyEconomic: -2, debt: 0.2, sectors: { military: 3, environmentalists: 1, market: -2 } },
        delayed: [
          { impact: { potentialGrowth: 0.02, prestige: 2 }, delay: 12, duration: 24, label: 'Programa espacial brasileiro' },
        ],
        headline: 'Governo retoma programa de foguete nacional e mira lançamento em Alcântara',
      },
    ],
  },
  {
    id: 'militares-cargos-politicos',
    ministry: 'defesa',
    title: 'Militares da ativa na política',
    context:
      'Uma proposta no Congresso obriga militares da ativa a irem para a reserva antes de assumir cargos de governo ou disputar eleições.',
    minTurn: 36,
    options: [
      {
        id: 'apoiar-pec-militares',
        label: 'Apoiar a emenda constitucional',
        description: 'Afasta os quartéis da política, mas gera atrito com o Alto Comando.',
        impact: { ideologySocial: -5, sectors: { military: -7, environmentalists: 4, middleClass: 1 } },
        delayed: [{ impact: { prestige: 2 }, delay: 3, duration: 12, label: 'Forças Armadas fora da política' }],
        legislative: 'pec',
        failureImpact: { congressSupport: -2, sectors: { military: -2 } },
        headline: 'Congresso promulga emenda que afasta militares da ativa de cargos políticos',
        failureHeadline: 'Emenda que afasta militares da política é derrotada no Senado',
      },
      {
        id: 'limitar-nomeacoes-decreto',
        label: 'Limitar nomeações por decreto',
        description: 'Vale só no governo federal: menos atrito, mas efeito limitado.',
        impact: { ideologySocial: -3, sectors: { military: -3, environmentalists: 2 } },
        headline: 'Decreto limita nomeação de militares da ativa para cargos civis no governo',
      },
      {
        id: 'manter-militares-governo',
        label: 'Manter as regras atuais',
        description: 'Agrada os quartéis, mas a oposição acusa o governo de militarizar a gestão.',
        impact: { ideologySocial: 4, congressSupport: -1, sectors: { military: 4, environmentalists: -4, middleClass: -1 } },
        delayed: [{ impact: { prestige: -1 }, delay: 1, duration: 6, label: 'Críticas a militares no governo' }],
        headline: 'Planalto mantém militares da ativa em cargos e oposição fala em militarização',
      },
    ],
  },
  {
    id: 'revisao-lei-anistia',
    ministry: 'defesa',
    title: 'Revisão da Lei de Anistia',
    context:
      'Famílias de mortos e desaparecidos na ditadura pedem rever a Lei de Anistia e cortar verba militar para pagar reparações. O Alto Comando reage.',
    conditions: [{ kind: 'indicator', indicator: 'ideologySocial', comparator: 'lte', value: -40 }],
    weight: 2,
    minTurn: 5,
    options: [
      {
        id: 'rever-anistia-cortar-verba',
        label: 'Rever a anistia e cortar verba militar',
        description: 'Atende as vítimas da ditadura, mas abre uma crise com os quartéis.',
        impact: {
          ideologySocial: -13,
          primaryBalance: 0.08,
          prestige: 2,
          securityTrust: -3,
          congressSupport: -3,
          sectors: { environmentalists: 10, lowerClass: 2, military: -14, middleClass: -4, agribusiness: -3 },
        },
        legislative: 'ordinary',
        failureImpact: { congressSupport: -2, sectors: { military: -4 } },
        headline: 'Congresso aprova revisão da Lei de Anistia e corte no orçamento militar',
        failureHeadline: 'Câmara rejeita revisão da Lei de Anistia após pressão de militares',
        risk: {
          chance: 0.3,
          impact: { approval: -2, securityTrust: -3, sectors: { military: -4, middleClass: -2 } },
          headline: 'Generais divulgam nota contra o governo e crise militar assusta Brasília',
        },
      },
      {
        id: 'comissao-mortos-desaparecidos',
        label: 'Reabrir a Comissão de Mortos e Desaparecidos',
        description: 'Busca restos mortais e paga reparações sem mexer na anistia.',
        impact: { ideologySocial: -5, debt: 0.03, sectors: { environmentalists: 4, military: -4 } },
        headline: 'Governo reinstala comissão sobre mortos e desaparecidos da ditadura',
      },
      {
        id: 'manter-anistia',
        label: 'Manter a lei e o orçamento',
        description: 'Evita uma crise militar, mas a militância acusa o governo de omissão.',
        impact: { ideologySocial: 2, sectors: { military: 2, environmentalists: -5 } },
        headline: 'Planalto descarta rever a Lei de Anistia e familiares protestam',
      },
    ],
  },
  {
    id: 'militares-governo-porte-armas',
    ministry: 'defesa',
    title: 'Militares no governo e porte de armas',
    context:
      'Aliados propõem nomear militares para ministérios e estatais e ampliar por decreto o porte de armas, com o Exército fiscalizando clubes de tiro.',
    conditions: [{ kind: 'indicator', indicator: 'ideologySocial', comparator: 'gte', value: 40 }],
    weight: 2,
    minTurn: 4,
    options: [
      {
        id: 'armas-e-militares-governo',
        label: 'Ampliar porte de armas e nomear militares',
        description: 'Agrada a base armamentista, mas especialistas preveem mais mortes.',
        impact: {
          ideologySocial: 13,
          securityTrust: 3,
          prestige: -2,
          sectors: { military: 12, agribusiness: 8, middleClass: 2, environmentalists: -12, lowerClass: -4 },
        },
        delayed: [{ impact: { homicideRate: 1 }, delay: 3, duration: 18, label: 'Mais armas em circulação' }],
        headline: 'Decreto amplia porte de armas e militares assumem ministérios e estatais',
        risk: {
          chance: 0.3,
          impact: { approval: -1, securityTrust: -2, sectors: { military: -3, agribusiness: -2 } },
          headline: 'STF suspende decreto de armas e Planalto fala em afronta',
        },
      },
      {
        id: 'posse-rural-registro',
        label: 'Facilitar a posse rural com registro',
        description: 'Libera armas em fazendas com registro rigoroso; agrada menos a base.',
        impact: { ideologySocial: 5, sectors: { agribusiness: 4, military: 2, environmentalists: -4 } },
        delayed: [{ impact: { homicideRate: 0.2 }, delay: 3, duration: 12, label: 'Armas nas áreas rurais' }],
        headline: 'Decreto amplia posse de armas em áreas rurais com registro na PF',
      },
      {
        id: 'manter-estatuto-desarmamento',
        label: 'Manter o Estatuto do Desarmamento',
        description: 'Segue a evidência sobre homicídios, mas a base armamentista rompe.',
        impact: { ideologySocial: -3, sectors: { military: -4, agribusiness: -3, environmentalists: 3 } },
        headline: 'Planalto mantém regras de armas e bancada da bala ameaça romper',
      },
    ],
  },
];
