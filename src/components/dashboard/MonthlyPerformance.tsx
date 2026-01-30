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
import { useMonthlyPerformance } from '../../hooks/useDashboardData';

export function MonthlyPerformance() {
  const { data: monthlyData, isLoading, error } = useMonthlyPerformance();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !monthlyData || monthlyData.length === 0) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex items-center justify-center">
        <p className="text-slate-400">No monthly data available</p>
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
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base md:text-lg font-semibold text-white">Monthly Performance</h3>
        <span className={`flex items-center gap-1 text-sm font-medium ${isOnTarget ? 'text-emerald-400' : 'text-red-400'}`}>
          {isOnTarget ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {currentMonth.achievementPercent}%
        </span>
      </div>

      {/* Target info */}
      <p className="text-sm text-slate-400 mb-4">
        {currentMonth.month} Achievement: <span className="text-white font-medium">{achieved}M đ</span> / {target}M đ
      </p>

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis
              type="number"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, maxValue]}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${v}M`}
            />
            <YAxis
              type="category"
              dataKey="month"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number, name: string, props: any) => [
                `${value}M đ (Target: ${props.payload.target}M đ)`,
                'Revenue'
              ]}
            />
            <ReferenceLine
              x={target}
              stroke="#6b7280"
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
                  fill={entry.onTarget ? '#22c55e' : '#ff6b35'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
