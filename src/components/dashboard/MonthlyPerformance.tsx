import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { MonthlyPerformanceData } from '../../hooks/useDashboardData';

// Chart colors - using brand colors for consistency
const CHART_COLORS = {
  onTarget: '#22c55e', // success green
  behindTarget: '#C74C3C', // brand terracotta
  referenceLine: '#6b7280', // muted gray
};

interface MonthlyPerformanceProps {
  data?: MonthlyPerformanceData[];
  isLoading?: boolean;
}

export function MonthlyPerformance({ data: monthlyData, isLoading }: MonthlyPerformanceProps) {

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoading && (!monthlyData || monthlyData.length === 0)) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">No monthly data available</p>
      </div>
    );
  }

  // Get current month data (last in array)
  const currentMonth = monthlyData[monthlyData.length - 1];
  const target = Math.round(currentMonth.targetRevenue / 1000000); // Convert to millions
  const achieved = Math.round(currentMonth.actualRevenue / 1000000);
  const isOnTarget = currentMonth.achievementPercent >= 100;

  // Prepare chart data
  const chartData = monthlyData.map(m => ({
    month: m.month,
    value: Math.round(m.actualRevenue / 1000000),
    target: Math.round(m.targetRevenue / 1000000),
    onTarget: m.achievementPercent >= 100,
  }));

  // Calculate max for chart domain
  const maxValue = Math.max(...chartData.map(d => Math.max(d.value, d.target))) * 1.1;

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Monthly Performance</h3>
        <span className={`flex items-center gap-1 text-sm font-medium ${isOnTarget ? 'text-success' : 'text-error'}`}>
          {isOnTarget ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {currentMonth.achievementPercent}%
        </span>
      </div>

      {/* Target info */}
      <p className="text-sm text-muted-foreground mb-4">
        {currentMonth.month} Achievement: <span className="text-foreground font-medium">{achieved}M đ</span> / {target}M đ
      </p>

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, maxValue]}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${v}M`}
            />
            <YAxis
              type="category"
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string, props: any) => [
                `${value}M đ (Target: ${props.payload.target}M đ)`,
                'Revenue'
              ]}
            />
            <ReferenceLine
              x={target}
              stroke={CHART_COLORS.referenceLine}
              strokeDasharray="3 3"
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              barSize={chartData.length === 1 ? 40 : 20}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.onTarget ? CHART_COLORS.onTarget : CHART_COLORS.behindTarget} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
