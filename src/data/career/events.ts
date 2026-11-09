import type { CareerEvent } from '@/types';

/**
 * Acontecimentos da carreira: convites, brigas no partido, crises da gestão,
 * tentações e os escândalos que elas podem render mais tarde. Personagens
 * sempre fictícios. Cadeias de escândalo (flag da tentação → revelação → condenação):
 * - `propina-empreiteira` → `operacao-propina` (`propina-exposta`, `condenacao-propina`) → `cassacao-executivo`
 * - `rachadinha` → `rachadinha-denunciada` (`rachadinha-exposta`, `processo-cassacao`) → `processo-de-cassacao`
 * - `caixa-2-campanha` → `caixa-2-revelado` (`caixa-2-exposto`, `condenacao-eleitoral`)
 * - `emendas-suspeitas` → `emendas-investigadas` (`emendas-expostas`, `emendas-condenacao`)
 * - `candidatura-laranja` → `laranja-investigada` (`laranja-exposta`)
 * - qualquer condenação → `condenacao-ficha-limpa` (inelegível por 8 anos, `ficha-suja`)
 */
export const CAREER_EVENTS: CareerEvent[] = [
  // ─── Sem cargo: começo de carreira e vida partidária ────────────────────
  {
    id: 'convite-gabinete-vereador',
    category: 'oportunidade',
    title: 'Vaga no gabinete de um vereador',
    icon: '📎',
    description:
      'Um vereador do {partido} gostou do seu trabalho nos bairros e oferece uma vaga de assessor no gabinete. O salário é modesto, mas a porta da Câmara Municipal se abre.',
    conditions: [
      { kind: 'role', roles: ['sem-cargo'] },
      { kind: 'filiado', present: true },
    ],
    weight: 1.5,
    cooldown: 6,
    options: [
      {
        id: 'aceitar-vaga',
        label: 'Aceitar a vaga no gabinete',
        description: 'Aprende o ofício por dentro e ganha espaço no partido, mas passa a trabalhar para o mandato de outra pessoa.',
        impact: { partyInfluence: 2 },
        headline: '{nome} passa a integrar gabinete de vereador do {partido}',
        effect: { kind: 'appoint', appointmentId: 'assessor-parlamentar' },
      },
      {
        id: 'indicar-aliado',
        label: 'Indicar um aliado do bairro para a vaga',
        description: 'Fortalece sua rede de apoio sem abrir mão da liberdade, mas o vereador esperava você.',
        impact: { electoralBase: 3, partyInfluence: -1 },
        headline: '{nome} indica liderança comunitária para gabinete na Câmara',
      },
      {
        id: 'seguir-nas-ruas',
        label: 'Recusar e seguir no trabalho de rua',
        description: 'Mantém o contato direto com o eleitor, mas o partido nota a recusa.',
        impact: { localPopularity: 2, electoralBase: 1, partyInfluence: -1 },
        headline: '{nome} recusa cargo e diz que prefere o trabalho nos bairros',
      },
    ],
  },
  {
    id: 'briga-interna-partido',
    category: 'partido',
    title: 'Racha no diretório do partido',
    icon: '🥊',
    description:
      'Uma ala do {partido} acusa a direção de decidir tudo a portas fechadas. Os dois lados querem saber de que lado você está antes da próxima reunião.',
    conditions: [{ kind: 'filiado', present: true }],
    cooldown: 6,
    options: [
      {
        id: 'apoiar-direcao',
        label: 'Ficar com a direção do partido',
        description: 'Quem manda no partido lembra de quem ficou do lado certo, mas a militância vê submissão.',
        impact: { relations: { padrinho: 8 }, partyInfluence: 4, electoralBase: -2 },
        headline: '{nome} defende a direção do {partido} em meio a racha interno',
      },
      {
        id: 'apoiar-rebeldes',
        label: 'Apoiar a ala rebelde',
        description: 'Ganha a simpatia da militância. Se os rebeldes perderem, a direção não vai esquecer.',
        impact: { relations: { padrinho: -10, rival: 5 }, electoralBase: 3, localPopularity: 1, partyInfluence: -2 },
        risk: {
          chance: 0.4,
          impact: { partyInfluence: -5 },
          headline: 'Direção do {partido} vence disputa e isola aliados de {nome}',
        },
        headline: '{nome} assina manifesto da ala rebelde do {partido}',
      },
      {
        id: 'ficar-neutro',
        label: 'Ficar em cima do muro',
        description: 'Evita inimigos, mas ninguém conta com você na hora de dividir espaço.',
        impact: { partyInfluence: -1 },
        headline: '{nome} evita tomar lado na disputa interna do {partido}',
      },
    ],
  },
  {
    id: 'convite-outro-partido',
    category: 'partido',
    title: 'Outro partido bate à porta',
    icon: '🚪',
    description:
      'Sua popularidade chamou atenção. Um partido próximo das suas ideias oferece legenda garantida na próxima eleição, coisa que o {partido} ainda não prometeu.',
    conditions: [
      { kind: 'filiado', present: true },
      { kind: 'metric', metric: 'localPopularity', comparator: 'gte', value: 35 },
      { kind: 'metric', metric: 'partyInfluence', comparator: 'lte', value: 35 },
    ],
    cooldown: 8,
    options: [
      {
        id: 'trocar-de-partido',
        label: 'Aceitar e trocar de partido',
        description: 'Chega com legenda garantida, mas deixa para trás anos de relação e ganha fama de infiel.',
        impact: { reputation: -1 },
        headline: '{nome} deixa o {partido} com promessa de legenda garantida',
        effect: { kind: 'switch-party' },
      },
      {
        id: 'usar-para-negociar',
        label: 'Usar o convite para negociar espaço no {partido}',
        description: 'A direção sobe a sua cotação para não perder você, mas fica a desconfiança.',
        impact: { partyInfluence: 4, reputation: -1 },
        headline: 'Com convite de rivais na mesa, {nome} ganha espaço no {partido}',
      },
      {
        id: 'recusar-por-lealdade',
        label: 'Recusar por lealdade',
        description: 'A fidelidade é notada pela militância e pela imprensa, mas a legenda segue incerta.',
        impact: { reputation: 2, partyInfluence: 2 },
        headline: '{nome} recusa convite e reafirma lealdade ao {partido}',
      },
    ],
  },
  {
    id: 'lideranca-comunitaria-pede-apoio',
    category: 'oportunidade',
    title: 'Associação de moradores pede ajuda',
    icon: '🏘️',
    description:
      'A associação de moradores de um bairro esquecido de {cidade} luta por uma creche e procura alguém da política que abrace a causa de verdade.',
    conditions: [{ kind: 'role', roles: ['sem-cargo', 'nomeado'] }],
    cooldown: 6,
    options: [
      {
        id: 'abracar-a-causa',
        label: 'Abraçar a causa e liderar a mobilização',
        description: 'Ganha uma base fiel no bairro. Se a creche não sair, a frustração recai sobre você.',
        impact: { electoralBase: 5, localPopularity: 2 },
        risk: {
          chance: 0.3,
          impact: { localPopularity: -3, electoralBase: -2 },
          headline: 'Creche não sai do papel e moradores cobram {nome}',
        },
        headline: '{nome} lidera mobilização por creche em bairro de {cidade}',
      },
      {
        id: 'levar-ao-partido',
        label: 'Levar a demanda à direção do partido',
        description: 'O partido aparece como parceiro e você ganha pontos lá dentro, mas o bairro queria você na linha de frente.',
        impact: { partyInfluence: 3, electoralBase: 1 },
        headline: '{partido} adota pauta da creche levada por {nome}',
      },
      {
        id: 'declinar',
        label: 'Dizer que agora não dá',
        description: 'Preserva tempo para outras frentes, mas a notícia corre no bairro.',
        impact: { localPopularity: -1 },
        headline: 'Moradores reclamam da falta de apoio de políticos locais',
      },
    ],
  },
  {
    id: 'disputa-diretorio-municipal',
    category: 'partido',
    title: 'Eleição para o diretório municipal',
    icon: '🗳️',
    description:
      'O {partido} vai renovar o diretório em {cidade}. Lançar uma chapa própria pode colocar você no comando local, ou mostrar que ainda não tem votos lá dentro.',
    conditions: [
      { kind: 'filiado', present: true },
      { kind: 'metric', metric: 'partyInfluence', comparator: 'gte', value: 20 },
      { kind: 'metric', metric: 'partyInfluence', comparator: 'lte', value: 60 },
    ],
    cooldown: 8,
    options: [
      {
        id: 'lancar-chapa',
        label: 'Lançar chapa própria',
        description: 'Se vencer, você passa a falar pelo partido na cidade. Se perder, vira alvo da direção.',
        impact: { partyInfluence: 7, electoralBase: 1 },
        risk: {
          chance: 0.45,
          impact: { partyInfluence: -10 },
          headline: 'Chapa de {nome} perde a disputa pelo diretório do {partido}',
        },
        headline: 'Chapa de {nome} assume o diretório do {partido} em {cidade}',
      },
      {
        id: 'compor-com-direcao',
        label: 'Compor com a chapa da direção',
        description: 'Ganha uma cadeira no diretório sem risco, mas como coadjuvante.',
        impact: { partyInfluence: 3 },
        headline: '{nome} ganha vaga no diretório do {partido} em acordo',
      },
      {
        id: 'ficar-fora',
        label: 'Ficar fora da disputa',
        description: 'Evita desgaste, mas outros ocupam o espaço que poderia ser seu.',
        impact: { partyInfluence: -1 },
        headline: '{partido} renova diretório municipal sem disputa',
      },
    ],
  },
  {
    id: 'candidatura-laranja',
    category: 'escandalo',
    title: 'Proposta de candidatura de fachada',
    icon: '🍊',
    description:
      'Um operador de campanha da cidade pede que você registre uma candidatura só no papel, para cumprir a cota e desviar verba do fundo eleitoral para outros candidatos.',
    conditions: [
      { kind: 'filiado', present: true },
      { kind: 'election-semester', present: true },
      { kind: 'role', roles: ['sem-cargo', 'nomeado'] },
    ],
    cooldown: 8,
    options: [
      {
        id: 'recusar-laranja',
        label: 'Recusar sem alarde',
        description: 'Fica longe de problemas, mas o operador não gosta de ouvir "não".',
        impact: { reputation: 2, partyInfluence: -2 },
        headline: 'Partidos correm para fechar listas antes do prazo em {cidade}',
      },
      {
        id: 'aceitar-laranja',
        label: 'Aceitar emprestar o nome',
        description: 'O operador fica devendo um favor. Mas a Justiça Eleitoral vem caçando laranjas.',
        impact: { partyInfluence: 5 },
        headline: 'Listas de candidatos a vereador fecham no prazo em {cidade}',
        flags: ['candidatura-laranja'],
      },
      {
        id: 'denunciar-laranja',
        label: 'Denunciar o esquema ao Ministério Público',
        description: 'Ganha fama de honestidade, mas compra briga com quem manda na política local.',
        impact: { reputation: 6, nationalRecognition: 2, partyInfluence: -8 },
        headline: '{nome} denuncia esquema de candidaturas laranjas em {cidade}',
      },
    ],
  },
  {
    id: 'laranja-investigada',
    category: 'escandalo',
    title: 'Justiça Eleitoral investiga laranjas',
    icon: '🔎',
    description:
      'O Ministério Público Eleitoral descobriu candidaturas em {cidade} que não tiveram nenhum voto nem gasto real. Seu nome está na lista.',
    conditions: [
      { kind: 'flag', flag: 'candidatura-laranja', present: true },
      { kind: 'flag', flag: 'laranja-exposta', present: false },
    ],
    weight: 2,
    options: [
      {
        id: 'colaborar-mpe',
        label: 'Contar tudo aos promotores',
        description: 'Sai como testemunha e limpa parte da imagem, mas os antigos aliados viram as costas.',
        impact: { reputation: -2, partyInfluence: -8 },
        headline: '{nome} colabora com investigação de candidaturas laranjas',
        flags: ['laranja-exposta'],
      },
      {
        id: 'negar-laranja',
        label: 'Dizer que a campanha foi real',
        description: 'Protege os antigos aliados, mas as provas são fracas para o seu lado.',
        impact: { reputation: -5, partyInfluence: 2 },
        risk: {
          chance: 0.4,
          impact: { reputation: -6, localPopularity: -3 },
          headline: 'Laudo mostra que campanha de {nome} nunca existiu',
        },
        headline: '{nome} nega ter sido candidatura de fachada',
        flags: ['laranja-exposta'],
      },
    ],
  },
  {
    id: 'bolsa-escola-de-governo',
    category: 'oportunidade',
    title: 'Bolsa numa escola de governo',
    icon: '🎓',
    description:
      'Uma escola de formação de lideranças públicas oferece uma bolsa de um semestre, com aulas de gestão, orçamento e políticas públicas.',
    conditions: [
      { kind: 'role', roles: ['sem-cargo', 'nomeado'] },
      { kind: 'age', comparator: 'lte', value: 45 },
    ],
    cooldown: 10,
    options: [
      {
        id: 'fazer-curso',
        label: 'Fazer o curso',
        description: 'Ganha preparo e contatos de outros estados, mas some um pouco das ruas.',
        impact: { reputation: 4, nationalRecognition: 1, electoralBase: -1 },
        headline: '{nome} conclui formação em gestão pública',
      },
      {
        id: 'recusar-curso',
        label: 'Recusar e manter a agenda local',
        description: 'Nada muda: a prioridade segue sendo o eleitor da cidade.',
        impact: { localPopularity: 1 },
        headline: 'Escola de governo abre turma para novas lideranças',
      },
    ],
  },
  {
    id: 'doenca-na-familia',
    category: 'pessoal',
    title: 'Doença na família',
    icon: '🏥',
    description:
      'Uma pessoa próxima da sua família adoece e vai precisar de acompanhamento nos próximos meses. A agenda política terá de esperar, ou não.',
    cooldown: 10,
    weight: 0.6,
    options: [
      {
        id: 'pausar-agenda',
        label: 'Pausar a agenda e cuidar da família',
        description: 'O eleitor entende e respeita, mas a rede de apoio esfria sem você por perto.',
        impact: { reputation: 2, localPopularity: -2, electoralBase: -3 },
        headline: '{nome} reduz agenda pública por motivos familiares',
      },
      {
        id: 'manter-agenda',
        label: 'Manter a agenda com ajuda de parentes',
        description: 'Não perde espaço na política, mas o cansaço pode cobrar o preço.',
        impact: { partyInfluence: 1 },
        risk: {
          chance: 0.35,
          impact: { localPopularity: -3, reputation: -1 },
          headline: 'Com agenda pesada, {nome} cancela compromissos de última hora',
        },
        headline: '{nome} mantém a agenda apesar de problema na família',
      },
    ],
  },

  // ─── Cargos de nomeação ─────────────────────────────────────────────────
  {
    id: 'convite-secretaria-municipal',
    category: 'oportunidade',
    title: 'Convite para uma secretaria da prefeitura',
    icon: '🏢',
    description:
      'A prefeitura de {cidade} precisa de um nome para comandar uma secretaria e o {partido} indicou você. O cargo dá vitrine, mas os problemas da pasta passam a ser seus.',
    conditions: [
      { kind: 'government', level: 'municipal', relation: ['own', 'ally'] },
      { kind: 'metric', metric: 'partyInfluence', comparator: 'gte', value: 35 },
      {
        kind: 'any',
        conditions: [
          { kind: 'role', roles: ['sem-cargo'] },
          { kind: 'appointment', appointments: ['assessor-parlamentar', 'assessor-prefeitura'] },
        ],
      },
    ],
    cooldown: 6,
    options: [
      {
        id: 'aceitar-secretaria',
        label: 'Aceitar a secretaria',
        description: 'Passa a ter caneta, equipe e orçamento. A cidade inteira vai saber o seu nome.',
        impact: { localPopularity: 2 },
        headline: '{nome} assume secretaria na prefeitura de {cidade}',
        effect: { kind: 'appoint', appointmentId: 'secretario-municipal' },
      },
      {
        id: 'recusar-secretaria',
        label: 'Recusar para não se amarrar ao governo',
        description: 'Fica livre para criticar a prefeitura se precisar, mas o partido estranha.',
        impact: { reputation: 1, partyInfluence: -3 },
        headline: '{nome} recusa secretaria e mantém distância da prefeitura',
      },
    ],
  },
  {
    id: 'convite-secretaria-estadual',
    category: 'oportunidade',
    title: 'Convite do governo do estado',
    icon: '🏛️',
    description:
      'O governo do {estado} quer você no secretariado. É a chance de ser conhecido no estado inteiro, longe da sua base em {cidade}.',
    conditions: [
      { kind: 'government', level: 'estadual', relation: ['own', 'ally'] },
      { kind: 'metric', metric: 'partyInfluence', comparator: 'gte', value: 50 },
      {
        kind: 'any',
        conditions: [
          { kind: 'role', roles: ['sem-cargo'] },
          {
            kind: 'appointment',
            appointments: ['assessor-parlamentar', 'assessor-prefeitura', 'chefe-de-gabinete', 'secretario-municipal'],
          },
        ],
      },
    ],
    cooldown: 6,
    options: [
      {
        id: 'aceitar-secretaria-estadual',
        label: 'Aceitar a secretaria estadual',
        description: 'O nome ganha o estado inteiro, mas a cidade sente sua ausência.',
        impact: { nationalRecognition: 2, localPopularity: -1 },
        headline: 'Governo do {estado} anuncia {nome} no secretariado',
        effect: { kind: 'appoint', appointmentId: 'secretario-estadual' },
      },
      {
        id: 'recusar-secretaria-estadual',
        label: 'Agradecer e ficar em {cidade}',
        description: 'Mantém o trabalho de base, mas o governador lembrará da recusa.',
        impact: { localPopularity: 1, partyInfluence: -2 },
        headline: '{nome} recusa convite do governo do {estado}',
      },
    ],
  },
  {
    id: 'convite-ministerio',
    category: 'oportunidade',
    title: 'Ligação do Palácio do Planalto',
    icon: '🇧🇷',
    description:
      'O governo federal monta uma reforma ministerial e o seu nome entrou na lista. Aceitar coloca você no centro do poder, com o desgaste do governo junto.',
    conditions: [
      { kind: 'government', level: 'federal', relation: ['own', 'ally'] },
      { kind: 'metric', metric: 'partyInfluence', comparator: 'gte', value: 70 },
      {
        kind: 'any',
        conditions: [
          { kind: 'role', roles: ['sem-cargo'] },
          { kind: 'appointment', appointments: ['chefe-de-gabinete', 'secretario-municipal', 'secretario-estadual'] },
        ],
      },
    ],
    cooldown: 8,
    options: [
      {
        id: 'aceitar-ministerio',
        label: 'Aceitar o ministério',
        description: 'Projeção nacional imediata. Mas cada crise do governo terá seu rosto.',
        impact: { nationalRecognition: 3 },
        headline: '{nome} assume um ministério em Brasília',
        effect: { kind: 'appoint', appointmentId: 'ministro' },
      },
      {
        id: 'recusar-ministerio',
        label: 'Recusar e preservar a imagem',
        description: 'Fica longe do desgaste do governo, mas o partido perde uma pasta.',
        impact: { reputation: 2, partyInfluence: -4 },
        headline: '{nome} recusa ministério e frustra a cúpula do {partido}',
      },
    ],
  },
  {
    id: 'crise-na-pasta',
    category: 'gestao',
    title: 'Crise na sua pasta',
    icon: '🚨',
    description:
      'Uma reportagem mostra filas enormes e serviços parados na área que você comanda. A oposição pede sua cabeça e o chefe do governo quer uma resposta até amanhã.',
    conditions: [{ kind: 'appointment', appointments: ['secretario-municipal', 'secretario-estadual', 'ministro'] }],
    cooldown: 6,
    options: [
      {
        id: 'assumir-e-apresentar-plano',
        label: 'Assumir o problema e apresentar um plano',
        description: 'A franqueza é valorizada, mas o governo não gosta de ver a crise confirmada.',
        impact: { reputation: 3, partyInfluence: -1, localPopularity: -1 },
        headline: '{nome} admite falhas e apresenta plano de emergência',
      },
      {
        id: 'culpar-gestao-anterior',
        label: 'Culpar a gestão anterior',
        description: 'Protege o governo por agora. Se os números antigos forem bons, a desculpa vira piada.',
        impact: { partyInfluence: 2, reputation: -2 },
        risk: {
          chance: 0.35,
          impact: { reputation: -4, localPopularity: -2 },
          headline: 'Dados desmentem {nome}: crise na pasta é recente',
        },
        headline: '{nome} atribui crise na pasta à gestão anterior',
      },
      {
        id: 'pedir-demissao-crise',
        label: 'Pedir demissão',
        description: 'Sai com a imagem preservada, mas perde o cargo e o partido perde a pasta.',
        impact: { reputation: 3, partyInfluence: -4 },
        headline: '{nome} pede demissão em meio a crise na pasta',
        effect: { kind: 'leave-appointment' },
      },
    ],
  },
  {
    id: 'chefe-pede-lealdade',
    category: 'partido',
    title: 'O chefe pede uma defesa pública',
    icon: '🫡',
    description:
      'Seu chefe político foi acusado de favorecer um aliado numa licitação e pede que você vá à imprensa defendê-lo. Ninguém sabe ainda o que as investigações vão mostrar.',
    conditions: [{ kind: 'role', roles: ['nomeado'] }],
    cooldown: 8,
    options: [
      {
        id: 'defender-chefe',
        label: 'Defender o chefe publicamente',
        description: 'Lealdade é moeda forte na política. Se as provas aparecerem, sua imagem afunda junto.',
        impact: { partyInfluence: 4 },
        risk: {
          chance: 0.35,
          impact: { reputation: -6 },
          headline: 'Provas contra chefe político respingam em {nome}',
        },
        headline: '{nome} sai em defesa do chefe acusado de favorecimento',
      },
      {
        id: 'silencio-prudente',
        label: 'Dizer que confia na Justiça',
        description: 'Não se compromete, mas o chefe percebe a falta de empenho.',
        impact: { partyInfluence: -2, reputation: 1 },
        headline: '{nome} evita comentar acusação contra o chefe político',
      },
      {
        id: 'sair-do-cargo',
        label: 'Deixar o cargo para não se contaminar',
        description: 'Preserva a imagem, mas perde o posto e um padrinho importante.',
        impact: { reputation: 3, partyInfluence: -5 },
        headline: '{nome} deixa o cargo após acusação contra o chefe',
        effect: { kind: 'leave-appointment' },
      },
    ],
  },
  {
    id: 'chefe-de-gabinete-investigado',
    category: 'escandalo',
    title: 'Parlamentar do gabinete é investigado',
    icon: '🕵️',
    description:
      'A polícia cumpre mandados no gabinete onde você trabalha. O parlamentar diz ser perseguição, mas os jornalistas já ligam para o seu celular.',
    conditions: [{ kind: 'appointment', appointments: ['assessor-parlamentar', 'chefe-de-gabinete'] }],
    cooldown: 8,
    options: [
      {
        id: 'sair-do-gabinete',
        label: 'Pedir exoneração imediatamente',
        description: 'Fica longe do escândalo, mas perde o emprego e o padrinho.',
        impact: { reputation: 2, partyInfluence: -3 },
        headline: '{nome} deixa gabinete alvo de operação policial',
        effect: { kind: 'leave-appointment' },
      },
      {
        id: 'ficar-e-defender',
        label: 'Ficar e defender o parlamentar',
        description: 'O partido aprecia a lealdade. A imprensa, nem tanto.',
        impact: { partyInfluence: 3, reputation: -4 },
        headline: '{nome} defende parlamentar alvo de busca da polícia',
      },
      {
        id: 'colaborar-policia',
        label: 'Colaborar com a investigação',
        description: 'Ganha fama de honestidade fora do partido, mas lá dentro a atitude é vista como traição.',
        impact: { reputation: 5, nationalRecognition: 1, partyInfluence: -7 },
        headline: '{nome} presta depoimento e entrega documentos à polícia',
        effect: { kind: 'leave-appointment' },
      },
    ],
  },
  {
    id: 'trabalho-reconhecido-na-pasta',
    category: 'midia',
    title: 'Seu trabalho vira notícia',
    icon: '📰',
    description:
      'Um programa que você tocou no cargo deu resultado e virou reportagem elogiosa. O chefe quer aparecer na foto da entrega.',
    conditions: [{ kind: 'role', roles: ['nomeado'] }],
    cooldown: 6,
    options: [
      {
        id: 'dividir-credito',
        label: 'Dividir o crédito com o chefe',
        description: 'O chefe agradece e lembra de você na hora das indicações.',
        impact: { partyInfluence: 4, localPopularity: 1 },
        headline: 'Programa tocado por {nome} é elogiado e governo comemora',
      },
      {
        id: 'aparecer-sozinho',
        label: 'Aparecer como responsável pelo resultado',
        description: 'O eleitor guarda o seu nome. O chefe guarda a mágoa.',
        impact: { localPopularity: 4, reputation: 1, partyInfluence: -3 },
        headline: '{nome} apresenta resultados do programa que comandou',
      },
    ],
  },
  {
    id: 'propina-empreiteira-oferta',
    category: 'escandalo',
    title: 'Uma conversa reservada com a empreiteira',
    icon: '💼',
    description:
      'O dono de uma empreiteira pede um encontro discreto. Em troca de ajuda numa licitação, oferece dinheiro para sua próxima campanha, sem recibo.',
    conditions: [
      {
        kind: 'any',
        conditions: [
          { kind: 'role', roles: ['executivo'] },
          { kind: 'appointment', appointments: ['assessor-prefeitura', 'secretario-municipal', 'secretario-estadual', 'ministro'] },
        ],
      },
      { kind: 'flag', flag: 'propina-empreiteira', present: false },
    ],
    cooldown: 10,
    options: [
      {
        id: 'recusar-e-denunciar',
        label: 'Recusar e denunciar à polícia',
        description: 'Ganha fama de honestidade, mas faz inimigos entre os financiadores de campanha.',
        impact: { reputation: 5, nationalRecognition: 1, partyInfluence: -2 },
        headline: '{nome} denuncia empreiteira que ofereceu propina',
      },
      {
        id: 'recusar-em-silencio',
        label: 'Recusar em silêncio',
        description: 'Nada acontece, e ninguém fica sabendo.',
        impact: { reputation: 1 },
        headline: 'Licitação de obra em {cidade} recebe cinco propostas',
      },
      {
        id: 'aceitar-propina',
        label: 'Aceitar o dinheiro "para a campanha"',
        description: 'Caixa farto para a próxima eleição e aliados satisfeitos. Mas operações da polícia costumam chegar.',
        impact: { electoralBase: 4, partyInfluence: 3 },
        headline: 'Empreiteira vence licitação de obra em {cidade}',
        flags: ['propina-empreiteira'],
      },
    ],
  },

  // ─── Mandato legislativo ────────────────────────────────────────────────
  {
    id: 'votacao-polemica',
    category: 'mandato',
    title: 'Votação que divide a sua base',
    icon: '🗳️',
    description:
      'Um projeto polêmico chega ao plenário. O {partido} fechou questão a favor, mas os eleitores que votaram em você estão contra.',
    conditions: [{ kind: 'role', roles: ['legislativo'] }],
    cooldown: 4,
    options: [
      {
        id: 'votar-com-partido',
        label: 'Votar com o partido',
        description: 'A liderança agradece. A base eleitoral reclama nas redes.',
        impact: { partyInfluence: 4, localPopularity: -2, electoralBase: -1 },
        headline: '{nome} segue o {partido} e vota a favor de projeto polêmico',
      },
      {
        id: 'votar-com-base',
        label: 'Votar com os seus eleitores',
        description: 'O eleitor reconhece a coerência, mas o partido pode punir quem desobedece.',
        impact: { localPopularity: 3, electoralBase: 2, partyInfluence: -4 },
        headline: '{nome} contraria o {partido} e vota contra projeto polêmico',
      },
      {
        id: 'abster-se',
        label: 'Se ausentar da votação',
        description: 'Evita o desgaste com os dois lados, mas pega mal com todo mundo.',
        impact: { reputation: -2 },
        headline: '{nome} falta à votação mais polêmica do ano',
      },
    ],
  },
  {
    id: 'cargo-em-troca-de-voto',
    category: 'mandato',
    title: 'Cargos em troca de voto',
    icon: '🤝',
    description:
      'O governo precisa de votos para aprovar um projeto e oferece cargos para pessoas indicadas por você. Basta votar a favor e não fazer perguntas.',
    conditions: [{ kind: 'role', roles: ['legislativo'] }],
    cooldown: 6,
    options: [
      {
        id: 'aceitar-cargos',
        label: 'Aceitar os cargos e votar a favor',
        description: 'Seus aliados ganham empregos e você ganha força. A imprensa costuma descobrir esses acordos.',
        impact: { partyInfluence: 4, electoralBase: 3, reputation: -3 },
        headline: 'Aliados de {nome} ganham cargos após votação favorável',
      },
      {
        id: 'recusar-cargos',
        label: 'Recusar e votar por convicção',
        description: 'Mantém a independência, mas o governo passa a ignorar seus pedidos.',
        impact: { reputation: 3, partyInfluence: -2 },
        headline: '{nome} recusa cargos e vota conforme a própria convicção',
      },
      {
        id: 'denunciar-na-tribuna',
        label: 'Denunciar a oferta na tribuna',
        description: 'Vira notícia nacional, mas fecha portas com o governo e com parte do partido.',
        impact: { nationalRecognition: 4, reputation: 3, partyInfluence: -5 },
        headline: '{nome} denuncia na tribuna oferta de cargos por votos',
      },
    ],
  },
  {
    id: 'pedido-de-emenda',
    category: 'mandato',
    title: 'Prefeito do interior pede emenda',
    icon: '💸',
    description:
      'Um prefeito pede uma emenda parlamentar para reformar o hospital da cidade. Um assessor sugere mandar o dinheiro por uma ONG de um aliado, "para agilizar".',
    conditions: [{ kind: 'office', offices: ['deputado-estadual', 'deputado-federal', 'senador'] }],
    cooldown: 4,
    options: [
      {
        id: 'mandar-emenda',
        label: 'Mandar a emenda direto para a prefeitura',
        description: 'Caminho legal e transparente. O prefeito vira cabo eleitoral.',
        impact: { electoralBase: 4, partyInfluence: 1 },
        headline: 'Emenda de {nome} garante reforma de hospital no interior',
      },
      {
        id: 'mandar-via-ong',
        label: 'Mandar pela ONG do aliado',
        description: 'Rende mais apoio político agora. Emendas por ONGs são alvo frequente de auditoria.',
        impact: { electoralBase: 6, partyInfluence: 2 },
        headline: 'ONG ligada a aliado de {nome} recebe verba de emenda',
        flags: ['emendas-suspeitas'],
      },
      {
        id: 'negar-emenda',
        label: 'Negar e priorizar outras cidades',
        description: 'Concentra a verba onde já tem votos, mas perde um aliado no interior.',
        impact: { electoralBase: -2, localPopularity: 1 },
        headline: 'Prefeito do interior reclama de falta de emendas',
      },
    ],
  },
  {
    id: 'relatoria-cpi',
    category: 'mandato',
    title: 'Relatoria de uma CPI',
    icon: '🔍',
    description:
      'Uma CPI vai investigar contratos suspeitos e a relatoria está em jogo. O relator ganha holofotes, mas também a pressão de quem tem algo a esconder.',
    conditions: [{ kind: 'office', offices: ['deputado-estadual', 'deputado-federal', 'senador'] }],
    cooldown: 8,
    options: [
      {
        id: 'relatorio-duro',
        label: 'Assumir e fazer um relatório duro',
        description: 'Holofote nacional e fama de independente. Aliados do governo vão dificultar sua vida.',
        impact: { nationalRecognition: 5, reputation: 3, partyInfluence: -3 },
        risk: {
          chance: 0.3,
          impact: { partyInfluence: -4, localPopularity: -1 },
          headline: 'Relatório de {nome} é derrubado e CPI termina em pizza',
        },
        headline: 'Relatório de {nome} pede indiciamento de envolvidos',
      },
      {
        id: 'relatorio-acordado',
        label: 'Assumir e entregar um relatório acordado',
        description: 'Os caciques agradecem a moderação. A imprensa fala em "acordão".',
        impact: { partyInfluence: 5, nationalRecognition: 2, reputation: -3 },
        headline: 'CPI aprova relatório brando de {nome}',
      },
      {
        id: 'recusar-relatoria',
        label: 'Ficar fora da CPI',
        description: 'Evita brigas, mas deixa passar uma vitrine rara.',
        impact: { partyInfluence: 1 },
        headline: 'CPI dos contratos é instalada sob forte disputa',
      },
    ],
  },
  {
    id: 'rachadinha-proposta',
    category: 'escandalo',
    title: 'Proposta indecente no gabinete',
    icon: '🤫',
    description:
      'Um assessor antigo sugere contratar mais gente com salários altos e pedir que devolvam parte do dinheiro "para a próxima campanha". Diz que todo mundo faz.',
    conditions: [
      { kind: 'role', roles: ['legislativo'] },
      { kind: 'flag', flag: 'rachadinha', present: false },
    ],
    cooldown: 10,
    options: [
      {
        id: 'demitir-assessor',
        label: 'Demitir o assessor na hora',
        description: 'Gabinete limpo. O ex-assessor sai falando mal de você pela cidade.',
        impact: { reputation: 3, electoralBase: -1 },
        headline: '{nome} renova a equipe do gabinete',
      },
      {
        id: 'afastar-discretamente',
        label: 'Recusar e afastar o assessor aos poucos',
        description: 'Evita confusão e mantém as mãos limpas.',
        impact: { reputation: 1 },
        headline: 'Gabinete de {nome} publica lista de servidores',
      },
      {
        id: 'aceitar-rachadinha',
        label: 'Aceitar o esquema',
        description: 'Dinheiro extra para a campanha e cabos eleitorais pagos. Ex-assessores costumam falar.',
        impact: { electoralBase: 4, partyInfluence: 2 },
        headline: 'Gabinete de {nome} contrata novos assessores',
        flags: ['rachadinha'],
      },
    ],
  },
  {
    id: 'projeto-na-pauta',
    category: 'mandato',
    title: 'Seu projeto entra na pauta',
    icon: '📜',
    description:
      'Um projeto de sua autoria finalmente vai a votação. O governo topa apoiar, desde que você aceite mudanças que diluem a ideia original.',
    conditions: [{ kind: 'role', roles: ['legislativo'] }],
    cooldown: 4,
    options: [
      {
        id: 'ceder-e-aprovar',
        label: 'Aceitar as mudanças e aprovar',
        description: 'Lei aprovada com seu nome, ainda que mais fraca. O governo fica devendo.',
        impact: { localPopularity: 3, partyInfluence: 2, reputation: 1 },
        headline: 'Projeto de {nome} é aprovado com mudanças',
      },
      {
        id: 'manter-texto',
        label: 'Manter o texto original',
        description: 'Se passar, é uma vitória grande. Sem o apoio do governo, pode cair.',
        impact: { localPopularity: 5, reputation: 3 },
        risk: {
          chance: 0.45,
          impact: { localPopularity: -5, reputation: -2, partyInfluence: -1 },
          headline: 'Projeto de {nome} é derrotado em plenário',
        },
        headline: 'Projeto de {nome} é aprovado sem alterações',
      },
    ],
  },
  {
    id: 'gastos-de-viagem-revelados',
    category: 'midia',
    title: 'Jornal revela gastos com viagens',
    icon: '✈️',
    description:
      'Uma reportagem lista as viagens pagas com verba do seu gabinete. Nada ilegal, mas a foto num resort durante uma "missão oficial" viralizou.',
    conditions: [{ kind: 'role', roles: ['legislativo'] }],
    cooldown: 8,
    options: [
      {
        id: 'devolver-dinheiro',
        label: 'Devolver o dinheiro das viagens',
        description: 'Encerra o assunto rápido, ainda que soe como confissão.',
        impact: { reputation: 1, localPopularity: -1 },
        headline: '{nome} devolve verba de viagens após reportagem',
      },
      {
        id: 'justificar-viagens',
        label: 'Justificar as viagens como trabalho',
        description: 'Não admite erro. Se surgirem mais fotos, o estrago aumenta.',
        impact: { reputation: -2 },
        risk: {
          chance: 0.35,
          impact: { reputation: -4, localPopularity: -3 },
          headline: 'Novas fotos complicam explicações de {nome} sobre viagens',
        },
        headline: '{nome} defende viagens: "missões de trabalho"',
      },
      {
        id: 'cortar-propria-verba',
        label: 'Cortar a própria verba de gabinete',
        description: 'Gesto forte para o eleitor, mas colegas acham que você quer aparecer.',
        impact: { reputation: 4, localPopularity: 2, partyInfluence: -2 },
        headline: '{nome} corta a própria verba de gabinete pela metade',
      },
    ],
  },

  // ─── Gestão: prefeitos e governadores ───────────────────────────────────
  {
    id: 'enchente-na-cidade',
    category: 'gestao',
    title: 'Chuvas alagam bairros inteiros',
    icon: '🌧️',
    description:
      'Uma semana de temporais deixa ruas debaixo d\'água e centenas de famílias desabrigadas. As câmeras de TV procuram quem vai responder pela tragédia.',
    conditions: [{ kind: 'role', roles: ['executivo'] }],
    cooldown: 6,
    options: [
      {
        id: 'emergencia-e-presenca',
        label: 'Decretar emergência e ir às áreas atingidas',
        description: 'Presença e socorro rápido acalmam a população, mas o gasto pesa nas contas.',
        impact: { approval: 4, localPopularity: 3, admin: { contas: -6, infraestrutura: -3 } },
        headline: '{nome} decreta emergência e acompanha resgates nas áreas alagadas',
      },
      {
        id: 'pedir-ajuda',
        label: 'Pedir socorro aos outros governos',
        description: 'Divide a conta, mas o dinheiro demora e a população quer ação agora.',
        impact: { approval: 1, partyInfluence: 1, admin: { contas: -2, infraestrutura: -4 } },
        headline: '{nome} pede verba de emergência após chuvas',
      },
      {
        id: 'obras-de-drenagem',
        label: 'Anunciar um grande plano de drenagem',
        description: 'Resolve o problema de vez, mas leva tempo e custa caro. No curto prazo, críticas.',
        impact: { approval: -2, admin: { contas: -10, infraestrutura: 8 } },
        headline: '{nome} anuncia plano bilionário contra enchentes',
      },
    ],
  },
  {
    id: 'greve-de-professores',
    category: 'gestao',
    title: 'Professores entram em greve',
    icon: '✊',
    description:
      'Os professores da rede pública cruzam os braços por reajuste salarial. As escolas estão fechadas e os pais pressionam por uma solução.',
    conditions: [{ kind: 'role', roles: ['executivo'] }],
    cooldown: 6,
    options: [
      {
        id: 'conceder-reajuste',
        label: 'Conceder o reajuste pedido',
        description: 'Fim da greve e professores satisfeitos, mas a folha de pagamento pesa nas contas.',
        impact: { approval: 2, electoralBase: 2, admin: { educacao: 4, contas: -8 } },
        headline: '{nome} concede reajuste e professores encerram greve',
      },
      {
        id: 'negociar-parcelado',
        label: 'Negociar um reajuste parcelado',
        description: 'Solução de meio-termo: a greve acaba devagar e ninguém sai totalmente feliz.',
        impact: { admin: { educacao: 1, contas: -3 } },
        headline: 'Acordo parcelado põe fim à greve de professores',
      },
      {
        id: 'cortar-ponto',
        label: 'Cortar o ponto dos grevistas',
        description: 'Preserva o caixa, mas a briga com a categoria deixa marcas nas escolas e nas urnas.',
        impact: { approval: -4, electoralBase: -2, admin: { educacao: -5, contas: 2 } },
        headline: '{nome} corta o ponto e greve de professores se acirra',
      },
    ],
  },
  {
    id: 'falta-de-remedios',
    category: 'gestao',
    title: 'Faltam remédios nos postos',
    icon: '💊',
    description:
      'Os postos de saúde ficaram sem remédios básicos e as farmácias populares têm filas na porta. Um fornecedor oferece entrega imediata sem licitação.',
    conditions: [{ kind: 'role', roles: ['executivo'] }],
    cooldown: 6,
    options: [
      {
        id: 'compra-emergencial',
        label: 'Comprar sem licitação, em caráter emergencial',
        description: 'Os remédios chegam em dias. Compras de urgência atraem fiscalização.',
        impact: { approval: 2, admin: { saude: 6, contas: -5 } },
        risk: {
          chance: 0.25,
          impact: { reputation: -5, approval: -2 },
          headline: 'Tribunal de Contas aponta sobrepreço em compra de remédios',
        },
        headline: '{nome} faz compra emergencial e abastece postos de saúde',
      },
      {
        id: 'remanejar-verba',
        label: 'Tirar verba da educação para a saúde',
        description: 'Resolve a falta sem gastar mais, mas a conta aparece nas escolas.',
        impact: { admin: { saude: 3, educacao: -3 } },
        headline: 'Gestão de {nome} remaneja verba para comprar remédios',
      },
      {
        id: 'culpar-fornecedor',
        label: 'Culpar o fornecedor e abrir processo',
        description: 'Não gasta nada agora, mas os postos seguem vazios por mais tempo.',
        impact: { approval: -3, admin: { saude: -2 } },
        headline: '{nome} culpa fornecedor por falta de remédios nos postos',
      },
    ],
  },
  {
    id: 'escandalo-na-secretaria',
    category: 'escandalo',
    title: 'Secretário flagrado em esquema',
    icon: '📹',
    description:
      'Um vídeo mostra um secretário do seu governo recebendo dinheiro de um empresário. Ele é indicação de um partido aliado importante.',
    conditions: [{ kind: 'role', roles: ['executivo'] }],
    cooldown: 8,
    options: [
      {
        id: 'demitir-e-investigar',
        label: 'Demitir na hora e pedir investigação',
        description: 'Mostra pulso firme. O partido aliado ameaça deixar a base.',
        impact: { reputation: 4, approval: 1, partyInfluence: -3 },
        headline: '{nome} demite secretário flagrado e pede investigação',
      },
      {
        id: 'defender-secretario',
        label: 'Defender o secretário',
        description: 'Segura o aliado, mas a imagem do governo vai para o chão.',
        impact: { partyInfluence: 3, reputation: -6, approval: -4 },
        headline: '{nome} mantém secretário flagrado em vídeo',
      },
      {
        id: 'esperar-justica',
        label: 'Afastar e esperar a Justiça',
        description: 'Meio-termo que não agrada ninguém, mas evita rupturas.',
        impact: { reputation: -1, approval: -2 },
        headline: 'Secretário é afastado; {nome} diz aguardar a Justiça',
      },
    ],
  },
  {
    id: 'repasse-cortado',
    category: 'gestao',
    title: 'Verbas de outro governo são cortadas',
    icon: '✂️',
    description:
      'Um governo de oposição ao seu congelou convênios e repasses para obras da sua gestão. Os aliados dizem que é retaliação política.',
    conditions: [
      { kind: 'role', roles: ['executivo'] },
      {
        kind: 'any',
        conditions: [
          { kind: 'government', level: 'federal', relation: ['opposition'] },
          { kind: 'government', level: 'estadual', relation: ['opposition'] },
        ],
      },
    ],
    cooldown: 6,
    options: [
      {
        id: 'denunciar-retaliacao',
        label: 'Denunciar a retaliação na imprensa',
        description: 'Vira notícia e mobiliza a base, mas a verba não volta tão cedo.',
        impact: { nationalRecognition: 3, localPopularity: 2, admin: { contas: -4 } },
        headline: '{nome} acusa governo de retaliação e corte de verbas',
      },
      {
        id: 'negociar-repasse',
        label: 'Negociar em silêncio',
        description: 'A verba volta em parte, mas a militância acha que você se curvou.',
        impact: { electoralBase: -2, partyInfluence: -1, admin: { contas: 2 } },
        headline: 'Após negociação, repasses à gestão de {nome} são liberados',
      },
      {
        id: 'ir-a-justica',
        label: 'Ir à Justiça para liberar o dinheiro',
        description: 'Pode garantir a verba inteira, mas o processo é incerto.',
        impact: { reputation: 1, admin: { contas: 4 } },
        risk: {
          chance: 0.45,
          impact: { approval: -2, admin: { contas: -6 } },
          headline: 'Justiça nega pedido de {nome} e obras ficam paradas',
        },
        headline: 'Justiça manda liberar repasses à gestão de {nome}',
      },
    ],
  },
  {
    id: 'visita-de-aliado',
    category: 'oportunidade',
    title: 'Visita de um aliado poderoso',
    icon: '🤝',
    description:
      'O governo federal, do mesmo campo político que o seu, quer anunciar obras na sua região e propõe dividir o palanque na cerimônia.',
    conditions: [
      { kind: 'role', roles: ['executivo'] },
      { kind: 'government', level: 'federal', relation: ['own', 'ally'] },
    ],
    cooldown: 6,
    options: [
      {
        id: 'dividir-palanque',
        label: 'Dividir o palanque',
        description: 'Verba garantida e foto com o poder. Se o governo federal estiver mal, a imagem respinga.',
        impact: { approval: 2, partyInfluence: 2, nationalRecognition: 1, admin: { contas: 6, infraestrutura: 3 } },
        headline: '{nome} recebe comitiva federal e anuncia obras',
      },
      {
        id: 'manter-distancia',
        label: 'Aceitar a verba, mas evitar a foto',
        description: 'Garante parte do dinheiro sem se colar ao governo. A comitiva nota a frieza.',
        impact: { localPopularity: 1, partyInfluence: -1, admin: { contas: 3 } },
        headline: 'Governo federal anuncia obras; {nome} manda representante',
      },
    ],
  },
  {
    id: 'crise-nas-contas',
    category: 'gestao',
    title: 'O dinheiro acabou',
    icon: '💰',
    description:
      'A equipe econômica avisa: sem medidas duras, vai faltar dinheiro para os salários do mês que vem. Fornecedores já ameaçam suspender serviços.',
    conditions: [
      { kind: 'role', roles: ['executivo'] },
      { kind: 'admin', indicator: 'contas', comparator: 'lte', value: 30 },
    ],
    weight: 2,
    cooldown: 4,
    options: [
      {
        id: 'corte-de-gastos',
        label: 'Cortar cargos comissionados e gastos',
        description: 'Arruma as contas, mas aliados perdem cargos e o governo encolhe.',
        impact: { approval: -4, partyInfluence: -3, admin: { contas: 12, infraestrutura: -2 } },
        headline: '{nome} corta cargos e gastos para pagar salários',
      },
      {
        id: 'atrasar-fornecedores',
        label: 'Atrasar pagamento de fornecedores',
        description: 'Ganha fôlego sem desgaste imediato, mas serviços podem parar.',
        impact: { reputation: -2, admin: { contas: 5 } },
        risk: {
          chance: 0.4,
          impact: { approval: -4, admin: { saude: -3, infraestrutura: -3 } },
          headline: 'Sem pagamento, empresas param coleta de lixo e obras',
        },
        headline: 'Gestão de {nome} renegocia dívidas com fornecedores',
      },
      {
        id: 'aumentar-impostos',
        label: 'Aumentar impostos locais',
        description: 'Receita nova e garantida, mas o contribuinte sente no bolso.',
        impact: { approval: -6, localPopularity: -3, admin: { contas: 10 } },
        headline: '{nome} aumenta impostos para equilibrar as contas',
      },
    ],
  },
  {
    id: 'legislativo-trava-projeto',
    category: 'mandato',
    title: 'Os parlamentares travam seu projeto',
    icon: '🧱',
    description:
      'O principal projeto da sua gestão está parado no Legislativo. Os vereadores e deputados querem cargos e emendas para votar.',
    conditions: [{ kind: 'role', roles: ['executivo'] }],
    cooldown: 6,
    options: [
      {
        id: 'liberar-emendas',
        label: 'Liberar emendas e cargos',
        description: 'O projeto passa, mas o preço sai das contas e da sua imagem.',
        impact: { approval: 2, partyInfluence: 2, reputation: -2, admin: { contas: -4 } },
        headline: 'Após acordo, Legislativo aprova projeto de {nome}',
      },
      {
        id: 'ir-para-as-ruas',
        label: 'Convocar a população a pressionar',
        description: 'O povo vai às galerias. Os parlamentares não gostam de ser expostos.',
        impact: { localPopularity: 3, electoralBase: 2, partyInfluence: -3 },
        risk: {
          chance: 0.35,
          impact: { approval: -2 },
          headline: 'Mesmo com pressão popular, projeto de {nome} segue travado',
        },
        headline: 'Pressionado pelas ruas, Legislativo aprova projeto de {nome}',
      },
      {
        id: 'desistir-projeto',
        label: 'Desistir e mudar de prioridade',
        description: 'Evita a briga, mas a gestão parece fraca.',
        impact: { approval: -2, partyInfluence: -1 },
        headline: '{nome} retira projeto após resistência no Legislativo',
      },
    ],
  },
  {
    id: 'obra-entregue',
    category: 'oportunidade',
    title: 'Grande obra pronta antes do prazo',
    icon: '🏗️',
    description:
      'Uma obra importante da sua gestão ficou pronta antes do previsto. A equipe de comunicação quer uma grande festa de inauguração.',
    conditions: [
      { kind: 'role', roles: ['executivo'] },
      { kind: 'admin', indicator: 'infraestrutura', comparator: 'gte', value: 55 },
    ],
    cooldown: 6,
    options: [
      {
        id: 'grande-inauguracao',
        label: 'Fazer uma grande inauguração',
        description: 'Show, faixa e discurso: a cidade inteira fica sabendo. A festa custa caro.',
        impact: { approval: 4, localPopularity: 3, admin: { contas: -2 } },
        headline: '{nome} inaugura obra com festa e multidão',
      },
      {
        id: 'entrega-discreta',
        label: 'Entregar sem festa',
        description: 'Menos barulho, mais respeito de quem acha festa desperdício.',
        impact: { approval: 2, reputation: 2 },
        headline: 'Obra é entregue antes do prazo e sem festa',
      },
    ],
  },
  {
    id: 'onda-de-assaltos',
    category: 'gestao',
    title: 'Onda de assaltos assusta a população',
    icon: '🚓',
    description:
      'Uma sequência de assaltos em bairros movimentados virou o assunto da cidade. Comerciantes fecham mais cedo e cobram reação da sua gestão.',
    conditions: [{ kind: 'role', roles: ['executivo'] }],
    cooldown: 6,
    options: [
      {
        id: 'reforcar-policiamento',
        label: 'Reforçar o policiamento e a iluminação',
        description: 'Resposta visível e rápida, paga com dinheiro que faltará em outras áreas.',
        impact: { approval: 2, admin: { seguranca: 6, contas: -6 } },
        headline: '{nome} reforça policiamento após onda de assaltos',
      },
      {
        id: 'parceria-seguranca',
        label: 'Fechar parceria com outros governos',
        description: 'Divide o custo e ganha aliados, mas os resultados demoram.',
        impact: { partyInfluence: 1, admin: { seguranca: 3, contas: -2 } },
        headline: 'Gestão de {nome} fecha acordo de segurança integrada',
      },
      {
        id: 'prevencao-social',
        label: 'Investir em prevenção: esporte e escola',
        description: 'Ataca as causas, mas o eleitor queria resposta imediata.',
        impact: { approval: -1, reputation: 1, admin: { seguranca: 2, educacao: 2, contas: -3 } },
        headline: '{nome} aposta em prevenção contra a violência',
      },
    ],
  },

  // ─── Vice ───────────────────────────────────────────────────────────────
  {
    id: 'titular-renuncia-para-disputar',
    category: 'mandato',
    title: 'O titular deixa o cargo',
    icon: '🔑',
    description:
      'O titular da chapa renunciou para disputar um cargo maior. Pela lei, você assume a cadeira até o fim do mandato, com a caneta e os problemas.',
    conditions: [{ kind: 'role', roles: ['vice'] }],
    weight: 0.6,
    cooldown: 8,
    options: [
      {
        id: 'assumir-com-equipe-do-titular',
        label: 'Assumir e manter a equipe do titular',
        description: 'Transição tranquila e aliados satisfeitos, mas você governa à sombra do antecessor.',
        impact: { partyInfluence: 3 },
        headline: '{nome} assume o cargo e mantém a equipe do antecessor',
        effect: { kind: 'succeed' },
      },
      {
        id: 'assumir-com-equipe-propria',
        label: 'Assumir e montar a própria equipe',
        description: 'Imprime sua marca desde o primeiro dia, mas desagrada quem perdeu o posto.',
        impact: { localPopularity: 2, reputation: 1, partyInfluence: -2 },
        headline: '{nome} assume o cargo e troca o primeiro escalão',
        effect: { kind: 'succeed' },
      },
    ],
  },
  {
    id: 'titular-afastado-pela-justica',
    category: 'escandalo',
    title: 'Titular afastado pela Justiça',
    icon: '⚖️',
    description:
      'O titular da sua chapa foi afastado do cargo por decisão judicial, acusado de desviar verbas. Você é chamado para assumir no meio da crise.',
    conditions: [{ kind: 'role', roles: ['vice'] }],
    weight: 0.4,
    cooldown: 10,
    options: [
      {
        id: 'assumir-pela-uniao',
        label: 'Assumir com discurso de união',
        description: 'Acalma a máquina e os aliados, mas fica a dúvida sobre o que você sabia.',
        impact: { partyInfluence: 2, reputation: 1 },
        headline: '{nome} assume o cargo e pede união após afastamento do titular',
        effect: { kind: 'succeed' },
      },
      {
        id: 'assumir-rompendo',
        label: 'Assumir e romper com o titular',
        description: 'Marca distância do escândalo e ganha o eleitor, mas perde aliados do antigo chefe.',
        impact: { reputation: 4, localPopularity: 2, partyInfluence: -4 },
        headline: '{nome} assume, rompe com o titular e promete faxina',
        effect: { kind: 'succeed' },
      },
    ],
  },
  {
    id: 'vice-isolado',
    category: 'partido',
    title: 'O titular deixa você de lado',
    icon: '🪑',
    description:
      'Você não é mais chamado para as reuniões importantes e soube das últimas decisões pelo jornal. O titular parece ter escolhido outros conselheiros.',
    conditions: [{ kind: 'role', roles: ['vice'] }],
    cooldown: 6,
    options: [
      {
        id: 'aceitar-papel-discreto',
        label: 'Aceitar um papel discreto',
        description: 'Mantém a paz na chapa e a vaga garantida, mas some do noticiário.',
        impact: { partyInfluence: 2, localPopularity: -2 },
        headline: '{nome} minimiza afastamento e diz que chapa está unida',
      },
      {
        id: 'agenda-propria',
        label: 'Criar uma agenda própria',
        description: 'Aparece por conta própria. O titular vê ambição e esfria a relação.',
        impact: { localPopularity: 3, nationalRecognition: 1, partyInfluence: -3 },
        headline: '{nome} percorre bairros com agenda própria',
      },
      {
        id: 'romper-publicamente',
        label: 'Romper publicamente com o titular',
        description: 'Vira notícia e mostra independência, mas pode perder espaço de vez.',
        impact: { nationalRecognition: 3, localPopularity: 2, partyInfluence: -6 },
        risk: {
          chance: 0.35,
          impact: { reputation: -3, electoralBase: -2 },
          headline: 'Rompimento de {nome} com o titular é visto como traição',
        },
        headline: '{nome} rompe com o titular e critica rumos do governo',
      },
    ],
  },

  // ─── Para todos ─────────────────────────────────────────────────────────
  {
    id: 'convite-debate-tv',
    category: 'midia',
    title: 'Convite para debate na TV',
    icon: '📺',
    description:
      'Uma emissora local chama você para um debate ao vivo sobre os problemas de {cidade}. Do outro lado, um adversário experiente e de língua afiada.',
    conditions: [{ kind: 'filiado', present: true }],
    cooldown: 6,
    options: [
      {
        id: 'partir-para-o-ataque',
        label: 'Ir e partir para o ataque',
        description: 'Pode render o corte mais visto da semana, ou uma resposta humilhante.',
        impact: { localPopularity: 3, electoralBase: 1, reputation: -1 },
        risk: {
          chance: 0.35,
          impact: { localPopularity: -5, reputation: -1 },
          headline: 'Adversário desmonta ataques de {nome} em debate na TV',
        },
        headline: '{nome} encurrala adversário em debate na TV',
      },
      {
        id: 'focar-em-propostas',
        label: 'Ir com propostas e dados',
        description: 'Passa seriedade e preparo, mas não vira meme.',
        impact: { reputation: 3, localPopularity: 1 },
        headline: '{nome} apresenta propostas em debate na TV local',
      },
      {
        id: 'recusar-debate',
        label: 'Recusar o convite',
        description: 'Evita o risco, mas a cadeira vazia vira assunto.',
        impact: { localPopularity: -1 },
        headline: 'Cadeira vazia: {nome} falta a debate na TV',
      },
    ],
  },
  {
    id: 'entrevista-polemica',
    category: 'midia',
    title: 'Uma frase fora de contexto',
    icon: '🎙️',
    description:
      'Um trecho de uma entrevista sua, cortado e fora de contexto, circula nas redes. Metade acha um absurdo; a outra metade adorou.',
    conditions: [{ kind: 'filiado', present: true }],
    cooldown: 6,
    options: [
      {
        id: 'pedir-desculpas',
        label: 'Pedir desculpas',
        description: 'Encerra a polêmica, mas parte dos seus apoiadores vê fraqueza.',
        impact: { reputation: 1, electoralBase: -1, localPopularity: -1 },
        headline: '{nome} pede desculpas por fala em entrevista',
      },
      {
        id: 'dobrar-a-aposta',
        label: 'Dobrar a aposta',
        description: 'Os fiéis se animam e o país passa a saber quem você é. Os críticos não esquecem.',
        impact: { electoralBase: 4, nationalRecognition: 3, reputation: -4 },
        headline: '{nome} reafirma fala polêmica e vira assunto nacional',
      },
      {
        id: 'publicar-integra',
        label: 'Publicar a entrevista na íntegra',
        description: 'Mostra o contexto. Funciona, se as pessoas tiverem paciência de assistir.',
        impact: { reputation: 2 },
        risk: {
          chance: 0.4,
          impact: { localPopularity: -2 },
          headline: 'Mesmo com íntegra publicada, fala de {nome} segue repercutindo',
        },
        headline: 'Íntegra da entrevista esvazia polêmica envolvendo {nome}',
      },
    ],
  },
  {
    id: 'pesquisa-favoravel',
    category: 'oportunidade',
    title: 'Uma pesquisa anima a campanha',
    icon: '📊',
    description:
      'Uma pesquisa de intenção de voto mostra seu nome em ascensão. Apoiadores e o {partido} querem saber como você vai usar o embalo.',
    conditions: [
      { kind: 'filiado', present: true },
      { kind: 'election-semester', present: true },
    ],
    cooldown: 4,
    options: [
      {
        id: 'cobrar-apoio-do-partido',
        label: 'Cobrar mais apoio do partido',
        description: 'Com números na mão, o partido abre espaço e recursos para você.',
        impact: { partyInfluence: 5 },
        headline: 'Em alta nas pesquisas, {nome} ganha espaço no {partido}',
      },
      {
        id: 'investir-nas-ruas',
        label: 'Investir na rua e nos bairros',
        description: 'Transforma intenção em voto fiel, nas conversas cara a cara.',
        impact: { electoralBase: 3, localPopularity: 2 },
        headline: '{nome} intensifica caminhadas após boa pesquisa',
      },
    ],
  },
  {
    id: 'apoio-de-celebridade',
    category: 'midia',
    title: 'Uma celebridade declara apoio',
    icon: '⭐',
    description:
      'Um artista famoso da região publicou um vídeo elogiando seu trabalho e quer gravar junto. Ele é querido, mas coleciona polêmicas.',
    conditions: [{ kind: 'metric', metric: 'localPopularity', comparator: 'gte', value: 25 }],
    cooldown: 8,
    options: [
      {
        id: 'aceitar-apoio',
        label: 'Gravar com a celebridade',
        description: 'Alcance enorme da noite para o dia. As polêmicas dele podem respingar em você.',
        impact: { nationalRecognition: 4, localPopularity: 3 },
        risk: {
          chance: 0.3,
          impact: { reputation: -4, localPopularity: -2 },
          headline: 'Polêmica de artista que apoia {nome} vira dor de cabeça',
        },
        headline: 'Vídeo de {nome} com artista famoso viraliza',
      },
      {
        id: 'agradecer-a-distancia',
        label: 'Agradecer, mas manter distância',
        description: 'Prudência elogiada por quem já viu apoios virarem problema.',
        impact: { reputation: 1, localPopularity: 1 },
        headline: '{nome} agradece apoio de artista nas redes',
      },
    ],
  },
  {
    id: 'video-viralizou',
    category: 'midia',
    title: 'Um vídeo seu viralizou',
    icon: '📱',
    description:
      'Um vídeo seu falando de um problema da cidade foi visto milhões de vezes. Seguidores chegam aos milhares e todo mundo quer saber o que vem depois.',
    cooldown: 8,
    options: [
      {
        id: 'virar-fenomeno',
        label: 'Investir pesado nas redes',
        description: 'Vira personagem conhecido no país, mas a busca por cliques tem riscos.',
        impact: { nationalRecognition: 5, localPopularity: 3 },
        risk: {
          chance: 0.3,
          impact: { reputation: -4 },
          headline: 'Vídeo antigo de {nome} volta à tona e gera críticas',
        },
        headline: '{nome} vira fenômeno nas redes sociais',
      },
      {
        id: 'transformar-em-projeto',
        label: 'Transformar o vídeo em mobilização',
        description: 'Converte curtidas em gente organizada, com menos barulho.',
        impact: { electoralBase: 4, localPopularity: 1 },
        headline: 'Após vídeo viral, {nome} reúne moradores em mutirão',
      },
      {
        id: 'manter-discricao',
        label: 'Manter a discrição',
        description: 'Evita a exposição. O embalo passa rápido.',
        impact: { reputation: 2 },
        headline: 'Vídeo sobre problema de {cidade} passa de 1 milhão de visualizações',
      },
    ],
  },

  // ─── Escândalos: revelações e consequências ─────────────────────────────
  {
    id: 'operacao-propina',
    category: 'escandalo',
    title: 'Operação da Polícia Federal',
    icon: '🚔',
    description:
      'Agentes da Polícia Federal batem à sua porta às seis da manhã. A empreiteira que você ajudou foi pega e um executivo resolveu contar tudo.',
    conditions: [
      { kind: 'flag', flag: 'propina-empreiteira', present: true },
      { kind: 'flag', flag: 'propina-exposta', present: false },
    ],
    weight: 2,
    options: [
      {
        id: 'negar-propina',
        label: 'Negar tudo e contratar bons advogados',
        description: 'A base fiel acredita em perseguição. Se as provas forem fortes, a condenação vem.',
        impact: { reputation: -10, localPopularity: -3, partyInfluence: -2 },
        risk: {
          chance: 0.5,
          impact: { reputation: -3 },
          headline: 'Justiça aceita denúncia e {nome} vai a julgamento por corrupção',
          flags: ['condenacao-propina'],
        },
        headline: '{nome} é alvo da PF e nega ter recebido propina',
        flags: ['propina-exposta'],
      },
      {
        id: 'colaborar-propina',
        label: 'Fazer acordo e colaborar com a investigação',
        description: 'Evita a condenação mais dura, mas entrega aliados e perde o espaço no jogo partidário.',
        impact: { reputation: -7, partyInfluence: -14, nationalRecognition: 3 },
        headline: '{nome} fecha acordo de colaboração com a PF',
        flags: ['propina-exposta'],
      },
    ],
  },
  {
    id: 'cassacao-executivo',
    category: 'escandalo',
    title: 'Pedido de cassação do seu mandato',
    icon: '🔨',
    description:
      'Depois da operação policial, parlamentares abriram um processo para cassar o seu mandato. A votação está marcada e os votos estão contados nos dedos.',
    conditions: [
      { kind: 'role', roles: ['executivo'] },
      { kind: 'flag', flag: 'propina-exposta', present: true, withinTurns: 4 },
      { kind: 'flag', flag: 'cassacao-executivo-julgada', present: false },
    ],
    weight: 2,
    options: [
      {
        id: 'renunciar-ao-mandato',
        label: 'Renunciar antes da votação',
        description: 'Evita a humilhação da cassação, mas o mandato acaba aqui.',
        impact: { reputation: -3, partyInfluence: -4 },
        headline: '{nome} renuncia ao mandato antes de votação de cassação',
        flags: ['cassacao-executivo-julgada'],
        effect: { kind: 'lose-office' },
      },
      {
        id: 'comprar-apoio',
        label: 'Garantir votos com cargos e verbas',
        description: 'Salva o mandato, mas a fatura sai das contas e do que resta da sua imagem.',
        impact: { reputation: -6, partyInfluence: -6, approval: -5, admin: { contas: -5 } },
        headline: 'Com acordão, {nome} escapa da cassação',
        flags: ['cassacao-executivo-julgada'],
      },
      {
        id: 'enfrentar-votacao',
        label: 'Enfrentar a votação com a defesa',
        description: 'Aposta na fraqueza das provas. Se perder, o mandato cai com humilhação.',
        impact: { approval: -3, reputation: -2 },
        headline: '{nome} vai ao plenário e enfrenta processo de cassação',
        flags: ['cassacao-executivo-julgada'],
        risk: {
          chance: 0.45,
          impact: { reputation: -6, localPopularity: -4, partyInfluence: -4 },
          headline: 'Parlamentares rejeitam defesa e mandato de {nome} fica por um fio',
        },
      },
    ],
  },
  {
    id: 'rachadinha-denunciada',
    category: 'escandalo',
    title: 'Ex-assessor denuncia rachadinha',
    icon: '📰',
    description:
      'Um ex-assessor do seu gabinete deu entrevista contando que devolvia parte do salário. Ele tem extratos bancários e mensagens.',
    conditions: [
      { kind: 'flag', flag: 'rachadinha', present: true },
      { kind: 'flag', flag: 'rachadinha-exposta', present: false },
    ],
    weight: 2,
    options: [
      {
        id: 'negar-rachadinha',
        label: 'Negar e chamar de vingança',
        description: 'Parte da base compra a versão. Se o Conselho de Ética agir, o mandato fica em risco.',
        impact: { reputation: -8, localPopularity: -2 },
        risk: {
          chance: 0.45,
          impact: { partyInfluence: -3 },
          headline: 'Conselho de Ética abre processo contra {nome}',
          flags: ['processo-cassacao'],
        },
        headline: '{nome} nega rachadinha e acusa ex-assessor de vingança',
        flags: ['rachadinha-exposta'],
      },
      {
        id: 'devolver-e-demitir',
        label: 'Devolver os valores e demitir os envolvidos',
        description: 'Reconhece o erro e limita o estrago. A base sente o golpe.',
        impact: { reputation: -5, electoralBase: -3 },
        headline: '{nome} demite assessores e promete devolver valores',
        flags: ['rachadinha-exposta'],
      },
      {
        id: 'culpar-assessores',
        label: 'Culpar os assessores',
        description: 'Diz que não sabia. As mensagens podem mostrar o contrário.',
        impact: { reputation: -4, partyInfluence: -2 },
        risk: {
          chance: 0.5,
          impact: { reputation: -5 },
          headline: 'Mensagens mostram que {nome} sabia da rachadinha',
          flags: ['processo-cassacao'],
        },
        headline: '{nome} diz que desconhecia rachadinha no gabinete',
        flags: ['rachadinha-exposta'],
      },
    ],
  },
  {
    id: 'processo-de-cassacao',
    category: 'escandalo',
    title: 'Conselho de Ética pede cassação',
    icon: '🔨',
    description:
      'O Conselho de Ética aprovou o parecer pela cassação do seu mandato. O plenário vota em breve e a pressão da imprensa é enorme.',
    conditions: [
      { kind: 'role', roles: ['legislativo'] },
      { kind: 'flag', flag: 'processo-cassacao', present: true },
      { kind: 'flag', flag: 'cassacao-julgada', present: false },
    ],
    weight: 2,
    options: [
      {
        id: 'renunciar-legislativo',
        label: 'Renunciar ao mandato',
        description: 'Sai antes da cassação. A carreira sofre, mas não acaba aqui.',
        impact: { reputation: -4, partyInfluence: -3 },
        headline: '{nome} renuncia ao mandato antes da votação no plenário',
        flags: ['cassacao-julgada'],
        effect: { kind: 'lose-office' },
      },
      {
        id: 'negociar-salvacao',
        label: 'Negociar votos para se salvar',
        description: 'Escapa da cassação, mas fica devendo favores e a imprensa fala em corporativismo.',
        impact: { reputation: -6, partyInfluence: -8 },
        headline: 'Plenário livra {nome} da cassação',
        flags: ['cassacao-julgada'],
      },
      {
        id: 'ser-cassado',
        label: 'Ir à votação e defender o mandato',
        description: 'Uma defesa emocionada na tribuna. Os votos não aparecem e o mandato cai.',
        impact: { reputation: -5, nationalRecognition: 2 },
        headline: 'Plenário cassa o mandato de {nome}',
        flags: ['cassacao-julgada'],
        effect: { kind: 'lose-office' },
      },
    ],
  },
  {
    id: 'caixa-2-oferecido',
    category: 'escandalo',
    title: 'Dinheiro vivo para a campanha',
    icon: '💵',
    description:
      'Um empresário oferece uma mala de dinheiro para a sua campanha, sem declarar à Justiça Eleitoral. Com ela, dá para pagar mais cabos eleitorais e material.',
    conditions: [
      { kind: 'filiado', present: true },
      { kind: 'election-semester', present: true },
      { kind: 'flag', flag: 'caixa-2-campanha', present: false },
    ],
    cooldown: 8,
    options: [
      {
        id: 'recusar-caixa-2',
        label: 'Recusar e seguir com a campanha declarada',
        description: 'Menos estrutura na rua, mas as contas fecham limpas.',
        impact: { reputation: 2 },
        headline: 'Campanhas em {cidade} entram na reta final',
      },
      {
        id: 'aceitar-caixa-2',
        label: 'Aceitar o dinheiro por fora',
        description: 'Estrutura de campanha muito maior agora. Caixa 2 costuma aparecer em delações.',
        impact: { electoralBase: 5, localPopularity: 2 },
        headline: 'Campanha de {nome} ganha reforço na reta final',
        flags: ['caixa-2-campanha'],
      },
      {
        id: 'declarar-doacao',
        label: 'Propor doação legal e declarada',
        description: 'O empresário recua e doa bem menos, mas a conta é limpa.',
        impact: { electoralBase: 1, reputation: 1 },
        headline: 'Empresário faz doação declarada à campanha de {nome}',
      },
    ],
  },
  {
    id: 'caixa-2-revelado',
    category: 'escandalo',
    title: 'Delação cita caixa 2 na sua campanha',
    icon: '🗂️',
    description:
      'Um empresário preso fez delação premiada e contou ter pago despesas da sua campanha sem declarar. A Justiça Eleitoral quer explicações.',
    conditions: [
      { kind: 'flag', flag: 'caixa-2-campanha', present: true },
      { kind: 'flag', flag: 'caixa-2-exposto', present: false },
    ],
    weight: 2,
    options: [
      {
        id: 'negar-caixa-2',
        label: 'Negar e dizer que as contas foram aprovadas',
        description: 'A tese é frágil se houver recibos. Uma condenação deixa você inelegível.',
        impact: { reputation: -8, localPopularity: -2 },
        risk: {
          chance: 0.45,
          impact: { reputation: -3 },
          headline: 'Justiça Eleitoral condena {nome} por abuso de poder econômico',
          flags: ['condenacao-eleitoral'],
        },
        headline: '{nome} nega caixa 2 citado em delação',
        flags: ['caixa-2-exposto'],
      },
      {
        id: 'admitir-erro',
        label: 'Admitir o erro e pedir desculpas',
        description: 'Diminui a chance de punição dura, mas o eleitor não esquece tão rápido.',
        impact: { reputation: -6, partyInfluence: -4 },
        headline: '{nome} admite recursos não declarados e pede desculpas',
        flags: ['caixa-2-exposto'],
      },
      {
        id: 'culpar-tesoureiro',
        label: 'Jogar a culpa no tesoureiro da campanha',
        description: 'Protege você por um tempo, mas o tesoureiro pode resolver falar também.',
        impact: { reputation: -4, partyInfluence: -6 },
        risk: {
          chance: 0.35,
          impact: { reputation: -4 },
          headline: 'Tesoureiro desmente {nome} e é ouvido pela Justiça Eleitoral',
          flags: ['condenacao-eleitoral'],
        },
        headline: '{nome} culpa tesoureiro por caixa 2 na campanha',
        flags: ['caixa-2-exposto'],
      },
    ],
  },
  {
    id: 'emendas-investigadas',
    category: 'escandalo',
    title: 'Auditoria nas suas emendas',
    icon: '🧾',
    description:
      'O Tribunal de Contas encontrou indícios de desvio em emendas suas enviadas por ONGs de aliados. Os relatórios chegaram à imprensa.',
    conditions: [
      { kind: 'flag', flag: 'emendas-suspeitas', present: true },
      { kind: 'flag', flag: 'emendas-expostas', present: false },
    ],
    weight: 2,
    options: [
      {
        id: 'abrir-contas',
        label: 'Abrir todas as contas e pedir auditoria',
        description: 'Mostra que não tem medo. Se houver desvio, ele aparece, mas sem acusação a você.',
        impact: { reputation: -3, partyInfluence: -2 },
        headline: '{nome} pede auditoria completa das próprias emendas',
        flags: ['emendas-expostas'],
      },
      {
        id: 'negar-desvio',
        label: 'Negar e atacar o Tribunal de Contas',
        description: 'Ganha tempo e anima a base. Se o Ministério Público denunciar, a coisa complica.',
        impact: { reputation: -6, electoralBase: 1 },
        risk: {
          chance: 0.4,
          impact: { reputation: -4 },
          headline: 'Ministério Público denuncia {nome} por desvio de emendas',
          flags: ['emendas-condenacao'],
        },
        headline: '{nome} nega desvio e ataca auditoria das emendas',
        flags: ['emendas-expostas'],
      },
      {
        id: 'culpar-ongs',
        label: 'Culpar as ONGs que receberam o dinheiro',
        description: 'Afasta o problema de você, mas os aliados que dirigem as ONGs se sentem traídos.',
        impact: { reputation: -4, electoralBase: -3 },
        risk: {
          chance: 0.3,
          impact: { reputation: -3 },
          headline: 'Dirigente de ONG diz que agia a mando de {nome}',
          flags: ['emendas-condenacao'],
        },
        headline: '{nome} rompe com ONGs suspeitas de desvio',
        flags: ['emendas-expostas'],
      },
    ],
  },
  {
    id: 'condenacao-ficha-limpa',
    category: 'escandalo',
    title: 'Condenação em segunda instância',
    icon: '⛔',
    description:
      'O tribunal confirmou a condenação. Pela Lei da Ficha Limpa, você fica inelegível por oito anos, mesmo que ainda caibam recursos.',
    conditions: [
      {
        kind: 'any',
        conditions: [
          { kind: 'flag', flag: 'condenacao-propina', present: true },
          { kind: 'flag', flag: 'condenacao-eleitoral', present: true },
          { kind: 'flag', flag: 'emendas-condenacao', present: true },
        ],
      },
      { kind: 'flag', flag: 'ficha-suja', present: false },
    ],
    weight: 3,
    options: [
      {
        id: 'recorrer',
        label: 'Recorrer aos tribunais superiores',
        description: 'A inelegibilidade vale já. Recorrer mantém a base mobilizada, mas o nome segue no noticiário policial.',
        impact: { reputation: -5, electoralBase: 2 },
        headline: '{nome} fica inelegível após condenação e promete recorrer',
        flags: ['ficha-suja'],
        effect: { kind: 'ineligible', semesters: 16 },
      },
      {
        id: 'aceitar-e-se-afastar',
        label: 'Aceitar a decisão e se afastar da vida pública',
        description: 'A imagem se recupera aos poucos, mas a máquina política esquece de você.',
        impact: { reputation: -1, partyInfluence: -8, electoralBase: -4 },
        headline: 'Inelegível, {nome} anuncia afastamento da política',
        flags: ['ficha-suja'],
        effect: { kind: 'ineligible', semesters: 16 },
      },
    ],
  },
];
