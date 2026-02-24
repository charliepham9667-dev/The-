import { useState } from 'react';
import { DollarSign, Users, CreditCard, Target, Loader2, Settings, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { KPICard } from './KPICard';
import { WeeklySalesTrend } from './WeeklySalesTrend';
import { ServiceReviews } from './ServiceReviews';
import { MonthlyPerformance } from './MonthlyPerformance';
import { RealTimeStaffing } from './RealTimeStaffing';
import { ComplianceAlerts } from './ComplianceAlerts';
import { TargetManager } from './TargetManager';
import { RevenueVelocity } from './RevenueVelocity';
import { ExecutiveSummary } from './ExecutiveSummary';

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
  const [showTargetManager, setShowTargetManager] = useState(false);

  const { data, isLoading, error } = useDashboardSummary();

  const kpi = data?.kpiSummary;
  const syncStatus = data?.syncStatus;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Greeting + Sync Status - responsive text and layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Hello, {firstName}</h1>
        
        {/* Sync Status Indicator */}
        {syncStatus && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs w-fit ${
            syncStatus.isStale 
              ? 'bg-warning/20 text-warning' 
              : 'bg-success/20 text-success'
          }`}>
            {syncStatus.isStale ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {syncStatus.lastSyncAt ? (
              syncStatus.hoursAgo === 0 
                ? 'Synced recently' 
                : syncStatus.hoursAgo === 1 
                  ? 'Synced 1 hour ago'
                  : `Synced ${syncStatus.hoursAgo}h ago`
            ) : (
              'Not synced'
            )}
          </div>
        )}
      </div>

      {/* KPI Cards Row - 1 col on xs, 2 cols on sm+, 4 cols on lg+ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-8 text-error">
            Failed to load dashboard. Check Supabase connection.
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
            <TargetMetCard 
              percentage={kpi?.targetMet.percentage || 0} 
              isOnTrack={kpi?.targetMet.isOnTrack || false} 
              onEdit={() => setShowTargetManager(true)}
            />
          </>
        )}
      </div>

      {/* Charts Row - stack on mobile, 2+1 on lg+ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        <div className="md:col-span-2 lg:col-span-2 flex">
          <WeeklySalesTrend
            data={data?.weeklySales}
            dailyTargetPace={data?.revenueVelocity.dailyTargetPace}
            isLoading={isLoading}
          />
        </div>
        {/* Monthly Performance - hidden on mobile, visible on md+ */}
        <div className="hidden md:flex">
          <MonthlyPerformance data={data?.monthlyPerformance} isLoading={isLoading} />
        </div>
      </div>

      {/* Revenue Velocity + Executive Summary Row - stack on mobile */}
      <div className="grid gap-4 md:grid-cols-2 items-stretch">
        <div className="flex">
          <RevenueVelocity data={data?.revenueVelocity} isLoading={isLoading} />
        </div>
        {/* Executive Summary - hidden on mobile, visible on md+ */}
        <div className="hidden md:flex">
          <ExecutiveSummary
            velocity={data?.revenueVelocity}
            kpi={data?.kpiSummary}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Bottom Widgets Row - stack on mobile, 3 cols on lg+ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        <div className="flex">
          <ServiceReviews data={data?.googleReviews} isLoading={isLoading} />
        </div>
        <div className="flex">
          <RealTimeStaffing data={data?.staffing} isLoading={isLoading} />
        </div>
        {/* Compliance - hidden on mobile, visible on md+ */}
        <div className="hidden md:flex">
          <ComplianceAlerts data={data?.compliance} isLoading={isLoading} />
        </div>
      </div>

      {/* Target Manager Modal */}
      <TargetManager isOpen={showTargetManager} onClose={() => setShowTargetManager(false)} />
    </div>
  );
}

// Target Met card with circular progress indicator
function TargetMetCard({ percentage, isOnTrack, onEdit }: { percentage: number; isOnTrack: boolean; onEdit: () => void }) {
  // Using semantic color classes with fallback for SVG stroke
  const strokeColor = isOnTrack ? '#22c55e' : '#f59e0b'; // success green or warning amber
  
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 min-h-[100px] md:min-h-[120px]">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-muted-foreground">
              TARGET MET
            </p>
            <button
              onClick={onEdit}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Manage targets"
            >
              <Settings className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </button>
          </div>
          <div className="mt-1 md:mt-2 flex items-center gap-2 md:gap-3">
            {/* Circular Progress - smaller on mobile */}
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <svg className="h-10 w-10 md:h-12 md:w-12 -rotate-90 transform">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  className="stroke-border"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  stroke={strokeColor}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(percentage / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-semibold text-foreground">
                {percentage}%
              </span>
            </div>
            <span className="text-lg md:text-xl font-bold text-foreground">
              {isOnTrack ? 'On Track' : 'Behind'}
            </span>
          </div>
        </div>
        <div className={`rounded-lg p-2 md:p-2.5 ${isOnTrack ? 'bg-success' : 'bg-warning'}`}>
          <Target className="h-4 w-4 md:h-5 md:w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
