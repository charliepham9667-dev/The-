import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useWeeklySales } from '../../hooks/useDashboardData';

// Mock data for demonstration - will be replaced with real data
const mockWeeklyData = [
  { day: 'Tue', actual: 28, lastYear: 18, projected: 30 },
  { day: 'Wed', actual: 32, lastYear: 22, projected: 35 },
  { day: 'Thu', actual: 38, lastYear: 25, projected: 36 },
  { day: 'Fri', actual: 45, lastYear: 32, projected: 42 },
  { day: 'Sat', actual: 52, lastYear: 38, projected: 55 },
  { day: 'Sun', actual: 48, lastYear: 35, projected: 50 },
  { day: 'Mon', actual: 35, lastYear: 28, projected: 38 },
];

export function WeeklySalesTrend() {
  const [showActual, setShowActual] = useState(true);
  const [showLastYear, setShowLastYear] = useState(true);
  const [showProjected, setShowProjected] = useState(true);

  const { data: apiData, isLoading } = useWeeklySales();

  // Use API data if available, otherwise use mock data
  const weeklyData = apiData?.length ? apiData : mockWeeklyData;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6 h-[380px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6 h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Weekly Sales Trends</h3>
        <div className="flex gap-2">
          {/* Actual Toggle */}
          <button
            onClick={() => setShowActual(!showActual)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              showActual
                ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20'
                : 'bg-transparent text-slate-400 border border-[#374151] hover:border-[#ff6b35]/50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showActual ? 'bg-white' : 'bg-[#ff6b35]'}`} />
            Actual
          </button>

          {/* Last Year Toggle */}
          <button
            onClick={() => setShowLastYear(!showLastYear)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              showLastYear
                ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/20'
                : 'bg-transparent text-slate-400 border border-[#374151] hover:border-[#8b5cf6]/50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showLastYear ? 'bg-white' : 'bg-[#8b5cf6]'}`} />
            Last Year
          </button>

          {/* Projected Toggle */}
          <button
            onClick={() => setShowProjected(!showProjected)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              showProjected
                ? 'bg-[#374151] text-white'
                : 'bg-transparent text-slate-400 border border-[#374151] hover:border-slate-500'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showProjected ? 'bg-white' : 'bg-slate-400'}`} />
            Projected
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
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
              {/* Gradient for Projected */}
              <linearGradient id="gradientProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />

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
                  projected: 'Projected',
                };
                return [`${value}M đ`, labels[name] || name];
              }}
            />

            {/* Projected Area - Render first (bottom layer) */}
            {showProjected && (
              <Area
                type="monotone"
                dataKey="projected"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#gradientProjected)"
                name="projected"
              />
            )}

            {/* Last Year Area - Middle layer */}
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
              {weeklyData.reduce((sum, d) => sum + (d.actual || 0), 0)}M đ
            </span></span>
          </div>
        )}
        {showLastYear && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
            <span>Last Year: <span className="text-white font-medium">
              {weeklyData.reduce((sum, d) => sum + (d.lastYear || 0), 0)}M đ
            </span></span>
          </div>
        )}
        {showProjected && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-500" />
            <span>Projected: <span className="text-white font-medium">
              {weeklyData.reduce((sum, d) => sum + (d.projected || 0), 0)}M đ
            </span></span>
          </div>
        )}
      </div>
    </div>
  );
}
