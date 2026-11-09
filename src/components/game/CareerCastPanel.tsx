import { useCareerCast } from '@/stores/selectors';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CareerCharacterCard } from './CareerCharacterCard';

/** Bastidores: padrinho, rival e adversário, com a relação e as lembranças de cada um. */
export const CareerCastPanel = () => {
  const cast = useCareerCast();
  if (cast.length === 0) return null;
  return (
    <section aria-label="Bastidores">
      <SectionHeading kicker="🎭 Bastidores" title="Quem pesa na sua carreira" />
      <div className="grid gap-3 lg:grid-cols-3">
        {cast.map((view) => (
          <CareerCharacterCard key={view.id} view={view} />
        ))}
      </div>
    </section>
  );
};
