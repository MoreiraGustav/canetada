import { useSectorViews } from '@/stores/selectors';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SecondaryIndicatorGroup } from './SecondaryIndicatorGroup';
import { SectorApprovalList } from './SectorApprovalList';
import { METRIC_GROUP_LABELS, SECONDARY_METRIC_GROUPS } from '@/constants/metrics';

/** Aba "Indicadores": métricas secundárias por tema e aprovação por setor. */
export const SecondaryIndicatorsPanel = () => {
  const sectors = useSectorViews();
  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-6">
        {SECONDARY_METRIC_GROUPS.map(({ group, metrics }) => (
          <SecondaryIndicatorGroup key={group} title={METRIC_GROUP_LABELS[group]} keys={metrics} />
        ))}
      </div>
      <div>
        <SectionHeading title="Aprovação por setor" size="sm" />
        <SectorApprovalList sectors={sectors} />
        <p className="mt-3 font-sans text-[11px] leading-snug text-ink-muted">
          A aprovação geral é a média ponderada destes setores. Passe o mouse ou toque em um setor para ver o que mais o
          influencia.
        </p>
      </div>
    </div>
  );
};
