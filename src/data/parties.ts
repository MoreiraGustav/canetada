import type { Party } from '@/types';

/**
 * Partidos fictícios com ideologias claras (GDD §2.4, Opção B).
 * `congressBase` reflete o tamanho relativo da bancada: soma-se à base aliada inicial.
 */
export const PARTIES: Party[] = [
  {
    id: 'frente-trabalhista-nacional',
    name: 'Frente Trabalhista Nacional',
    acronym: 'FTN',
    color: '#9E3B33',
    economicIdeology: -50,
    socialIdeology: -30,
    description:
      'Partido de centro-esquerda ligado ao movimento sindical. Defende o desenvolvimentismo, a valorização do salário mínimo e programas de transferência de renda.',
    congressBase: 4,
  },
  {
    id: 'alianca-liberal-democratica',
    name: 'Aliança Liberal Democrática',
    acronym: 'ALD',
    color: '#2B4C7E',
    economicIdeology: 55,
    socialIdeology: 35,
    description:
      'Partido de centro-direita com forte presença nos estados do Sul e do Centro-Oeste. Liberal na economia, conservador nos costumes e próximo do agronegócio.',
    congressBase: 5,
  },
  {
    id: 'partido-liberdade-inovacao',
    name: 'Partido Liberdade e Inovação',
    acronym: 'PLI',
    color: '#3E7C8C',
    economicIdeology: 75,
    socialIdeology: -40,
    description:
      'Legenda jovem e urbana, liberal na economia e nos costumes. Defende privatizações, abertura comercial e agenda digital, mas tem bancada pequena.',
    congressBase: -4,
  },
  {
    id: 'uniao-nacional-soberana',
    name: 'União Nacional Soberana',
    acronym: 'UNS',
    color: '#8A6A2E',
    economicIdeology: 10,
    socialIdeology: 70,
    description:
      'Partido nacionalista e soberanista. Defende Estado forte em setores estratégicos, ampliação do orçamento de defesa e política externa de não alinhamento.',
    congressBase: 0,
  },
  {
    id: 'movimento-renova-brasil',
    name: 'Movimento Renova Brasil',
    acronym: 'MRB',
    color: '#C46A2F',
    economicIdeology: 20,
    socialIdeology: 5,
    description:
      'Movimento anti-establishment surgido nas redes sociais. Promete renovar a política e combater privilégios, mas quase não tem representação no Congresso.',
    congressBase: -6,
  },
  {
    id: 'coalizao-democratica-centro',
    name: 'Coalizão Democrática de Centro',
    acronym: 'CDC',
    color: '#6D6A75',
    economicIdeology: 15,
    socialIdeology: 20,
    description:
      'Maior bancada do Congresso, pragmática e com forte capilaridade municipal. Costuma integrar qualquer governo em troca de ministérios e emendas.',
    congressBase: 6,
  },
  {
    id: 'frente-socialista-ecologica',
    name: 'Frente Socialista e Ecológica',
    acronym: 'FSE',
    color: '#7A3E6E',
    economicIdeology: -80,
    socialIdeology: -70,
    description:
      'Partido de esquerda com pautas ambientais, de direitos humanos e de taxação de grandes fortunas. Bancada combativa, porém minoritária.',
    congressBase: -5,
  },
  {
    id: 'alianca-conservadora-republicana',
    name: 'Aliança Conservadora Republicana',
    acronym: 'ACR',
    color: '#3B3F5C',
    economicIdeology: 40,
    socialIdeology: 80,
    description:
      'Partido de direita conservadora com base em movimentos religiosos. Prioriza segurança pública, pauta de costumes e redução de impostos.',
    congressBase: 2,
  },
  {
    id: 'frente-patriotica-conservadora',
    name: 'Frente Patriótica Conservadora',
    acronym: 'FPC',
    color: '#4A3B2A',
    economicIdeology: 75,
    socialIdeology: 85,
    description:
      'Partido de direita radical, liberal na economia e linha-dura nos costumes e na segurança. Mobiliza as redes e as ruas, mas tem bancada pequena e isolada.',
    congressBase: -3,
  },
];
