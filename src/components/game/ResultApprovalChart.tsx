import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { THEME_COLORS } from '@/constants/theme';
import type { HistoryPoint } from '@/types';
import { formatNumber } from '@/utils/format';

interface ResultApprovalChartProps {
  data: readonly HistoryPoint[];
}

/** Cores do tema (tailwind.config.js) — Recharts exige valores literais. */
const CHART_COLORS = {
  line: THEME_COLORS.navy,
  grid: THEME_COLORS.rule,
  axis: THEME_COLORS.inkMuted,
  surface: THEME_COLORS.paper,
  ink: THEME_COLORS.ink,
} as const;

const CHART_HEIGHT_PX = 200;
const Y_DOMAIN: [number, number] = [0, 100];
const Y_TICKS = [0, 25, 50, 75, 100];
const AXIS_FONT_SIZE = 11;
const LINE_WIDTH = 2;
const ACTIVE_DOT_RADIUS = 5;

const formatPercent = (value: number): string => `${formatNumber(value)}%`;

/** Trajetória da aprovação popular ao longo do governo. */
export const ResultApprovalChart = ({ data }: ResultApprovalChartProps) => {
  if (data.length < 2) return null;
  const first = data[0];
  const last = data[data.length - 1];
  return (
    <section aria-labelledby="result-chart-heading">
      <h3 id="result-chart-heading" className="mb-3 border-b border-ink pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
        Aprovação ao longo do governo
      </h3>
      <p className="sr-only">
        A aprovação passou de {formatPercent(first.approval)} em {first.label} para {formatPercent(last.approval)} em {last.label}.
      </p>
      <div aria-hidden="true" style={{ height: CHART_HEIGHT_PX }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[...data]} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_COLORS.axis, fontSize: AXIS_FONT_SIZE }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              minTickGap={24}
            />
            <YAxis
              domain={Y_DOMAIN}
              ticks={Y_TICKS}
              tick={{ fill: CHART_COLORS.axis, fontSize: AXIS_FONT_SIZE }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value}%`}
            />
            <Tooltip
              formatter={(value) => [formatPercent(Number(value)), 'Aprovação']}
              contentStyle={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_COLORS.ink}`, fontSize: AXIS_FONT_SIZE }}
              cursor={{ stroke: CHART_COLORS.axis, strokeDasharray: '3 3' }}
            />
            <Line
              type="monotone"
              dataKey="approval"
              stroke={CHART_COLORS.line}
              strokeWidth={LINE_WIDTH}
              dot={false}
              activeDot={{ r: ACTIVE_DOT_RADIUS, stroke: CHART_COLORS.surface, strokeWidth: LINE_WIDTH }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
