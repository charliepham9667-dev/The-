import { TrendingUp, TrendingDown } from 'lucide-react';
import type { PnlMonthly } from '../../types';

interface FinancialKPICardsProps {
  actualData: PnlMonthly | null;
  budgetData?: PnlMonthly | null;
  className?: string;
}

const formatVND = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1000000000) return `${(value / 1000000000).toFixed(1)}B đ`;
  if (absValue >= 1000000) return `${(value / 1000000).toFixed(0)}M đ`;
  if (absValue >= 1000) return `${(value / 1000).toFixed(0)}K đ`;
  return `${value.toLocaleString()} đ`;
};

interface KPICardProps {
  title: string;
  value: string;
  subValue?: string;
  variance?: number;
  varianceLabel?: string;
  isPositive?: boolean;
}

function KPICard({ title, value, subValue, variance, varianceLabel, isPositive }: KPICardProps) {
  const hasVariance = variance !== undefined && variance !== null;
  const isGood = isPositive ?? (variance ? variance >= 0 : true);
  
  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
      <p className="text-xs text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subValue && <p className="text-sm text-slate-400 mt-0.5">{subValue}</p>}
      {hasVariance && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
          {isGood ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{variance >= 0 ? '+' : ''}{variance.toFixed(1)}% {varianceLabel || 'vs Budget'}</span>
        </div>
      )}
    </div>
  );
}

export function FinancialKPICards({ actualData, budgetData, className = '' }: FinancialKPICardsProps) {
  if (!actualData) {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-20 mb-2" />
            <div className="h-8 bg-slate-700 rounded w-28" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate KPIs
  const totalRevenue = actualData.grossSales || actualData.netSales;
  const budgetRevenue = budgetData?.grossSales || budgetData?.budgetGrossSales || budgetData?.netSales || budgetData?.budgetNetSales || 0;
  const revenueVariance = budgetRevenue > 0 ? ((totalRevenue - budgetRevenue) / budgetRevenue) * 100 : 0;

  // Gross Margin = (Revenue - COGS) / Revenue × 100
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - actualData.cogs) / totalRevenue) * 100 : 0;
  const budgetGrossMargin = budgetRevenue > 0 && budgetData?.cogs 
    ? ((budgetRevenue - (budgetData.cogs || budgetData.budgetCogs || 0)) / budgetRevenue) * 100 
    : 0;
  const grossMarginVariance = budgetGrossMargin > 0 ? grossMargin - budgetGrossMargin : 0;

  // EBIT % = EBIT / Revenue × 100
  const ebitPercent = totalRevenue > 0 ? (actualData.ebit / totalRevenue) * 100 : 0;
  const budgetEbitPercent = budgetRevenue > 0 && budgetData?.ebit 
    ? (budgetData.ebit / budgetRevenue) * 100 
    : 0;
  const ebitVariance = budgetEbitPercent !== 0 ? ebitPercent - budgetEbitPercent : 0;

  // Net Income (EBIT)
  const netIncome = actualData.ebit;
  const budgetNetIncome = budgetData?.ebit || 0;
  const netIncomeVariance = budgetNetIncome !== 0 ? ((netIncome - budgetNetIncome) / Math.abs(budgetNetIncome)) * 100 : 0;

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <KPICard
        title="Total Revenue"
        value={formatVND(totalRevenue)}
        variance={revenueVariance}
        varianceLabel="vs Budget"
        isPositive={revenueVariance >= 0}
      />
      
      <KPICard
        title="Gross Margin"
        value={`${grossMargin.toFixed(1)}%`}
        subValue={`(Revenue - COGS) / Revenue`}
        variance={grossMarginVariance}
        varianceLabel="vs Goal"
        isPositive={grossMarginVariance >= 0}
      />
      
      <KPICard
        title="EBIT %"
        value={`${ebitPercent.toFixed(1)}%`}
        subValue={`EBIT / Revenue`}
        variance={ebitVariance}
        varianceLabel="vs Target"
        isPositive={ebitVariance >= 0}
      />
      
      <KPICard
        title="Net Income"
        value={formatVND(netIncome)}
        variance={netIncomeVariance}
        varianceLabel="vs Budget"
        isPositive={netIncomeVariance >= 0}
      />
    </div>
  );
}
