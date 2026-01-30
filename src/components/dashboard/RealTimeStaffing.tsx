import { Users, AlertTriangle, UserCheck, Loader2 } from 'lucide-react';
import { useStaffing } from '../../hooks/useDashboardData';

export function RealTimeStaffing() {
  const { data, isLoading, error } = useStaffing();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[200px] md:min-h-[256px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[200px] md:min-h-[256px] w-full flex items-center justify-center">
        <p className="text-slate-400">Failed to load staffing data</p>
      </div>
    );
  }

  const activeStaff = data?.activeStaff || 0;
  const totalRequired = data?.totalRequired || 0;
  const coverage = data?.coveragePercentage || 0;
  const guestStaffRatio = data?.guestStaffRatio ? `${data.guestStaffRatio} : 1` : 'N/A';
  const coverageGaps = data?.coverageGaps || [];
  const hasGaps = coverageGaps.length > 0;

  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[200px] md:min-h-[256px] w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold text-white">Real-time Staffing</h3>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-4 flex-1">
        {/* Active Staff */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#374151] p-2">
              <Users className="h-4 w-4 text-slate-300" />
            </div>
            <span className="text-sm text-slate-300">Active Staff</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-white">
              {activeStaff}<span className="text-slate-400">/{totalRequired}</span>
            </span>
            <p className="text-xs text-slate-400">{coverage}% coverage</p>
          </div>
        </div>

        {/* Coverage Gaps */}
        {hasGaps && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-2 md:p-3">
            <div className="flex items-center gap-2 md:gap-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-white">Coverage Gaps</p>
                <p className="text-[10px] md:text-xs text-slate-400 truncate">
                  {coverageGaps.map(g => `${g.count} ${g.role}`).join(', ')} shortage
                </p>
              </div>
            </div>
            <button className="rounded-md bg-white px-3 py-2 md:px-3 md:py-1.5 text-xs font-medium text-[#0f1419] hover:bg-slate-200 transition-colors min-h-[36px] md:min-h-0 w-full sm:w-auto">
              RESOLVE
            </button>
          </div>
        )}

        {/* Guest:Staff Ratio */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#374151] p-2">
              <UserCheck className="h-4 w-4 text-slate-300" />
            </div>
            <span className="text-sm text-slate-300">Guest:Staff Ratio</span>
          </div>
          <span className="text-xl font-bold text-white">{guestStaffRatio}</span>
        </div>
      </div>
    </div>
  );
}
