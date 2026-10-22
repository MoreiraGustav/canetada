import { useState } from 'react';
import type { Portrait } from '@/types';
import { resolveFace, seedFromName } from '@/utils/illustratedFace';
import { IllustratedFace } from './IllustratedFace';

type PortraitSize = 'xs' | 'sm' | 'md' | 'lg';

interface PortraitImageProps {
  portrait?: Portrait;
  /** Nome da pessoa (texto alternativo e semente do retrato ilustrado). */
  name: string;
  size?: PortraitSize;
  className?: string;
}

const SIZE_CLASSES: Record<PortraitSize, string> = {
  xs: 'h-8 w-8',
  sm: 'h-11 w-11',
  md: 'h-16 w-16',
  lg: 'h-28 w-28',
};

/**
 * Rosto de um personagem: foto com licença livre ou, sem foto, um retrato ilustrado
 * determinístico. Se a foto falhar ao carregar, cai no ilustrado. O crédito da foto
 * fica numa linha à parte (`PhotoCreditLine`). Feito de `span` para caber em botões.
 */
export const PortraitImage = ({ portrait, name, size = 'md', className = '' }: PortraitImageProps) => {
  const [failed, setFailed] = useState(false);
  const credit = portrait?.credit ? ` — Foto: ${portrait.credit.author} · ${portrait.credit.license}` : '';
  return (
    <span className={`block shrink-0 overflow-hidden border border-ink bg-paper-dark ${SIZE_CLASSES[size]} ${className}`} title={`${name}${credit}`}>
      {portrait?.photo && !failed ? (
        <img
          src={`${import.meta.env.BASE_URL}${portrait.photo}`}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top grayscale-[20%]"
        />
      ) : (
        <IllustratedFace face={resolveFace(portrait, seedFromName(name))} className="h-full w-full" />
      )}
    </span>
  );
};
