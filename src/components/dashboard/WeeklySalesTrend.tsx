import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import type { WeeklySalesData } from '../../hooks/useDashboardData';

// Chart brand colors - keeping these intentionally for chart rendering
const CHART_COLORS = {
  actual: '#C74C3C', // brand-terracotta (primary data)
  lastYear: '#8b5cf6', // violet for comparison
  targetLine: '#22c55e', // success green
  grid: '#374151', // muted gray for grid
};

interface WeeklySalesTrendProps {
  data?: WeeklySalesData[];
  dailyTargetPace?: number;
  isLoading?: boolean;
}

export function WeeklySalesTrend({ data: weeklyData, dailyTargetPace, isLoading }: WeeklySalesTrendProps) {
  const [showActual, setShowActual] = useState(true);
  const [showLastYear, setShowLastYear] = useState(true);

  // Calculate week-over-week change
  const thisWeekTotal = (weeklyData || []).reduce((sum, d) => sum + (d.actual || 0), 0);
  const lastYearTotal = (weeklyData || []).reduce((sum, d) => sum + (d.lastYear || 0), 0);
  const wowChange = lastYearTotal > 0 ? ((thisWeekTotal - lastYearTotal) / lastYearTotal) * 100 : 0;
  
  // Daily target in millions (for chart reference line)
  const dailyTargetM = dailyTargetPace ? Math.round(dailyTargetPace / 1000000) : 24;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Weekly Sales Trends</h3>
          {/* Week-over-Week Change Indicator */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            wowChange >= 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
          }`}>
            {wowChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {wowChange >= 0 ? '+' : ''}{wowChange.toFixed(1)}% vs LY
          </div>
        </div>
        <div className="flex gap-1.5 md:gap-2">
          {/* Actual Toggle - responsive with touch-friendly sizing */}
          <button
            onClick={() => setShowActual(!showActual)}
            className={`flex items-center gap-1.5 md:gap-2 rounded-full px-2.5 py-2 md:px-3 md:py-1.5 text-[10px] md:text-xs font-medium transition-all min-h-[36px] md:min-h-0 ${
              showActual
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-transparent text-muted-foreground border border-border hover:border-primary/50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showActual ? 'bg-white' : 'bg-primary'}`} />
            <span className="hidden xs:inline">Actual</span>
            <span className="xs:hidden">Now</span>
          </button>

          {/* Last Year Toggle - responsive with touch-friendly sizing */}
          <button
            onClick={() => setShowLastYear(!showLastYear)}
            className={`flex items-center gap-1.5 md:gap-2 rounded-full px-2.5 py-2 md:px-3 md:py-1.5 text-[10px] md:text-xs font-medium transition-all min-h-[36px] md:min-h-0 ${
              showLastYear
                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-transparent text-muted-foreground border border-border hover:border-violet-500/50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showLastYear ? 'bg-white' : 'bg-violet-500'}`} />
            <span className="hidden xs:inline">Last Year</span>
            <span className="xs:hidden">LY</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {/* Gradient for Actual */}
              <linearGradient id="gradientActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.actual} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.actual} stopOpacity={0} />
              </linearGradient>
              {/* Gradient for Last Year */}
              <linearGradient id="gradientLastYear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.lastYear} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART_COLORS.lastYear} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />

            {/* Daily Target Reference Line */}
            <ReferenceLine 
              y={dailyTargetM} 
              stroke={CHART_COLORS.targetLine} 
              strokeDasharray="5 5"
              strokeWidth={2}
            />

            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tickLine={false}
            />

            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}M`}
              domain={[0, 'auto']}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 8 }}
              itemStyle={{ padding: '2px 0' }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  actual: 'This Week',
                  lastYear: 'Last Year',
                };
                return [`${value}M đ`, labels[name] || name];
              }}
            />

            {/* Last Year Area - Bottom layer */}
            {showLastYear && (
              <Area
                type="monotone"
                dataKey="lastYear"
                stroke={CHART_COLORS.lastYear}
                strokeWidth={2}
                fill="url(#gradientLastYear)"
                name="lastYear"
              />
            )}

            {/* Actual Area - Top layer */}
            {showActual && (
              <Area
                type="monotone"
                dataKey="actual"
                stroke={CHART_COLORS.actual}
                strokeWidth={3}
                fill="url(#gradientActual)"
                name="actual"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend/Summary - calculated from actual data */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
        {showActual && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS.actual }} />
            <span>This Week: <span className="text-foreground font-medium">
              {thisWeekTotal}M đ
            </span></span>
          </div>
        )}
        {showLastYear && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS.lastYear }} />
            <span>Last Year: <span className="text-foreground font-medium">
              {lastYearTotal}M đ
            </span></span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4" style={{ backgroundColor: CHART_COLORS.targetLine, borderStyle: 'dashed' }} />
          <span>Daily Target: <span className="text-foreground font-medium">
            {dailyTargetM}M đ
          </span></span>
        </div>
      </div>
    </div>
  );
}
