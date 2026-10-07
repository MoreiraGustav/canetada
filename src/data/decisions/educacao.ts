import type { Decision } from '@/types';

/** Ministério da Educação: ensino básico, superior, permanência e conectividade. */
export const EDUCACAO_DECISIONS: Decision[] = [
  {
    id: 'ensino-integral',
    ministry: 'educacao',
    title: 'Escola em tempo integral',
    context:
      'Só uma em cada cinco matrículas públicas é em tempo integral. O MEC quer ampliar a jornada com repasses a estados e municípios.',
    weight: 1.5,
    options: [
      {
        id: 'integral-ampliado',
        label: 'Expansão nacional ambiciosa',
        description: 'Melhora o aprendizado no longo prazo, mas custa caro e demora.',
        impact: { ideologyEconomic: -2, primaryBalance: -0.1, sectors: { middleClass: 3, lowerClass: 2, environmentalists: 3, market: -2 } },
        delayed: [
          { impact: { ideb: 0.25 }, delay: 3, duration: 30, label: 'Escolas em tempo integral' },
          { impact: { potentialGrowth: 0.05 }, delay: 12, duration: 36, label: 'Capital humano' },
        ],
        headline: 'MEC lança programa para dobrar matrículas em tempo integral',
        flags: ['ensino-integral-ampliado'],
      },
      {
        id: 'integral-moderado',
        label: 'Expansão focada nas regiões mais pobres',
        description: 'Custa menos e foca onde o impacto é maior, mas alcança menos.',
        impact: { primaryBalance: -0.04, sectors: { middleClass: 1, lowerClass: 1 } },
        delayed: [{ impact: { ideb: 0.1 }, delay: 3, duration: 24, label: 'Tempo integral focalizado' }],
        headline: 'Tempo integral chega a escolas de municípios mais vulneráveis',
        flags: ['ensino-integral-ampliado'],
      },
      {
        id: 'adiar-integral',
        label: 'Adiar a expansão',
        description: 'Preserva o orçamento, mas educadores criticam a falta de prioridade.',
        impact: { sectors: { environmentalists: -3, middleClass: -1, market: 1 } },
        headline: 'Governo adia expansão do ensino integral por falta de recursos',
      },
    ],
  },
  {
    id: 'basico-vs-superior',
    ministry: 'educacao',
    title: 'Prioridade do orçamento da Educação',
    context:
      'Reitores denunciam cortes nas universidades e estados pedem verba para as escolas. O orçamento do MEC não dá conta das duas demandas.',
    repeatable: true,
    cooldown: 14,
    options: [
      {
        id: 'prioridade-basica',
        label: 'Priorizar a educação básica',
        description: 'Foca onde os resultados são piores, mas universidades reagem.',
        impact: { sectors: { environmentalists: -2, lowerClass: 2 } },
        delayed: [{ impact: { ideb: 0.15 }, delay: 2, duration: 18, label: 'Reforço da educação básica' }],
        headline: 'MEC remaneja verba das universidades para a educação básica',
      },
      {
        id: 'prioridade-universidades',
        label: 'Recompor universidades e pesquisa',
        description: 'Fortalece a ciência, com efeito lento sobre as escolas.',
        impact: { sectors: { environmentalists: 5, middleClass: 2 } },
        delayed: [
          { impact: { potentialGrowth: 0.03, ideb: 0.03 }, delay: 4, duration: 30, label: 'Ciência e inovação' },
        ],
        headline: 'Governo recompõe orçamento de universidades federais e bolsas de pesquisa',
      },
      {
        id: 'equilibrar-educacao',
        label: 'Ampliar o orçamento para ambos',
        description: 'Atende as duas frentes, mas cria gasto permanente extra.',
        impact: { primaryBalance: -0.05, sectors: { environmentalists: 1, middleClass: 1, market: -1 } },
        delayed: [{ impact: { ideb: 0.06 }, delay: 2, duration: 18, label: 'Orçamento da educação ampliado' }],
        headline: 'Orçamento da Educação cresce para atender escolas e universidades',
      },
    ],
  },
  {
    id: 'pe-de-meia',
    ministry: 'educacao',
    title: 'Pé-de-Meia no ensino médio',
    context:
      'O Pé-de-Meia paga poupança a alunos pobres que concluem o ensino médio. A evasão caiu, mas o custo cresceu e o Tribunal de Contas questiona.',
    repeatable: true,
    cooldown: 12,
    options: [
      {
        id: 'ampliar-pe-de-meia',
        label: 'Ampliar o programa',
        description: 'Reduz evasão e pobreza entre jovens, com gasto extra relevante.',
        impact: { ideologyEconomic: -3, primaryBalance: -0.08, sectors: { lowerClass: 4, market: -2 } },
        delayed: [{ impact: { ideb: 0.08, poverty: -0.2 }, delay: 1, duration: 18, label: 'Pé-de-Meia ampliado' }],
        headline: 'Pé-de-Meia é ampliado e passa a atender mais estudantes do ensino médio',
      },
      {
        id: 'manter-pe-de-meia',
        label: 'Manter dentro do orçamento',
        description: 'Preserva o programa e regulariza a verba, sem expansão.',
        impact: { primaryBalance: -0.02, sectors: { lowerClass: 1 } },
        headline: 'Governo regulariza financiamento do Pé-de-Meia no orçamento',
      },
      {
        id: 'cortar-pe-de-meia',
        label: 'Reduzir o programa',
        description: 'Economiza, mas a evasão escolar tende a voltar a crescer.',
        impact: { ideologyEconomic: 3, primaryBalance: 0.05, approval: -1, sectors: { lowerClass: -4, market: 2, environmentalists: -2 } },
        delayed: [{ impact: { ideb: -0.04 }, delay: 2, duration: 12, label: 'Evasão no ensino médio' }],
        headline: 'Corte no Pé-de-Meia deixa milhares de estudantes sem benefício',
      },
    ],
  },
  {
    id: 'piso-professores',
    ministry: 'educacao',
    title: 'Piso salarial dos professores',
    context:
      'A lei prevê reajuste anual do piso dos professores. Prefeitos dizem não conseguir pagar; sindicatos ameaçam greve se ficar abaixo da inflação.',
    repeatable: true,
    cooldown: 11,
    options: [
      {
        id: 'reajuste-acima-inflacao',
        label: 'Reajuste acima da inflação, com ajuda federal',
        description: 'Valoriza os professores, mas a União banca parte do custo das prefeituras.',
        impact: { ideologyEconomic: -2, debt: 0.1, primaryBalance: -0.03, sectors: { middleClass: 3, lowerClass: 1, market: -2 } },
        delayed: [{ impact: { ideb: 0.05 }, delay: 3, duration: 12, label: 'Valorização docente' }],
        headline: 'Professores terão reajuste acima da inflação; União ajudará prefeituras',
      },
      {
        id: 'reajuste-inflacao-professores',
        label: 'Reajuste apenas pela inflação',
        description: 'Alivia prefeituras, mas a categoria se sente desvalorizada.',
        impact: { sectors: { middleClass: -1 }, congressSupport: 1 },
        headline: 'Piso dos professores é corrigido só pela inflação e sindicatos protestam',
      },
      {
        id: 'vincular-desempenho',
        label: 'Vincular parte do reajuste ao desempenho',
        description: 'Agrada especialistas e o mercado, mas gera forte reação sindical.',
        impact: { ideologyEconomic: 3, sectors: { middleClass: -3, market: 2 } },
        delayed: [{ impact: { ideb: 0.07 }, delay: 4, duration: 18, label: 'Bônus por desempenho escolar' }],
        headline: 'MEC propõe bônus por desempenho e professores anunciam paralisação',
      },
    ],
  },
  {
    id: 'conectividade-escolas',
    ministry: 'educacao',
    title: 'Internet nas escolas públicas',
    context:
      'Milhares de escolas públicas ainda não têm internet boa para as aulas. O governo precisa decidir como conectá-las.',
    options: [
      {
        id: 'conectar-todas',
        label: 'Conectar todas as escolas com verba pública',
        description: 'Leva internet a todas rapidamente, com alto investimento público.',
        impact: { ideologyEconomic: -2, debt: 0.3, sectors: { business: 2, lowerClass: 1, environmentalists: 1 } },
        delayed: [
          { impact: { digitalConnectivity: 2, ideb: 0.08 }, delay: 2, duration: 18, label: 'Escolas conectadas' },
        ],
        headline: 'Governo promete internet de alta velocidade em todas as escolas públicas',
      },
      {
        id: 'parceria-operadoras',
        label: 'Cobrar a conexão das operadoras do 5G',
        description: 'Usa obrigações do leilão do 5G: custo baixo, mas implantação lenta.',
        impact: { ideologyEconomic: 2, sectors: { business: 3, market: 1 } },
        delayed: [
          { impact: { digitalConnectivity: 1, ideb: 0.04 }, delay: 3, duration: 18, label: 'Conectividade via 5G' },
        ],
        headline: 'Operadoras levarão internet a escolas como contrapartida do 5G',
      },
      {
        id: 'adiar-conectividade',
        label: 'Adiar o programa',
        description: 'Sem custo agora, mas o atraso digital das escolas persiste.',
        impact: { sectors: { environmentalists: -1, lowerClass: -1 } },
        headline: 'Uma em cada quatro escolas segue sem internet adequada',
      },
    ],
  },
  {
    id: 'alfabetizacao-idade-certa',
    ministry: 'educacao',
    title: 'Alfabetização na idade certa',
    context:
      'Menos da metade das crianças sabe ler e escrever ao fim do 2º ano. Como o governo deve apoiar as redes de ensino?',
    options: [
      {
        id: 'programa-nacional-alfabetizacao',
        label: 'Programa nacional com metas e formação',
        description: 'Aposta em avaliação e formação de professores; o resultado leva anos.',
        impact: { primaryBalance: -0.03, sectors: { lowerClass: 2, environmentalists: 2 } },
        delayed: [{ impact: { ideb: 0.15 }, delay: 4, duration: 24, label: 'Alfabetização na idade certa' }],
        headline: 'MEC lança pacto nacional pela alfabetização com metas por município',
      },
      {
        id: 'repasse-estados',
        label: 'Repassar recursos a estados e municípios',
        description: 'Agrada governadores, mas dá menos controle sobre o resultado.',
        impact: { debt: 0.05, congressSupport: 1 },
        delayed: [{ impact: { ideb: 0.06 }, delay: 3, duration: 18, label: 'Apoio às redes de ensino' }],
        headline: 'Estados e municípios recebem verba extra para alfabetização',
      },
      {
        id: 'escolas-civico-militares',
        label: 'Expandir escolas cívico-militares',
        description: 'Popular entre conservadores, mas educadores apontam falta de evidência.',
        impact: { ideologySocial: 6, securityTrust: 1, sectors: { military: 5, middleClass: 2, environmentalists: -5 } },
        delayed: [{ impact: { ideb: 0.02 }, delay: 3, duration: 18, label: 'Escolas cívico-militares' }],
        headline: 'Governo amplia escolas cívico-militares e divide especialistas',
      },
    ],
  },
  {
    id: 'fies-prouni-acesso',
    ministry: 'educacao',
    title: 'Crédito e bolsas para a faculdade',
    context:
      'Os contratos do Fies, o crédito estudantil, despencaram e metade dos alunos não paga. Faculdades querem mais vagas; a Fazenda teme o custo.',
    repeatable: true,
    cooldown: 12,
    months: [1, 2, 7, 8],
    options: [
      {
        id: 'fies-juro-zero',
        label: 'Ampliar o Fies com juro zero para baixa renda',
        description: 'Abre muitas vagas, mas os calotes voltam a pesar nas contas anos depois.',
        impact: { ideologyEconomic: -2, debt: 0.2, sectors: { middleClass: 3, business: 2, market: -3 } },
        delayed: [
          { impact: { debt: 0.3 }, delay: 12, duration: 12, label: 'Inadimplência do Fies' },
          { impact: { potentialGrowth: 0.02 }, delay: 18, duration: 24, label: 'Formação superior ampliada' },
        ],
        headline: 'Fies volta a crescer com juro zero e faculdades privadas comemoram',
      },
      {
        id: 'prouni-ampliado',
        label: 'Ampliar as bolsas do Prouni',
        description: 'Bolsas em troca de isenção de impostos; educadores questionam a qualidade.',
        impact: { primaryBalance: -0.04, sectors: { lowerClass: 2, business: 2, environmentalists: -2, market: -1 } },
        delayed: [
          { impact: { potentialGrowth: 0.02, gini: -0.001 }, delay: 12, duration: 24, label: 'Bolsas do Prouni' },
        ],
        headline: 'Prouni ganha milhares de novas bolsas integrais em faculdades privadas',
      },
      {
        id: 'endurecer-fies',
        label: 'Endurecer critérios e cobrar inadimplentes',
        description: 'Saneia o fundo, mas reduz o acesso à faculdade e irrita estudantes.',
        impact: { ideologyEconomic: 3, debt: -0.1, sectors: { middleClass: -4, business: -3, lowerClass: -1, market: 3 } },
        headline: 'MEC endurece regras do Fies e número de novos contratos cai',
      },
    ],
  },
  {
    id: 'merenda-escolar-pnae',
    ministry: 'educacao',
    title: 'Valor da merenda escolar',
    context:
      'A verba federal da merenda, cerca de R$ 0,50 por aluno ao dia, ficou anos sem reajuste. Para milhões de crianças, é a principal refeição.',
    repeatable: true,
    cooldown: 12,
    options: [
      {
        id: 'merenda-agricultura-familiar',
        label: 'Reajustar e comprar da agricultura familiar',
        description: 'Melhora a comida nas escolas e gera renda no campo, com gasto permanente.',
        impact: { ideologyEconomic: -2, primaryBalance: -0.04, sectors: { lowerClass: 3, environmentalists: 1, market: -2 } },
        delayed: [{ impact: { poverty: -0.2, ideb: 0.03 }, delay: 1, duration: 12, label: 'Merenda escolar reforçada' }],
        headline: 'Governo reajusta merenda escolar e amplia compras da agricultura familiar',
      },
      {
        id: 'merenda-reajuste-inflacao',
        label: 'Corrigir apenas pela inflação',
        description: 'Custo contido, mas o valor segue baixo e prefeituras cobrem a diferença.',
        impact: { primaryBalance: -0.01, congressSupport: -1, sectors: { lowerClass: -1 } },
        headline: 'Merenda tem reajuste pela inflação e prefeitos dizem que valor ainda não cobre custos',
      },
      {
        id: 'merenda-repasse-livre',
        label: 'Passar a merenda aos municípios, sem regras',
        description: 'Agrada prefeitos e o Congresso, mas nutricionistas temem pior qualidade.',
        impact: { ideologyEconomic: 2, congressSupport: 2, sectors: { environmentalists: -3, lowerClass: -1, middleClass: -1 } },
        delayed: [{ impact: { poverty: 0.1, ideb: -0.02 }, delay: 3, duration: 12, label: 'Merenda sem padrão nacional' }],
        headline: 'MEC repassa gestão da merenda a municípios e nutricionistas veem risco à qualidade',
      },
    ],
  },
  {
    id: 'reajuste-bolsas-pesquisa',
    ministry: 'educacao',
    title: 'Bolsas de mestrado e doutorado',
    context:
      'Pesquisadores protestam: as bolsas de mestrado e doutorado perderam valor desde o último reajuste, e cientistas estão indo para o exterior.',
    minTurn: 2,
    options: [
      {
        id: 'reajuste-bolsas-expansao',
        label: 'Reajustar e ampliar as bolsas',
        description: 'Valoriza a ciência e retém talentos, com gasto permanente.',
        impact: { ideologyEconomic: -2, primaryBalance: -0.03, sectors: { environmentalists: 7, middleClass: 2, market: -2 } },
        delayed: [{ impact: { potentialGrowth: 0.03 }, delay: 6, duration: 30, label: 'Pesquisa e pós-graduação' }],
        headline: 'Governo reajusta bolsas de pesquisa e abre milhares de vagas na pós-graduação',
      },
      {
        id: 'reajuste-bolsas-inflacao',
        label: 'Repor apenas a inflação',
        description: 'Custo moderado, mas cientistas acham a reposição insuficiente.',
        impact: { primaryBalance: -0.01, sectors: { environmentalists: -2 } },
        headline: 'Bolsas de pós-graduação têm reposição da inflação e cientistas falam em descaso',
      },
      {
        id: 'congelar-bolsas',
        label: 'Congelar bolsas e priorizar as escolas',
        description: 'Libera verba para escolas, mas acelera a fuga de cientistas.',
        impact: { sectors: { environmentalists: -7, middleClass: -2, lowerClass: 1 } },
        delayed: [
          { impact: { ideb: 0.04 }, delay: 3, duration: 18, label: 'Recursos remanejados para escolas' },
          { impact: { potentialGrowth: -0.02 }, delay: 6, duration: 24, label: 'Fuga de cérebros' },
        ],
        headline: 'Governo congela bolsas de pesquisa e cientistas anunciam mobilização nacional',
      },
    ],
  },
  {
    id: 'seguranca-escolas',
    ministry: 'educacao',
    title: 'Violência nas escolas',
    context:
      'Após ataques a escolas em vários estados, pais cobram proteção. Uns pedem vigilância armada; educadores defendem prevenção.',
    minTurn: 12,
    options: [
      {
        id: 'vigilancia-armada-escolas',
        label: 'Financiar guardas e detectores de metal',
        description: 'Resposta visível e popular, mas especialistas duvidam da eficácia.',
        impact: { ideologySocial: 4, debt: 0.1, securityTrust: 2, sectors: { middleClass: 2, military: 3, environmentalists: -4 } },
        delayed: [
          { impact: { primaryBalance: -0.03 }, delay: 2, duration: 12, label: 'Vigilância permanente nas escolas' },
        ],
        headline: 'Governo financia vigilantes e detectores de metal em escolas públicas',
      },
      {
        id: 'psicologos-escolas',
        label: 'Contratar psicólogos para as escolas',
        description: 'Ataca as causas e melhora o clima escolar, mas custa e demora.',
        impact: { ideologySocial: -3, primaryBalance: -0.04, sectors: { environmentalists: 4, market: -1 } },
        delayed: [
          { impact: { ideb: 0.05, securityTrust: 1 }, delay: 3, duration: 18, label: 'Apoio psicológico nas escolas' },
        ],
        headline: 'MEC financia psicólogos e assistentes sociais em escolas de todo o país',
      },
      {
        id: 'monitorar-ameacas-redes',
        label: 'Monitorar ameaças nas redes com a polícia',
        description: 'Barato e preventivo, mas críticos temem vigilância sobre adolescentes.',
        impact: { ideologySocial: 2, securityTrust: 1, sectors: { middleClass: 1, environmentalists: -2 } },
        headline: 'Governo cria central para monitorar ameaças a escolas nas redes sociais',
      },
    ],
  },
  {
    id: 'ensino-tecnico-expansao',
    ministry: 'educacao',
    title: 'Expansão do ensino técnico',
    context:
      'Só 1 em cada 10 alunos do ensino médio faz curso técnico, contra 4 na Europa. Empresas reclamam de falta de mão de obra qualificada.',
    minTurn: 30,
    options: [
      {
        id: 'novos-institutos-federais',
        label: 'Abrir novos institutos federais',
        description: 'Amplia vagas de qualidade, mas exige obras e professores por anos.',
        impact: {
          ideologyEconomic: -3,
          debt: 0.2,
          primaryBalance: -0.03,
          sectors: { middleClass: 2, lowerClass: 2, environmentalists: 2, market: -2 },
        },
        delayed: [
          {
            impact: { potentialGrowth: 0.05, unemployment: -0.1 },
            delay: 12,
            duration: 30,
            label: 'Novos institutos federais',
          },
        ],
        headline: 'Governo anuncia 100 novos campi de institutos federais pelo país',
      },
      {
        id: 'parceria-sistema-s',
        label: 'Usar o Sistema S e vagas em empresas',
        description: 'Mais rápido e barato, mas as empresas passam a ditar o currículo.',
        impact: { ideologyEconomic: 3, sectors: { business: 4, environmentalists: -3 } },
        delayed: [
          {
            impact: { unemployment: -0.1, potentialGrowth: 0.02 },
            delay: 4,
            duration: 18,
            label: 'Cursos técnicos com o Sistema S',
          },
        ],
        headline: 'Sistema S abrirá milhares de vagas técnicas gratuitas em acordo com o MEC',
      },
      {
        id: 'tecnico-com-estados',
        label: 'Deixar a expansão a cargo dos estados',
        description: 'Poupa a União, mas o avanço fica lento e desigual entre regiões.',
        impact: { ideologyEconomic: 2, sectors: { business: -2, lowerClass: -2, market: 1 } },
        headline: 'Sem plano federal, expansão do ensino técnico fica com estados e avança devagar',
      },
    ],
  },
  {
    id: 'universidade-sem-vestibular',
    ministry: 'educacao',
    title: 'Fim do vestibular nas federais',
    context:
      'O movimento estudantil propõe acabar com o vestibular nas federais, com ciclo básico aberto a todos, como na Argentina, e cotas de 70%.',
    conditions: [
      { kind: 'indicator', indicator: 'ideologySocial', comparator: 'lte', value: -40 },
      { kind: 'indicator', indicator: 'ideologyEconomic', comparator: 'lte', value: 0 },
    ],
    weight: 2,
    minTurn: 5,
    options: [
      {
        id: 'acesso-universal-federais',
        label: 'Acabar com o vestibular e ampliar cotas',
        description: 'Democratiza o acesso, mas exige verba enorme e divide a classe média.',
        impact: {
          ideologySocial: -12,
          ideologyEconomic: -4,
          primaryBalance: -0.15,
          sectors: { lowerClass: 8, environmentalists: 10, middleClass: -10, military: -6, market: -4 },
        },
        delayed: [
          { impact: { gini: -0.004, potentialGrowth: 0.03 }, delay: 12, duration: 30, label: 'Acesso universal às federais' },
        ],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -2, sectors: { environmentalists: -3 } },
        headline: 'Congresso aprova fim do vestibular nas federais e cotas de 70%',
        failureHeadline: 'Câmara rejeita fim do vestibular e mantém o Enem como porta de entrada',
        risk: {
          chance: 0.25,
          impact: { approval: -1, sectors: { middleClass: -4, environmentalists: -2 } },
          headline: 'Federais sem estrutura adiam aulas após explosão de matrículas',
        },
      },
      {
        id: 'cotas-ampliadas-enem',
        label: 'Ampliar as cotas e manter o Enem',
        description: 'Avança na inclusão com menos custo, mas a militância queria mais.',
        impact: { ideologySocial: -5, sectors: { lowerClass: 3, environmentalists: 3, middleClass: -3 } },
        delayed: [{ impact: { gini: -0.001 }, delay: 12, duration: 24, label: 'Cotas ampliadas nas federais' }],
        headline: 'Governo amplia cotas nas federais e mantém o Enem como seleção',
      },
      {
        id: 'manter-selecao-atual',
        label: 'Manter o modelo atual',
        description: 'Evita polêmica, mas o movimento estudantil acusa o governo de recuar.',
        impact: { ideologySocial: 2, sectors: { environmentalists: -4, lowerClass: -1, middleClass: 1 } },
        headline: 'MEC descarta fim do vestibular e estudantes ocupam reitorias',
      },
    ],
  },
  {
    id: 'homeschooling-escola-sem-partido',
    ministry: 'educacao',
    title: 'Educação domiciliar e Escola sem Partido',
    context:
      'A bancada conservadora quer legalizar o ensino em casa e proibir o que chama de doutrinação em sala, com canal de denúncia contra professores.',
    conditions: [{ kind: 'indicator', indicator: 'ideologySocial', comparator: 'gte', value: 40 }],
    weight: 2,
    minTurn: 4,
    options: [
      {
        id: 'pacote-homeschool-sem-partido',
        label: 'Apoiar o pacote completo',
        description: 'Atende famílias conservadoras, mas professores falam em censura.',
        impact: {
          ideologySocial: 13,
          sectors: { military: 8, agribusiness: 4, middleClass: 2, environmentalists: -12, lowerClass: -3 },
        },
        delayed: [{ impact: { ideb: -0.06 }, delay: 6, duration: 24, label: 'Clima de vigilância nas escolas' }],
        legislative: 'ordinary',
        failureImpact: { congressSupport: -2, sectors: { military: -3 } },
        headline: 'Congresso aprova ensino domiciliar e Escola sem Partido; sindicatos vão ao STF',
        failureHeadline: 'Câmara rejeita Escola sem Partido e adia o ensino domiciliar',
        risk: {
          chance: 0.3,
          impact: { approval: -1, sectors: { military: -2, middleClass: -2 } },
          headline: 'STF suspende Escola sem Partido por violar a liberdade de ensinar',
        },
      },
      {
        id: 'so-homeschooling-regulado',
        label: 'Legalizar só o ensino domiciliar regulado',
        description: 'Exige provas anuais e registro; agrada parte da base com menos atrito.',
        impact: { ideologySocial: 5, sectors: { military: 3, middleClass: 1, environmentalists: -4 } },
        legislative: 'ordinary',
        failureImpact: { congressSupport: -1 },
        headline: 'Lei regulamenta ensino domiciliar com avaliação anual obrigatória',
        failureHeadline: 'Projeto do ensino domiciliar é derrotado no plenário da Câmara',
      },
      {
        id: 'nao-apoiar-pacote-escolar',
        label: 'Não apoiar o pacote',
        description: 'Preserva a relação com educadores, mas a base conservadora reclama.',
        impact: { ideologySocial: -3, sectors: { military: -4, agribusiness: -2, environmentalists: 2 } },
        headline: 'Planalto abandona Escola sem Partido e bancada conservadora reage',
      },
    ],
  },
];
