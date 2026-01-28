import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Mock data - just January for now
const monthlyData = [
  { month: 'Jan', value: 794 },
];

export function MonthlyPerformance() {
  const target = 750;
  const achieved = 794;
  const percentageChange = '+105.9%';

  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6 h-64 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Monthly Performance</h3>
        <span className="flex items-center gap-1 text-sm font-medium text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          {percentageChange}
        </span>
      </div>

      {/* Target info */}
      <p className="text-sm text-slate-400 mb-4">
        Target Achievement: <span className="text-white font-medium">{achieved}M đ</span> / {target}M đ
      </p>

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} layout="vertical">
            <XAxis
              type="number"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 800]}
              tickFormatter={(v) => `${v / 1000}B`}
            />
            <YAxis
              type="category"
              dataKey="month"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [`${value}M đ`, 'Revenue']}
            />
            <ReferenceLine
              x={target}
              stroke="#6b7280"
              strokeDasharray="3 3"
              label={{ value: 'Target', fill: '#6b7280', fontSize: 10 }}
            />
            <Bar
              dataKey="value"
              fill="#ff6b35"
              radius={[0, 4, 4, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
