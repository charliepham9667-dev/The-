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
import { useWeeklySales, useRevenueVelocity } from '../../hooks/useDashboardData';

export function WeeklySalesTrend() {
  const [showActual, setShowActual] = useState(true);
  const [showLastYear, setShowLastYear] = useState(true);

  const { data: weeklyData, isLoading } = useWeeklySales();
  const { data: velocityData } = useRevenueVelocity();

  // Calculate week-over-week change
  const thisWeekTotal = (weeklyData || []).reduce((sum, d) => sum + (d.actual || 0), 0);
  const lastYearTotal = (weeklyData || []).reduce((sum, d) => sum + (d.lastYear || 0), 0);
  const wowChange = lastYearTotal > 0 ? ((thisWeekTotal - lastYearTotal) / lastYearTotal) * 100 : 0;
  
  // Daily target in millions (for chart reference line)
  const dailyTargetM = velocityData ? Math.round(velocityData.dailyTargetPace / 1000000) : 24;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex items-center justify-center">
        <p className="text-slate-400">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[280px] md:min-h-[380px] w-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <h3 className="text-base md:text-lg font-semibold text-white">Weekly Sales Trends</h3>
          {/* Week-over-Week Change Indicator */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            wowChange >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
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
                ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20'
                : 'bg-transparent text-slate-400 border border-[#374151] hover:border-[#ff6b35]/50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showActual ? 'bg-white' : 'bg-[#ff6b35]'}`} />
            <span className="hidden xs:inline">Actual</span>
            <span className="xs:hidden">Now</span>
          </button>

          {/* Last Year Toggle - responsive with touch-friendly sizing */}
          <button
            onClick={() => setShowLastYear(!showLastYear)}
            className={`flex items-center gap-1.5 md:gap-2 rounded-full px-2.5 py-2 md:px-3 md:py-1.5 text-[10px] md:text-xs font-medium transition-all min-h-[36px] md:min-h-0 ${
              showLastYear
                ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/20'
                : 'bg-transparent text-slate-400 border border-[#374151] hover:border-[#8b5cf6]/50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showLastYear ? 'bg-white' : 'bg-[#8b5cf6]'}`} />
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
                <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
              </linearGradient>
              {/* Gradient for Last Year */}
              <linearGradient id="gradientLastYear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />

            {/* Daily Target Reference Line */}
            <ReferenceLine 
              y={dailyTargetM} 
              stroke="#22c55e" 
              strokeDasharray="5 5"
              strokeWidth={2}
            />

            <XAxis
              dataKey="day"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />

            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}M`}
              domain={[0, 'auto']}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #374151',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}
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
                stroke="#8b5cf6"
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
                stroke="#ff6b35"
                strokeWidth={3}
                fill="url(#gradientActual)"
                name="actual"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend/Summary - calculated from actual data */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-400">
        {showActual && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff6b35]" />
            <span>This Week: <span className="text-white font-medium">
              {thisWeekTotal}M đ
            </span></span>
          </div>
        )}
        {showLastYear && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
            <span>Last Year: <span className="text-white font-medium">
              {lastYearTotal}M đ
            </span></span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 bg-emerald-500" style={{ borderStyle: 'dashed' }} />
          <span>Daily Target: <span className="text-white font-medium">
            {dailyTargetM}M đ
          </span></span>
        </div>
      </div>
    </div>
  );
}
