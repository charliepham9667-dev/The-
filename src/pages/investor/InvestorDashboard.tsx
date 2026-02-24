import { 
  DollarSign, 
  Users, 
  ListTodo, 
  MessageSquare, 
  ChevronRight, 
  FileText,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { useAllDelegationTasks } from '../../hooks/useDelegationTasks';
import { formatCurrency } from '../../lib/formatters';

export function InvestorDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardSummary();
  const { data: tasks } = useAllDelegationTasks(['todo', 'in_progress', 'blocked']);

  const kpi = dashboard?.kpiSummary;
  const revenueVelocity = dashboard?.revenueVelocity;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Investor Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Read-only access — {profile?.fullName}
        </p>
      </div>

      {/* Financial Overview */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Financial Overview
          </h3>
          <Link 
            to="/finance/pl"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Full P&L <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {dashboardLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">MTD Revenue</p>
              <p className="text-lg font-bold text-foreground">
                {kpi ? formatCurrency(kpi.revenue.value) : '—'}
              </p>
              {kpi?.revenue.trendLabel && (
                <p className="text-xs text-muted-foreground">{kpi.revenue.trendLabel}</p>
              )}
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">Goal Progress</p>
              <p className="text-lg font-bold text-foreground">
                {revenueVelocity ? `${revenueVelocity.goalAchievedPercent.toFixed(1)}%` : '—'}
              </p>
              {revenueVelocity && (
                <p className="text-xs text-muted-foreground">
                  Target: {formatCurrency(revenueVelocity.monthlyTarget)}
                </p>
              )}
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">Pax (MTD)</p>
              <p className="text-lg font-bold text-foreground">
                {kpi ? kpi.pax.value.toLocaleString() : '—'}
              </p>
              {kpi?.pax.trendLabel && (
                <p className="text-xs text-muted-foreground">{kpi.pax.trendLabel}</p>
              )}
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">Avg Spend</p>
              <p className="text-lg font-bold text-foreground">
                {kpi ? formatCurrency(kpi.avgSpend.value) : '—'}
              </p>
              {kpi?.avgSpend.trendLabel && (
                <p className="text-xs text-muted-foreground">{kpi.avgSpend.trendLabel}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Links - Read Only */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/finance/pl"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
        >
          <div className="rounded-lg bg-emerald-500/20 p-2">
            <FileText className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">P&L Performance</p>
            <p className="text-xs text-muted-foreground">Financial statements, revenue, expenses</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          to="/ops/workforce"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
        >
          <div className="rounded-lg bg-blue-500/20 p-2">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Workforce Overview</p>
            <p className="text-xs text-muted-foreground">Staff status and performance</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          to="/owner/tasks"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
        >
          <div className="rounded-lg bg-purple-500/20 p-2">
            <ListTodo className="h-6 w-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Task Delegation</p>
            <p className="text-xs text-muted-foreground">
              {tasks?.length ? `${tasks.length} active tasks` : 'View all tasks'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          to="/chat"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
        >
          <div className="rounded-lg bg-warning/20 p-2">
            <MessageSquare className="h-6 w-6 text-warning" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Chat</p>
            <p className="text-xs text-muted-foreground">Team messaging</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
