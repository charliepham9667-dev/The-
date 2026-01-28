import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

const plData = {
  revenue: { value: 794000000, change: 12.5, label: 'Total Revenue' },
  cogs: { value: 238000000, change: -3.2, label: 'Cost of Goods' },
  grossProfit: { value: 556000000, change: 18.3, label: 'Gross Profit' },
  laborCost: { value: 94000000, change: 5.1, label: 'Labor Cost' },
  overhead: { value: 85000000, change: 2.0, label: 'Overhead' },
  netProfit: { value: 377000000, change: 22.4, label: 'Net Profit' },
};

const formatVND = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B đ`;
  if (value >= 1000000) return `${Math.round(value / 1000000)}M đ`;
  return `${value.toLocaleString()} đ`;
};

export function PLPerformance() {
  const grossMargin = ((plData.grossProfit.value / plData.revenue.value) * 100).toFixed(1);
  const netMargin = ((plData.netProfit.value / plData.revenue.value) * 100).toFixed(1);
  const laborPercent = ((plData.laborCost.value / plData.revenue.value) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">P&L Performance</h1>
        <p className="text-sm text-slate-400 mt-1">Profit and Loss Analysis - January 2026</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatVND(plData.revenue.value)}</p>
          <p className="text-xs text-emerald-400 mt-1">+{plData.revenue.change}% vs LM</p>
        </div>
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Percent className="h-4 w-4" />
            <span className="text-xs">Gross Margin</span>
          </div>
          <p className="text-2xl font-bold text-white">{grossMargin}%</p>
          <p className="text-xs text-emerald-400 mt-1">Target: 65%</p>
        </div>
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Percent className="h-4 w-4" />
            <span className="text-xs">Labor %</span>
          </div>
          <p className="text-2xl font-bold text-white">{laborPercent}%</p>
          <p className="text-xs text-yellow-400 mt-1">Target: 30%</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Net Margin</span>
          </div>
          <p className="text-2xl font-bold text-white">{netMargin}%</p>
          <p className="text-xs text-emerald-400 mt-1">+{plData.netProfit.change}% vs LM</p>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">P&L Statement</h2>
        <div className="space-y-3">
          {Object.entries(plData).map(([key, data]) => {
            const isExpense = ['cogs', 'laborCost', 'overhead'].includes(key);
            const isProfit = ['grossProfit', 'netProfit'].includes(key);
            
            return (
              <div
                key={key}
                className={`flex items-center justify-between py-3 ${
                  isProfit ? 'border-t border-[#374151]' : ''
                }`}
              >
                <span className={`text-sm ${isProfit ? 'font-semibold text-white' : 'text-slate-300'}`}>
                  {data.label}
                </span>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${
                    isExpense ? 'text-red-400' : isProfit ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {isExpense ? '-' : ''}{formatVND(data.value)}
                  </span>
                  <div className={`flex items-center gap-1 text-xs ${
                    data.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {data.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{Math.abs(data.change)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="rounded-xl border border-dashed border-[#374151] bg-[#1a1f2e]/50 p-8 text-center">
        <p className="text-slate-400">Detailed charts and trend analysis coming soon...</p>
      </div>
    </div>
  );
}
