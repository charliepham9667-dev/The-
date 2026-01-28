import { DollarSign, Users, CreditCard, Target, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useKPISummary } from '../../hooks/useDashboardData';
import { KPICard } from './KPICard';
import { WeeklySalesTrend } from './WeeklySalesTrend';
import { ServiceReviews } from './ServiceReviews';
import { MonthlyPerformance } from './MonthlyPerformance';
import { RealTimeStaffing } from './RealTimeStaffing';
import { ComplianceAlerts } from './ComplianceAlerts';

// Format large numbers for display
function formatVND(value: number): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B đ`;
  if (value >= 1000000) return `${Math.round(value / 1000000)}M đ`;
  if (value >= 1000) return `${Math.round(value / 1000)}K đ`;
  return `${value} đ`;
}

export function OwnerOverview() {
  const profile = useAuthStore((s) => s.profile);
  const firstName = profile?.fullName?.split(' ')[0] || 'Charlie';
  
  const { data: kpi, isLoading, error } = useKPISummary();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-semibold text-white">Hello, {firstName}</h1>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-8 text-red-400">
            Failed to load KPIs. Check Supabase connection.
          </div>
        ) : (
          <>
            <KPICard
              title="REVENUE"
              value={formatVND(kpi?.revenue.value || 0)}
              subtitle={kpi?.revenue.trendLabel || ''}
              icon={DollarSign}
              iconBgColor="bg-emerald-500"
              trend={(kpi?.revenue.trend || 0) >= 0 ? 'up' : 'down'}
            />
            <KPICard
              title="PAX"
              value={(kpi?.pax.value || 0).toLocaleString()}
              subtitle={kpi?.pax.trendLabel || ''}
              icon={Users}
              iconBgColor="bg-purple-500"
              trend={(kpi?.pax.trend || 0) >= 0 ? 'up' : 'down'}
            />
            <KPICard
              title="AVG SPEND"
              value={formatVND(kpi?.avgSpend.value || 0)}
              subtitle={kpi?.avgSpend.trendLabel || ''}
              icon={CreditCard}
              iconBgColor="bg-blue-500"
              trend={(kpi?.avgSpend.trend || 0) >= 0 ? 'up' : 'down'}
            />
            <TargetMetCard percentage={kpi?.targetMet.percentage || 0} isOnTrack={kpi?.targetMet.isOnTrack || false} />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklySalesTrend />
        </div>
        <ServiceReviews />
      </div>

      {/* Bottom Widgets Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <MonthlyPerformance />
        <RealTimeStaffing />
        <ComplianceAlerts />
      </div>
    </div>
  );
}

// Target Met card with circular progress indicator
function TargetMetCard({ percentage, isOnTrack }: { percentage: number; isOnTrack: boolean }) {
  const strokeColor = isOnTrack ? '#22c55e' : '#f59e0b';
  
  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            TARGET MET
          </p>
          <div className="mt-2 flex items-center gap-3">
            {/* Circular Progress */}
            <div className="relative h-12 w-12">
              <svg className="h-12 w-12 -rotate-90 transform">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#374151"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={strokeColor}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(percentage / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                {percentage}%
              </span>
            </div>
            <span className="text-xl font-bold text-white">
              {isOnTrack ? 'On Track' : 'Behind'}
            </span>
          </div>
        </div>
        <div className={`rounded-lg p-2.5 ${isOnTrack ? 'bg-emerald-500' : 'bg-amber-500'}`}>
          <Target className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

