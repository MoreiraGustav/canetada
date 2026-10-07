import type { GameEvent } from '@/types';

/** Escândalos políticos (GDD §4.4 — frequência moderada, mais prováveis com base fraca). */
export const POLITICAL_SCANDAL_EVENTS: GameEvent[] = [
  {
    id: 'corrupcao-ministerial',
    category: 'political-scandal',
    title: 'Ministro Investigado por Corrupção',
    icon: '🕵️',
    description:
      'Reportagem aponta que um ministro recebeu propina de empreiteiras em obras. A Polícia Federal pede inquérito ao STF e a oposição quer convocá-lo ao Congresso.',
    frequency: 'moderate',
    cooldown: 14,
    minTurn: 3,
    triggers: [
      { condition: { kind: 'indicator', indicator: 'congressSupport', comparator: 'lt', value: 45 }, multiplier: 1.5 },
      { condition: { kind: 'flag', flag: 'negociacao-recente', present: true, withinTurns: 4 }, multiplier: 2 },
    ],
    options: [
      {
        id: 'demitir-ministro',
        label: 'Demitir o ministro e colaborar com a PF',
        description: 'Mostra tolerância zero, mas o partido dele ameaça deixar a base.',
        impact: {
          approval: 1,
          congressSupport: -3,
          sectors: { middleClass: 3 },
        },
        headline: 'Presidente demite ministro investigado e promete colaborar com a PF',
        flags: ['escandalo-ministerial'],
      },
      {
        id: 'defender-ministro',
        label: 'Defender o ministro até o fim da investigação',
        description: 'Mantém o partido aliado, mas o governo fica ligado ao escândalo.',
        impact: {
          approval: -4,
          congressSupport: 2,
          sectors: { middleClass: -6, market: -2 },
        },
        headline: 'Presidente mantém ministro investigado: "Todos são inocentes até prova em contrário"',
        flags: ['escandalo-ministerial'],
        risk: {
          chance: 0.2,
          impact: { approval: 2, sectors: { middleClass: 3 } },
          headline: 'Investigação é arquivada e ministro defendido pelo governo é inocentado',
        },
      },
      {
        id: 'afastamento-auditoria',
        label: 'Afastar o ministro e auditar os contratos',
        description: 'Meio-termo que reduz o desgaste sem romper com o aliado.',
        impact: {
          approval: -1,
          congressSupport: -1,
          sectors: { middleClass: 1 },
        },
        headline: 'Ministro é afastado enquanto Controladoria audita contratos sob suspeita',
        flags: ['escandalo-ministerial'],
      },
    ],
  },
  {
    id: 'vazamento-audio',
    category: 'political-scandal',
    title: 'Vazamento de Áudio no Planalto',
    icon: '🎙️',
    description:
      'Vaza um áudio em que um assessor próximo ao presidente negocia verbas em troca de votos no Congresso. A gravação viraliza nas redes em poucas horas.',
    frequency: 'moderate',
    cooldown: 18,
    minTurn: 4,
    triggers: [
      { condition: { kind: 'flag', flag: 'escandalo-ministerial', present: true, withinTurns: 6 }, multiplier: 2 },
      { condition: { kind: 'flag', flag: 'negociacao-recente', present: true, withinTurns: 4 }, multiplier: 2 },
    ],
    options: [
      {
        id: 'pronunciamento-nacional',
        label: 'Falar em rede nacional e demitir o assessor',
        description: 'Retoma o controle da narrativa, mas expõe ainda mais o caso.',
        impact: {
          approval: -1,
          congressSupport: -2,
          sectors: { middleClass: 2 },
        },
        headline: 'Em rede nacional, presidente exonera assessor e pede desculpas',
        flags: ['vazamento-audio'],
      },
      {
        id: 'atacar-vazamento',
        label: 'Contestar a gravação na Justiça',
        description: 'Desvia o foco para o vazamento, mas parece tentativa de abafar.',
        impact: {
          approval: -4,
          sectors: { middleClass: -5, environmentalists: -2 },
        },
        headline: 'Planalto vai à Justiça contra divulgação de áudio e é acusado de censura',
        flags: ['vazamento-audio'],
        risk: {
          chance: 0.15,
          impact: { approval: 2, sectors: { middleClass: 3 } },
          headline: 'Perícia aponta edição no áudio vazado e governo ganha fôlego',
        },
      },
      {
        id: 'silencio-estrategico',
        label: 'Ficar em silêncio e esperar a poeira baixar',
        description: 'Evita alimentar a crise, mas a oposição dita a versão dos fatos.',
        impact: {
          approval: -3,
          congressSupport: -1,
          sectors: { middleClass: -3 },
        },
        headline: 'Silêncio do Planalto sobre áudio vazado irrita aliados',
        flags: ['vazamento-audio'],
      },
    ],
  },
  {
    id: 'emendas-secretas',
    category: 'political-scandal',
    title: 'Escândalo das Emendas Secretas',
    icon: '📂',
    description:
      'A imprensa revela bilhões em verbas de parlamentares liberadas sem identificar o autor, parte para prefeitos investigados. O STF cobra explicações.',
    frequency: 'moderate',
    cooldown: 12,
    requires: [{ kind: 'flag', flag: 'negociacao-recente', present: true, withinTurns: 6 }],
    triggers: [
      { condition: { kind: 'flag', flag: 'negociacao-recente', present: true, withinTurns: 3 }, multiplier: 3 },
    ],
    options: [
      {
        id: 'transparencia-total',
        label: 'Publicar tudo e identificar os autores',
        description: 'Recupera credibilidade, mas o Centrão se sente traído.',
        impact: {
          approval: 2,
          congressSupport: -5,
          sectors: { middleClass: 4, market: 1 },
        },
        headline: 'Governo publica dados das emendas e expõe padrinhos políticos',
      },
      {
        id: 'defender-acordos',
        label: 'Defender os acordos como necessários',
        description: 'Mantém a base unida, mas o governo paga o custo moral.',
        impact: {
          approval: -4,
          congressSupport: 2,
          sectors: { middleClass: -5 },
        },
        headline: 'Planalto defende emendas como "parte do jogo democrático"',
      },
      {
        id: 'aguardar-stf',
        label: 'Aguardar a decisão do STF',
        description: 'Passa a bola ao Judiciário, com desgaste moderado dos dois lados.',
        impact: {
          approval: -1,
          congressSupport: -2,
        },
        headline: 'Governo diz que cumprirá decisão do STF sobre emendas',
      },
    ],
  },
  {
    id: 'rede-de-desinformacao',
    category: 'political-scandal',
    title: 'Campanha de Desinformação',
    icon: '📱',
    description:
      'Perfis falsos espalham vídeos feitos com inteligência artificial com falas que o presidente nunca disse. Com anúncios pagos, somam milhões de visualizações.',
    frequency: 'moderate',
    cooldown: 10,
    triggers: [
      { condition: { kind: 'indicator', indicator: 'approval', comparator: 'lt', value: 35 }, multiplier: 1.5 },
    ],
    options: [
      {
        id: 'regulacao-plataformas',
        label: 'Defender regras para as redes sociais',
        description: 'Agrada especialistas, mas irrita as big techs e a classe média.',
        impact: {
          approval: 1,
          relations: { eua: -3 },
          sectors: { environmentalists: 3, middleClass: -2, business: -1 },
        },
        headline: 'Governo envia ao Congresso projeto para responsabilizar redes por desinformação',
      },
      {
        id: 'contraofensiva-comunicacao',
        label: 'Montar contraofensiva de comunicação',
        description: 'Desmente rápido, mas custa publicidade e tem efeito limitado.',
        impact: {
          approval: 1,
          debt: 0.05,
        },
        headline: 'Governo lança campanha para desmentir vídeos falsos sobre o presidente',
      },
      {
        id: 'ignorar-boatos',
        label: 'Ignorar os boatos',
        description: 'Não dá palco à mentira, mas parte do eleitorado acredita nela.',
        impact: {
          approval: -3,
          sectors: { lowerClass: -2, middleClass: -2 },
        },
        headline: 'Vídeos falsos sobre o presidente seguem circulando sem resposta oficial',
      },
    ],
  },
  {
    id: 'operacao-pf-aliados',
    category: 'political-scandal',
    title: 'Operação da PF Atinge Aliados',
    icon: '🚔',
    description:
      'A Polícia Federal faz buscas nos gabinetes de três deputados aliados por desvios na saúde. Líderes da base pressionam o Planalto a "conter excessos".',
    frequency: 'moderate',
    cooldown: 14,
    minTurn: 4,
    triggers: [
      { condition: { kind: 'indicator', indicator: 'congressSupport', comparator: 'lt', value: 40 }, multiplier: 1.5 },
      { condition: { kind: 'flag', flag: 'negociacao-recente', present: true, withinTurns: 6 }, multiplier: 1.5 },
    ],
    options: [
      {
        id: 'respeitar-autonomia',
        label: 'Reafirmar a autonomia da Polícia Federal',
        description: 'Reforça a imagem de respeito às instituições, mas aliados retaliam.',
        impact: {
          approval: 2,
          congressSupport: -5,
          sectors: { middleClass: 3 },
        },
        headline: 'Presidente defende autonomia da PF após operação contra aliados',
      },
      {
        id: 'pressionar-pf',
        label: 'Trocar o comando da PF',
        description: 'Acalma a base, mas soa como interferência e gera forte reação.',
        impact: {
          approval: -5,
          congressSupport: 3,
          securityTrust: -5,
          sectors: { middleClass: -6, environmentalists: -3 },
        },
        headline: 'Troca no comando da PF após operação contra aliados gera suspeita de interferência',
      },
      {
        id: 'distanciamento',
        label: 'Manter distância e não comentar o caso',
        description: 'Evita se comprometer, com desgaste moderado entre aliados.',
        impact: {
          congressSupport: -2,
        },
        headline: 'Planalto evita comentar operação da PF contra deputados da base',
      },
    ],
  },
  {
    id: 'conflito-stf',
    category: 'political-scandal',
    title: 'Choque com o Supremo',
    icon: '🏛️',
    description:
      'Um ministro do STF suspende sozinho uma medida prioritária do governo. Aliados acusam o tribunal de abuso, mas juristas dizem que o texto tinha falhas.',
    frequency: 'moderate',
    cooldown: 16,
    minTurn: 5,
    options: [
      {
        id: 'acatar-negociar',
        label: 'Acatar e reenviar a proposta corrigida',
        description: 'Preserva a harmonia entre os Poderes, mas a medida atrasa.',
        impact: {
          approval: 0.5,
          congressSupport: -1,
          sectors: { market: 2, middleClass: 1 },
        },
        headline: 'Governo acata decisão do STF e promete nova versão da medida',
      },
      {
        id: 'atacar-stf',
        label: 'Criticar publicamente o tribunal',
        description: 'Mobiliza parte da base, mas eleva a tensão e assusta investidores.',
        impact: {
          approval: -1,
          foreignInvestment: -2,
          sectors: { military: 3, middleClass: -3, market: -3, environmentalists: -3 },
        },
        headline: 'Presidente ataca STF e eleva tensão entre os Poderes',
      },
      {
        id: 'pec-limites',
        label: 'Apoiar limite a decisões individuais do STF',
        description: 'Agrada o Congresso, mas abre uma longa crise com o Judiciário.',
        impact: {
          congressSupport: 3,
          sectors: { market: -2, environmentalists: -4 },
        },
        headline: 'Governo apoia emenda constitucional contra decisões individuais no STF',
      },
    ],
  },
  {
    id: 'crise-na-coalizao',
    category: 'political-scandal',
    title: 'Partido Aliado Ameaça Sair',
    icon: '🤝',
    description:
      'O maior partido de centro da base ameaça deixar o governo, reclamando de poucos cargos e verbas não pagas. A imprensa fala em "rebelião" no Congresso.',
    frequency: 'moderate',
    cooldown: 12,
    minTurn: 3,
    triggers: [
      { condition: { kind: 'indicator', indicator: 'congressSupport', comparator: 'lt', value: 50 }, multiplier: 2 },
      { condition: { kind: 'indicator', indicator: 'approval', comparator: 'lt', value: 35 }, multiplier: 2 },
    ],
    options: [
      {
        id: 'ceder-ministerios',
        label: 'Ceder dois ministérios ao partido',
        description: 'Recompõe a base, mas trocar cargos por apoio pega mal.',
        impact: {
          congressSupport: 6,
          approval: -2,
          debt: 0.1,
          sectors: { middleClass: -3 },
        },
        headline: 'Presidente entrega ministérios para manter partido na base',
      },
      {
        id: 'recusar-chantagem',
        label: 'Recusar a "chantagem" e deixar o partido sair',
        description: 'Ganha pontos pela firmeza, mas a base aliada encolhe muito.',
        impact: {
          congressSupport: -8,
          approval: 1,
          sectors: { middleClass: 2 },
        },
        headline: 'Partido deixa o governo após presidente recusar novos cargos',
      },
      {
        id: 'reforma-ministerial',
        label: 'Reformar o ministério com novos parceiros',
        description: 'Reduz a dependência de um só partido, com ganho limitado.',
        impact: {
          congressSupport: 2,
          approval: -1,
        },
        headline: 'Reforma ministerial reorganiza a base aliada do governo',
      },
    ],
  },
  {
    id: 'espionagem-ilegal-inteligencia',
    category: 'political-scandal',
    title: 'Espionagem Ilegal na Inteligência',
    icon: '🕵️',
    description:
      'A Polícia Federal descobre que servidores da agência de inteligência vigiavam jornalistas e juízes sem ordem judicial. A oposição cobra explicações.',
    frequency: 'rare',
    oneTime: true,
    minTurn: 12,
    options: [
      {
        id: 'demitir-cupula-inteligencia',
        label: 'Demitir a cúpula e abrir os arquivos',
        description: 'Mostra transparência, mas irrita militares e expõe aliados.',
        impact: { approval: 1, congressSupport: -2, sectors: { middleClass: 4, environmentalists: 3, military: -5 } },
        headline: 'Presidente demite cúpula da inteligência e entrega arquivos à Polícia Federal',
      },
      {
        id: 'defender-agencia-inteligencia',
        label: 'Defender a agência e negar abusos',
        description: 'Agrada a área de segurança, mas soa como acobertamento.',
        impact: { approval: -3, sectors: { military: 4, middleClass: -6, environmentalists: -4 } },
        headline: 'Planalto nega espionagem ilegal e oposição fala em acobertamento',
        flags: ['escandalo-ministerial'],
      },
      {
        id: 'lei-controle-inteligencia',
        label: 'Propor controle externo da inteligência',
        description: 'Cria regras duradouras, mas a investigação se arrasta no Congresso.',
        impact: { approval: -1, congressSupport: -1, sectors: { middleClass: 2, environmentalists: 2, military: -2 } },
        delayed: [{ impact: { securityTrust: 3 }, delay: 2, duration: 6, label: 'Controle externo da inteligência' }],
        headline: 'Governo envia ao Congresso projeto de controle externo da inteligência',
      },
    ],
  },
];
