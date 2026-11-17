import type { CareerAction, CareerEvent } from '@/types';

/**
 * Vida depois do Planalto: agenda e acontecimentos de quem já foi presidente
 * (flag `ex-presidente`, marcada pelo engine na saída do governo).
 */
const EX_PRESIDENT = { kind: 'flag', flag: 'ex-presidente', present: true } as const;

export const EX_PRESIDENT_ACTIONS: CareerAction[] = [
  {
    id: 'palestras-ex-presidente',
    name: 'Palestras no Brasil e no exterior',
    icon: '🎙️',
    description: 'Cachês altos e plateias cheias, mas a imprensa cobra quem pagou.',
    conditions: [EX_PRESIDENT],
    impact: { nationalRecognition: 2, partyInfluence: 1 },
    risk: {
      chance: 0.2,
      impact: { reputation: -5 },
      headline: 'Palestras de {nome} pagas por empreiteira viram alvo de investigação',
    },
    cooldown: 2,
    headline: 'Ex-presidente {nome} lota auditório em palestra no exterior',
  },
  {
    id: 'instituto-ex-presidente',
    name: 'Fundar um instituto',
    icon: '🏛️',
    description: 'Guarda o acervo do governo e forma quadros. Exige dinheiro e tempo.',
    conditions: [EX_PRESIDENT],
    impact: { reputation: 3, partyInfluence: 2, electoralBase: -1 },
    cooldown: 6,
    headline: 'Instituto {nome} abre as portas com o acervo do governo',
  },
  {
    id: 'cabo-eleitoral-de-luxo',
    name: 'Subir no palanque dos aliados',
    icon: '📣',
    description: 'Seu apoio decide eleições, e o partido fica devendo. A oposição mira você.',
    conditions: [EX_PRESIDENT],
    impact: { relations: { padrinho: 4, adversario: -6 }, partyInfluence: 5, electoralBase: 3 },
    cooldown: 2,
    headline: 'Ex-presidente {nome} vira o cabo eleitoral mais disputado do país',
  },
  {
    id: 'livro-de-memorias',
    name: 'Lançar um livro de memórias',
    icon: '📖',
    description: 'Conta os bastidores do governo. Vende bem, mas cria inimigos.',
    conditions: [EX_PRESIDENT],
    impact: { relations: { rival: -6, adversario: -6 }, nationalRecognition: 2, reputation: 2 },
    cooldown: 8,
    headline: 'Memórias de {nome} sobre o Planalto lideram as listas de mais vendidos',
  },
];

export const EX_PRESIDENT_EVENTS: CareerEvent[] = [
  {
    id: 'partido-pede-volta',
    category: 'partido',
    title: 'O partido quer você de volta à disputa',
    icon: '📢',
    description:
      'Pesquisas mostram que o seu nome ainda é o mais forte do {partido}. A direção pede que você volte a disputar uma eleição.',
    conditions: [EX_PRESIDENT, { kind: 'role', roles: ['sem-cargo'] }],
    oneTime: true,
    options: [
      {
        id: 'aceitar-volta',
        label: 'Aceitar e se preparar para a disputa',
        description: 'O partido se reorganiza em torno de você. Rivais internos engolem a seco.',
        impact: { relations: { padrinho: 6, rival: -8 }, partyInfluence: 6, electoralBase: 3 },
        headline: '{nome} aceita voltar às urnas e anima o {partido}',
      },
      {
        id: 'abrir-espaco',
        label: 'Abrir espaço para a nova geração',
        description: 'Vira conselheiro(a) respeitado(a). O partido lamenta, mas agradece.',
        impact: { relations: { rival: 8 }, reputation: 3, partyInfluence: -2 },
        headline: '{nome} diz que é hora de a nova geração assumir o {partido}',
      },
    ],
  },
  {
    id: 'ex-presidente-investigado',
    category: 'escandalo',
    title: 'Operação mira os anos de governo',
    icon: '🕵️',
    description: 'Uma operação da polícia investiga contratos do seu governo. Antigos ministros são chamados a depor.',
    conditions: [EX_PRESIDENT],
    cooldown: 10,
    options: [
      {
        id: 'colaborar-investigacao',
        label: 'Abrir as contas e colaborar',
        description: 'Mostra que não tem o que esconder. Se algo aparecer, o estrago fica menor.',
        impact: { reputation: 2, partyInfluence: -1 },
        risk: {
          chance: 0.25,
          impact: { reputation: -6, nationalRecognition: -1 },
          headline: 'Investigação acha irregularidade em contrato do governo de {nome}',
        },
        headline: 'Ex-presidente {nome} entrega documentos e colabora com a investigação',
      },
      {
        id: 'denunciar-perseguicao',
        label: 'Denunciar perseguição política',
        description: 'A militância vai às ruas por você. Quem está no meio desconfia.',
        impact: { electoralBase: 4, reputation: -3, relations: { adversario: -6 } },
        headline: '{nome} chama operação de perseguição e reúne apoiadores',
      },
    ],
  },
  {
    id: 'conselho-ao-presidente',
    category: 'oportunidade',
    title: 'O presidente pede conselho',
    icon: '☎️',
    description: 'O atual presidente, do seu campo político, liga para pedir ajuda numa crise com o Congresso.',
    conditions: [EX_PRESIDENT, { kind: 'government', level: 'federal', relation: ['own', 'ally'] }],
    cooldown: 8,
    options: [
      {
        id: 'articular-pelo-governo',
        label: 'Articular votos no Congresso',
        description: 'O governo fica devendo e o seu peso aumenta. Se a crise piorar, sobra para você.',
        impact: { partyInfluence: 5, nationalRecognition: 1 },
        risk: {
          chance: 0.25,
          impact: { reputation: -3, partyInfluence: -3 },
          headline: 'Articulação de {nome} fracassa e governo perde votação no Congresso',
        },
        headline: 'Ex-presidente {nome} costura acordo e salva o governo no Congresso',
      },
      {
        id: 'ficar-distante',
        label: 'Manter distância do governo',
        description: 'Preserva a sua imagem, mas o partido estranha a ausência.',
        impact: { reputation: 1, partyInfluence: -2 },
        headline: '{nome} evita se envolver na crise do governo',
      },
    ],
  },
];
