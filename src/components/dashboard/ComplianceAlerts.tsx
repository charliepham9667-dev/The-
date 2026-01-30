import { AlertCircle, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useCompliance } from '../../hooks/useDashboardData';

type AlertStatus = 'action_required' | 'needs_attention' | 'passed' | 'pending';

// Calculate days remaining until due date
function getDaysRemaining(dueDate: string | null): number | null {
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

const statusConfig: Record<AlertStatus, {
  icon: typeof AlertCircle;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
}> = {
  action_required: {
    icon: AlertCircle,
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    badgeBg: 'bg-red-500',
    badgeText: 'Action Required',
  },
  needs_attention: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-500',
    badgeText: 'Needs Attention',
  },
  passed: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500',
    badgeText: 'Passed',
  },
  pending: {
    icon: AlertTriangle,
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-400',
    badgeBg: 'bg-slate-500',
    badgeText: 'Pending',
  },
};

export function ComplianceAlerts() {
  const { data: complianceItems, isLoading, error } = useCompliance();

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
        <p className="text-slate-400">Failed to load compliance data</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[200px] md:min-h-[256px] w-full flex flex-col">
      {/* Header */}
      <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Compliance Alerts</h3>

      {/* Alerts List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {(complianceItems || []).map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          const daysRemaining = getDaysRemaining(item.dueDate);

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-lg p-3 ${config.bgColor} border ${config.borderColor}`}
            >
              <Icon className={`h-5 w-5 mt-0.5 ${config.textColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                  {daysRemaining !== null && daysRemaining > 0 && (
                    <span className="rounded-full bg-red-500/30 px-2 py-0.5 text-[10px] font-medium text-red-400">
                      {daysRemaining} days
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-2">{item.description}</p>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium text-white ${config.badgeBg}`}
                >
                  {config.badgeText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
