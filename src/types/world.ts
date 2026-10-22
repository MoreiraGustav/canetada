/**
 * Mundo da partida: o Brasil fictício (partidos e políticos inventados, padrão)
 * ou o Brasil real (partidos, bancadas e políticos reais em cenários hipotéticos).
 */
export type WorldId = 'ficticio' | 'real';

/** Crédito exigido pela licença de uma foto livre (exibido na UI). */
export interface PhotoCredit {
  /** Autor ou órgão (ex.: "Ricardo Stuckert/PR", "Agência Senado"). */
  author: string;
  /** Licença (ex.: "CC BY 3.0 BR", "CC BY 2.0", "Domínio público"). */
  license: string;
  /** Página do arquivo na origem (ex.: Wikimedia Commons). */
  source: string;
}

export type FaceSex = 'f' | 'm';
export type HairStyle = 'careca' | 'calvo' | 'curto' | 'penteado' | 'medio' | 'longo' | 'coque';
export type BeardStyle = 'nenhuma' | 'bigode' | 'cavanhaque' | 'cheia';

/** Traços do retrato ilustrado; o que faltar é sorteado pela semente. */
export interface FaceTraits {
  sex: FaceSex;
  /** Tom de pele, do mais claro (0) ao mais escuro (5). */
  skin: number;
  hair: HairStyle;
  /** Cor do cabelo/barba: 'preto' | 'castanho' | 'loiro' | 'grisalho' | 'branco' | 'ruivo'. */
  hairColor: 'preto' | 'castanho' | 'loiro' | 'grisalho' | 'branco' | 'ruivo';
  beard: BeardStyle;
  glasses: boolean;
}

/**
 * Rosto de um personagem: foto oficial com licença livre (pessoas reais) ou
 * retrato ilustrado gerado pelo jogo (personagens fictícios ou sem foto livre).
 */
export interface Portrait {
  /** Caminho da foto em `public/` (ex.: "portraits/lula.jpg"). */
  photo?: string;
  credit?: PhotoCredit;
  /** Semente do retrato ilustrado (usada quando não há foto). */
  seed?: number;
  /** Traços fixos do retrato ilustrado (para lembrar a pessoa). */
  traits?: Partial<FaceTraits>;
}
