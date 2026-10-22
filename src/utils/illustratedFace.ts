/**
 * Retrato ilustrado determinístico: traços sorteados pela semente (ou fixados para
 * lembrar uma pessoa real sem foto livre). Só dados — o desenho fica no componente.
 */
import type { BeardStyle, FaceTraits, HairStyle, Portrait } from '@/types';
import { mulberry32Step } from './prng';

export const SKIN_TONES = ['#F3D9C6', '#E7BEA0', '#D6A07A', '#B57A52', '#8A5839', '#5C3924'] as const;

export const HAIR_COLORS: Record<FaceTraits['hairColor'], string> = {
  preto: '#26201B',
  castanho: '#5A3B24',
  loiro: '#C49A55',
  grisalho: '#8F8A83',
  branco: '#E2DED6',
  ruivo: '#9C4F2B',
};

/** Paleta do paletó/blazer (tons sóbrios do jornal). */
export const SUIT_COLORS = ['#1F3A5F', '#2B2A28', '#4A4740', '#3A4A3F', '#5A2E2A'] as const;

const FEMALE_HAIR: readonly HairStyle[] = ['longo', 'medio', 'coque', 'curto'];
const MALE_HAIR: readonly HairStyle[] = ['curto', 'penteado', 'calvo', 'careca', 'curto', 'penteado'];
const HAIR_COLOR_KEYS = Object.keys(HAIR_COLORS) as Array<FaceTraits['hairColor']>;
const COMMON_HAIR_COLORS: ReadonlyArray<FaceTraits['hairColor']> = ['preto', 'castanho', 'preto', 'castanho', 'grisalho', 'loiro'];
const BEARDS: readonly BeardStyle[] = ['nenhuma', 'nenhuma', 'nenhuma', 'bigode', 'cavanhaque', 'cheia'];
const GLASSES_CHANCE = 0.3;
/** Fração dos retratos com cabelo de cor comum (o resto pode ter qualquer cor). */
const COMMON_HAIR_SHARE = 0.8;
const MALE_SHARE = 0.5;

/** Sorteio local pela semente do retrato — o retrato não consome o PRNG do jogo. */
const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    const step = mulberry32Step(state);
    state = step.state;
    return step.value;
  };
};

const pick = <T>(random: () => number, items: readonly T[]): T => items[Math.floor(random() * items.length)];

export interface ResolvedFace extends FaceTraits {
  suit: string;
}

/** Traços finais: os fixados no retrato e o resto sorteado pela semente. */
export const resolveFace = (portrait: Portrait | undefined, fallbackSeed: number): ResolvedFace => {
  const random = seededRandom(portrait?.seed ?? fallbackSeed);
  const fixed = portrait?.traits ?? {};
  const sex = fixed.sex ?? (random() < MALE_SHARE ? 'm' : 'f');
  const hair = fixed.hair ?? pick(random, sex === 'f' ? FEMALE_HAIR : MALE_HAIR);
  return {
    sex,
    skin: fixed.skin ?? Math.floor(random() * SKIN_TONES.length),
    hair,
    hairColor: fixed.hairColor ?? pick(random, random() < COMMON_HAIR_SHARE ? COMMON_HAIR_COLORS : HAIR_COLOR_KEYS),
    beard: fixed.beard ?? (sex === 'm' ? pick(random, BEARDS) : 'nenhuma'),
    glasses: fixed.glasses ?? random() < GLASSES_CHANCE,
    suit: pick(random, SUIT_COLORS),
  };
};

/** Semente estável a partir de um nome (para personagens sem semente própria). */
export const seedFromName = (name: string): number =>
  [...name].reduce((acc, char) => (Math.imul(acc, 31) + char.charCodeAt(0)) >>> 0, 7) || 1;
