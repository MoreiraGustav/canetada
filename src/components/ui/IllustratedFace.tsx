import type { ResolvedFace } from '@/utils/illustratedFace';
import { HAIR_COLORS, SKIN_TONES } from '@/utils/illustratedFace';

interface IllustratedFaceProps {
  face: ResolvedFace;
  className?: string;
}

const INK = '#1C1B19';
const PAPER = '#EAE3D6';
const SHIRT = '#F4EFE6';
const LIPS = '#7A3B33';
const TIE = '#7A2E2A';
/** Cabelos claros pedem sobrancelha em tinta, para o rosto não sumir. */
const LIGHT_HAIR = new Set(['branco', 'loiro', 'grisalho']);

/** Cabelo atrás da cabeça (cai sobre os ombros). */
const BACK_HAIR: Partial<Record<ResolvedFace['hair'], string>> = {
  longo: 'M30,40 C26,58 27,74 34,82 L66,82 C73,74 74,58 70,40 Z',
  medio: 'M31,40 C29,52 30,60 34,64 L66,64 C70,60 71,52 69,40 Z',
};

/** Cabelo sobre a cabeça, por estilo. */
const FRONT_HAIR: Record<ResolvedFace['hair'], string> = {
  careca: '',
  calvo: 'M33,47 C32,37 33.5,32 36.5,29.5 L37.5,43 Z M67,47 C68,37 66.5,32 63.5,29.5 L62.5,43 Z',
  curto: 'M33,41 C32,24 40,18 50,18 C60,18 68,24 67,41 C64,32 58,28 50,28 C42,28 36,32 33,41 Z',
  penteado: 'M33,42 C31,24 41,17 51,17 C62,17 69,25 67,41 C65,31 60,27 54,26.5 C47,27.5 40,31 33,42 Z',
  medio: 'M32,52 C29,26 40,17 50,17 C60,17 71,26 68,52 C66,42 66,32 60,27.5 C55,30.5 45,30.5 40,27.5 C34,32 34,42 32,52 Z',
  longo: 'M31,56 C28,26 40,17 50,17 C60,17 72,26 69,56 C66,44 66,32 60,27.5 C55,30.5 45,30.5 40,27.5 C34,32 34,44 31,56 Z',
  coque: 'M33,40 C33,25 41,20 50,20 C59,20 67,25 67,40 C64,31 58,27.5 50,27.5 C42,27.5 36,31 33,40 Z',
};

const BEARD: Record<ResolvedFace['beard'], string> = {
  nenhuma: '',
  bigode: 'M44.5,52.6 Q50,50.2 55.5,52.6 Q50,54.4 44.5,52.6 Z',
  cavanhaque: 'M44.5,52.6 Q50,50.2 55.5,52.6 Q50,54.4 44.5,52.6 Z M45.5,57 Q50,65 54.5,57 Q50,59.5 45.5,57 Z',
  cheia:
    'M33.5,44 C34,58 40,64.5 50,65 C60,64.5 66,58 66.5,44 C64.5,52 60.5,56.5 55,57 Q50,54.5 45,57 C39.5,56.5 35.5,52 33.5,44 Z M44.5,52.6 Q50,50.2 55.5,52.6 Q50,54.4 44.5,52.6 Z',
};

/**
 * Retrato ilustrado no estilo do jornal: paletó, rosto, cabelo, barba e óculos.
 * Usado para personagens fictícios e para pessoas reais sem foto de licença livre.
 */
export const IllustratedFace = ({ face, className = '' }: IllustratedFaceProps) => {
  const skin = SKIN_TONES[Math.min(SKIN_TONES.length - 1, Math.max(0, face.skin))];
  const hair = HAIR_COLORS[face.hairColor];
  const brow = LIGHT_HAIR.has(face.hairColor) ? INK : hair;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect width="100" height="100" fill={PAPER} />
      {BACK_HAIR[face.hair] && <path d={BACK_HAIR[face.hair]} fill={hair} />}
      <path d="M8,100 C10,82 28,75 50,75 C72,75 90,82 92,100 Z" fill={face.suit} />
      <path d={face.sex === 'm' ? 'M42,75 L50,90 L58,75 Z' : 'M43,75 L50,86 L57,75 Z'} fill={SHIRT} />
      {face.sex === 'm' && <path d="M48.6,78 L51.4,78 L52.6,93 L50,97 L47.4,93 Z" fill={TIE} />}
      <rect x="44" y="58" width="12" height="18" fill={skin} />
      <ellipse cx="32.8" cy="44" rx="3" ry="5" fill={skin} stroke={INK} strokeWidth="0.4" />
      <ellipse cx="67.2" cy="44" rx="3" ry="5" fill={skin} stroke={INK} strokeWidth="0.4" />
      <ellipse cx="50" cy="42" rx="17" ry="21" fill={skin} stroke={INK} strokeWidth="0.6" />
      {face.hair === 'coque' && <circle cx="50" cy="17" r="6" fill={hair} />}
      {FRONT_HAIR[face.hair] && <path d={FRONT_HAIR[face.hair]} fill={hair} />}
      <path d="M41,37 Q44,35.4 47,37 M53,37 Q56,35.4 59,37" stroke={brow} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="44" cy="41" rx="1.6" ry="1.2" fill={INK} />
      <ellipse cx="56" cy="41" rx="1.6" ry="1.2" fill={INK} />
      <path d="M50,42 Q48.4,49 50.6,50" stroke={INK} strokeWidth="0.6" fill="none" strokeLinecap="round" />
      <path d="M45.5,55.4 Q50,57.8 54.5,55.4" stroke={LIPS} strokeWidth="1" fill="none" strokeLinecap="round" />
      {BEARD[face.beard] && <path d={BEARD[face.beard]} fill={hair} />}
      {face.glasses && (
        <g stroke={INK} strokeWidth="0.8" fill={SHIRT} fillOpacity="0.15">
          <rect x="39.2" y="37.8" width="9.4" height="6.6" rx="2" />
          <rect x="51.4" y="37.8" width="9.4" height="6.6" rx="2" />
          <path d="M48.6,40.6 L51.4,40.6" fill="none" />
        </g>
      )}
      <rect width="100" height="100" fill="none" stroke={INK} strokeWidth="1.5" />
    </svg>
  );
};
