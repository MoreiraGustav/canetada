import type { CareerCase } from '@/types';

/**
 * Casos na Justiça: as cadeias de escândalo de `events.ts`, com a explicação de cada
 * etapa. A tela dos escândalos e a ficha do político mostram as etapas já vividas, com
 * a data e a escolha que levou a cada uma, para a condenação nunca vir "do nada".
 * Recurso: chance-base de o tribunal superior anular a condenação (Ficha Limpa).
 */
export const CAREER_CASES: CareerCase[] = [
  {
    id: 'propina',
    name: 'Propina da empreiteira',
    steps: [
      { flag: 'propina-empreiteira', text: 'Você aceitou dinheiro de uma empreiteira em troca de ajuda numa licitação.' },
      { flag: 'propina-exposta', text: 'A Polícia Federal fez uma operação e um executivo da empreiteira contou tudo.' },
      { flag: 'condenacao-propina', text: 'A Justiça aceitou a denúncia: você virou réu por corrupção.' },
    ],
    charge: { flag: 'condenacao-propina', closedBy: ['ficha-suja'] },
    appealChance: 0.25,
  },
  {
    id: 'caixa-2',
    name: 'Caixa 2',
    steps: [
      { flag: 'caixa-2-campanha', text: 'Dinheiro não declarado entrou na sua campanha ou no caixa do partido.' },
      { flag: 'caixa-2-exposto', text: 'Uma delação premiada citou o caixa 2 e a Justiça Eleitoral pediu explicações.' },
      { flag: 'condenacao-eleitoral', text: 'A Justiça Eleitoral condenou você em primeira instância por abuso de poder econômico.' },
    ],
    charge: { flag: 'condenacao-eleitoral', closedBy: ['ficha-suja'] },
    appealChance: 0.35,
  },
  {
    id: 'emendas',
    name: 'Desvio de emendas',
    steps: [
      { flag: 'emendas-suspeitas', text: 'Emendas suas foram parar em ONGs ou transferências sem controle.' },
      { flag: 'emendas-expostas', text: 'O Tribunal de Contas apontou desvio nas emendas e o caso chegou à imprensa.' },
      { flag: 'emendas-condenacao', text: 'O Ministério Público denunciou você por desvio de emendas.' },
    ],
    charge: { flag: 'emendas-condenacao', closedBy: ['ficha-suja'] },
    appealChance: 0.3,
  },
  {
    id: 'rachadinha',
    name: 'Rachadinha',
    steps: [
      { flag: 'rachadinha', text: 'Seu gabinete passou a cobrar de volta parte do salário dos assessores.' },
      { flag: 'rachadinha-exposta', text: 'Um ex-assessor denunciou o esquema com extratos e mensagens.' },
      { flag: 'processo-cassacao', text: 'O Conselho de Ética abriu processo para cassar o seu mandato.' },
    ],
    charge: { flag: 'processo-cassacao', closedBy: ['cassacao-julgada'] },
  },
  {
    id: 'laranja',
    name: 'Candidatura laranja',
    steps: [
      { flag: 'candidatura-laranja', text: 'Você emprestou o nome para uma candidatura só no papel.' },
      { flag: 'laranja-exposta', text: 'O Ministério Público Eleitoral pôs o seu nome na lista de laranjas.' },
    ],
  },
];
