import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { THEME_COLORS } from '@/constants/theme';
import { INDICATOR_INFO } from '@/constants/metrics';
import type { HistoryPoint, IndicatorKey } from '@/types';
import { formatIndicator, formatIndicatorValue } from '@/utils/format';

interface HistoryChartProps {
  data: readonly HistoryPoint[];
  indicator: IndicatorKey;
}

/** Cores da paleta editorial (espelham `tailwind.config.js`), exigidas em hex pelo Recharts. */
const CHART_COLORS = THEME_COLORS;

const CHART_HEIGHT = 280;
const LINE_WIDTH = 2;
const DOT_RADIUS = 4;
const Y_AXIS_WIDTH = 56;
const TICK_FONT = { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10, fill: CHART_COLORS.inkMuted };
const TOOLTIP_STYLE = {
  backgroundColor: CHART_COLORS.paper,
  border: `1px solid ${CHART_COLORS.ink}`,
  borderRadius: 0,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 12,
};

/** Linha histórica de um indicador (até 48 meses, já limitados pelo selector). */
export const HistoryChart = ({ data, indicator }: HistoryChartProps) => {
  const info = INDICATOR_INFO[indicator];
  const singlePoint = data.length < 2;
  return (
    <div style={{ height: CHART_HEIGHT }} role="img" aria-label={`Evolução de ${info.label}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={[...data]} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.rule} strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={TICK_FONT}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.ink }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={TICK_FONT}
            tickLine={false}
            axisLine={false}
            width={Y_AXIS_WIDTH}
            tickFormatter={(value: number) => formatIndicatorValue(indicator, value)}
          />
          <ChartTooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ stroke: CHART_COLORS.inkMuted, strokeDasharray: '3 3' }}
            formatter={(value) => [formatIndicator(indicator, Number(value)), info.shortLabel]}
          />
          <Line
            type="monotone"
            dataKey={indicator}
            name={info.shortLabel}
            stroke={CHART_COLORS.ink}
            strokeWidth={LINE_WIDTH}
            dot={singlePoint ? { r: DOT_RADIUS, fill: CHART_COLORS.ink, stroke: CHART_COLORS.paper, strokeWidth: LINE_WIDTH } : false}
            activeDot={{ r: DOT_RADIUS, fill: CHART_COLORS.ink, stroke: CHART_COLORS.paper, strokeWidth: LINE_WIDTH }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
