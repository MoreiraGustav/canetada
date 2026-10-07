import { useCongressView } from '@/stores/selectors';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CongressStatusCard } from './CongressStatusCard';
import { CongressSupportMeter } from './CongressSupportMeter';
import { CongressVoteList } from './CongressVoteList';

/** Aba "Congresso": base aliada, estado político e votações recentes. */
export const CongressPanel = () => {
  const congress = useCongressView();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <CongressSupportMeter
          support={congress.support}
          ordinaryChance={congress.ordinaryChance}
          pecChance={congress.pecChance}
        />
        <CongressStatusCard congress={congress} />
      </div>
      <div>
        <SectionHeading title="Votações recentes" size="sm" />
        <CongressVoteList votes={congress.recentVotes} />
        <p className="mt-3 font-sans text-[11px] leading-snug text-ink-muted">
          Leis ordinárias exigem maioria simples; PECs, 3/5 dos parlamentares. Negociar cargos e emendas aumenta a chance,
          mas custa caro à imagem do governo.
        </p>
      </div>
    </div>
  );
};
