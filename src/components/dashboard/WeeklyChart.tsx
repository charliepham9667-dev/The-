import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Chart brand colors
const CHART_COLORS = {
  actual: '#C74C3C', // brand-terracotta
  projected: '#6b7280', // muted gray
};

const data = [
  { day: 'Tue', projected: 28, actual: 25 },
  { day: 'Wed', projected: 32, actual: 30 },
  { day: 'Thu', projected: 35, actual: 38 },
  { day: 'Fri', projected: 42, actual: 45 },
  { day: 'Sat', projected: 55, actual: 52 },
  { day: 'Sun', projected: 48, actual: 50 },
  { day: 'Mon', projected: 38, actual: 35 },
];

export function WeeklyChart() {
  const [showProjected, setShowProjected] = useState(true);
  const [showActual, setShowActual] = useState(true);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Weekly Sales Trends</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProjected(!showProjected)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              showProjected
                ? 'bg-muted text-foreground'
                : 'bg-transparent text-muted-foreground border border-border'
            }`}
          >
            ● Projected
          </button>
          <button
            onClick={() => setShowActual(!showActual)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              showActual
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground border border-border'
            }`}
          >
            ● Actual
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.projected} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.projected} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.actual} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.actual} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${value}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number) => [`${value}M đ`, '']}
            />
            {showProjected && (
              <Area
                type="monotone"
                dataKey="projected"
                stroke={CHART_COLORS.projected}
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorProjected)"
              />
            )}
            {showActual && (
              <Area
                type="monotone"
                dataKey="actual"
                stroke={CHART_COLORS.actual}
                strokeWidth={2}
                fill="url(#colorActual)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
