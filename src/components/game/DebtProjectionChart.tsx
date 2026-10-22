import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { STANCE_COLORS, THEME_COLORS } from '@/constants/theme';
import type { DebtProjectionRow, FiscalStanceView } from '@/types';
import { formatNumber } from '@/utils/format';

interface DebtProjectionChartProps {
  data: readonly DebtProjectionRow[];
  stances: readonly FiscalStanceView[];
}

const CHART_HEIGHT = 260;
const ACTIVE_WIDTH = 3;
const IDLE_WIDTH = 1.5;
const Y_AXIS_WIDTH = 40;
const FONT = 'Inter, system-ui, sans-serif';
const TICK_FONT = { fontFamily: FONT, fontSize: 10, fill: THEME_COLORS.inkMuted };
const TOOLTIP_STYLE = { backgroundColor: THEME_COLORS.paper, border: `1px solid ${THEME_COLORS.ink}`, borderRadius: 0, fontFamily: FONT, fontSize: 12 };

/** Trajetória da dívida (% do PIB) nos próximos 4 anos sob cada política fiscal (projeção sem choques). */
export const DebtProjectionChart = ({ data, stances }: DebtProjectionChartProps) => (
  <div style={{ height: CHART_HEIGHT }} role="img" aria-label="Projeção da dívida pública em 4 anos sob cada política fiscal">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={[...data]} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={THEME_COLORS.rule} strokeDasharray="2 4" vertical={false} />
        <XAxis dataKey="label" tick={TICK_FONT} tickLine={false} axisLine={{ stroke: THEME_COLORS.ink }} interval="preserveStartEnd" minTickGap={16} />
        <YAxis
          domain={['auto', 'auto']}
          tick={TICK_FONT}
          tickLine={false}
          axisLine={false}
          width={Y_AXIS_WIDTH}
          tickFormatter={(value: number) => `${formatNumber(value, 0)}%`}
        />
        <ChartTooltip contentStyle={TOOLTIP_STYLE} formatter={(value, name) => [`${formatNumber(Number(value), 1)}% do PIB`, name]} />
        <Legend wrapperStyle={{ fontFamily: FONT, fontSize: 11 }} />
        {stances.map(({ stance, active }) => (
          <Line
            key={stance.id}
            type="monotone"
            dataKey={stance.id}
            name={`${stance.icon} ${stance.label}`}
            stroke={STANCE_COLORS[stance.id]}
            strokeWidth={active ? ACTIVE_WIDTH : IDLE_WIDTH}
            strokeDasharray={active ? undefined : '4 3'}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);
