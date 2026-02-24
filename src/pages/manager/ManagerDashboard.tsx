import { 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Bell,
  ChevronRight,
  UserCheck,
  ListChecks,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTodayReservations } from '../../hooks/useReservations';
import { usePendingLeaveRequests } from '../../hooks/useLeaveRequests';
import { useShifts, useStaffList } from '../../hooks/useShifts';
import { useTaskCompletionStats } from '../../hooks/useTasks';
import { useClockRecords } from '../../hooks/useClockRecords';
import { useMyAssignedTasks } from '../../hooks/useDelegationTasks';

export function ManagerDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const { data: todayReservations } = useTodayReservations();
  const { data: pendingLeave } = usePendingLeaveRequests();
  const { data: shifts } = useShifts(today);
  const { data: staff } = useStaffList();
  const { data: clockRecords } = useClockRecords(todayStr, todayStr);
  const { data: taskStats } = useTaskCompletionStats(todayStr, todayStr);
  const { data: delegatedTasks } = useMyAssignedTasks();

  // Calculate stats
  const todayShifts = shifts?.filter(s => s.shiftDate === todayStr) || [];
  const activeShifts = todayShifts.filter(s => s.status === 'in_progress');
  const scheduledShifts = todayShifts.filter(s => s.status === 'scheduled');
  
  const upcomingReservations = todayReservations?.filter(
    r => r.status === 'confirmed' || r.status === 'pending'
  ) || [];
  
  const totalExpectedGuests = upcomingReservations.reduce(
    (sum, r) => sum + r.partySize, 0
  );

  // Clock status
  const clockedIn = new Set(
    clockRecords?.filter(r => r.clockType === 'in').map(r => r.staffId)
  );
  const clockedOut = new Set(
    clockRecords?.filter(r => r.clockType === 'out').map(r => r.staffId)
  );
  const currentlyWorking = [...clockedIn].filter(id => !clockedOut.has(id));

  // Task completion rate
  const taskCompletionRate = taskStats?.length 
    ? Math.round(taskStats.filter(t => t.isFullyCompleted).length / taskStats.length * 100)
    : 0;

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {getGreeting()}, {profile?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {today.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          iconColor="text-info"
          iconBg="bg-info/20"
          label="Staff On Duty"
          value={`${currentlyWorking.length}/${todayShifts.length}`}
          subtext={`${scheduledShifts.length} still expected`}
        />
        <StatCard
          icon={Calendar}
          iconColor="text-success"
          iconBg="bg-success/20"
          label="Reservations"
          value={upcomingReservations.length.toString()}
          subtext={`${totalExpectedGuests} guests expected`}
        />
        <StatCard
          icon={Clock}
          iconColor="text-warning"
          iconBg="bg-warning/20"
          label="Pending Leave"
          value={pendingLeave?.length.toString() || '0'}
          subtext="Awaiting review"
          alert={pendingLeave && pendingLeave.length > 0}
        />
        <StatCard
          icon={ListChecks}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/20"
          label="Task Completion"
          value={`${taskCompletionRate}%`}
          subtext="Today's checklists"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Today's Staff */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Staff Status
              </h3>
              <Link 
                to="/ops/staffing"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Manage <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="space-y-2">
              {todayShifts.slice(0, 5).map((shift) => {
                const isWorking = currentlyWorking.includes(shift.staffId);
                return (
                  <div 
                    key={shift.id}
                    className="flex items-center justify-between rounded-lg bg-background p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        isWorking ? 'bg-success animate-pulse' :
                        shift.status === 'completed' ? 'bg-muted-foreground' :
                        'bg-warning'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{shift.staffName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {shift.role} • {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      isWorking ? 'bg-success/20 text-success' :
                      shift.status === 'scheduled' ? 'bg-info/20 text-info' :
                      shift.status === 'completed' ? 'bg-muted text-muted-foreground' :
                      'bg-error/20 text-error'
                    }`}>
                      {isWorking ? 'Working' : shift.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
              {todayShifts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No shifts scheduled today</p>
              )}
            </div>
          </div>

          {/* Pending Leave Requests */}
          {pendingLeave && pendingLeave.length > 0 && (
            <div className="rounded-xl border border-warning/30 bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Pending Approvals
                </h3>
                <Link 
                  to="/manager/leave"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Review all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              
              <div className="space-y-2">
                {pendingLeave.slice(0, 3).map((request) => (
                  <div 
                    key={request.id}
                    className="flex items-center justify-between rounded-lg bg-background p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {request.staff?.fullName || 'Staff'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.startDate} to {request.endDate} • {request.totalDays} days
                      </p>
                    </div>
                    <Link
                      to={`/manager/leave`}
                      className="rounded-lg bg-warning/20 px-3 py-1 text-xs font-medium text-warning hover:bg-warning/30"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Delegated Tasks */}
          {delegatedTasks && delegatedTasks.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  My Delegated Tasks
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    {delegatedTasks.length}
                  </span>
                </h3>
                <Link 
                  to="/my-tasks"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {delegatedTasks.slice(0, 3).map((task) => (
                  <Link
                    key={task.id}
                    to="/my-tasks"
                    className="block rounded-lg bg-background p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        task.priority === 'urgent' ? 'bg-error/20 text-error' :
                        task.priority === 'high' ? 'bg-warning/20 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.assignedByProfile && (
                      <p className="text-xs text-muted-foreground mt-0.5">From {task.assignedByProfile.fullName}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Today's Reservations */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Today's Reservations
              </h3>
              <Link 
                to="/manager/reservations"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="space-y-2">
              {upcomingReservations.slice(0, 5).map((res) => (
                <div 
                  key={res.id}
                  className="flex items-center justify-between rounded-lg bg-background p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{res.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {res.reservationTime} • {res.partySize} guests
                      {res.tablePreference && ` • ${res.tablePreference}`}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    res.status === 'confirmed' ? 'bg-success/20 text-success' :
                    res.status === 'seated' ? 'bg-info/20 text-info' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {res.status}
                  </span>
                </div>
              ))}
              {upcomingReservations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No reservations today</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/manager/reservations/new"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="rounded-lg bg-success/20 p-2">
                <Calendar className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">New Booking</p>
                <p className="text-xs text-muted-foreground">Add reservation</p>
              </div>
            </Link>
            
            <Link
              to="/ops/staffing"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="rounded-lg bg-info/20 p-2">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Schedule</p>
                <p className="text-xs text-muted-foreground">Manage shifts</p>
              </div>
            </Link>
            
            <Link
              to="/manager/announcements/new"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="rounded-lg bg-purple-500/20 p-2">
                <Bell className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Announce</p>
                <p className="text-xs text-muted-foreground">Post update</p>
              </div>
            </Link>
            
            <Link
              to="/manager/tasks"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="rounded-lg bg-warning/20 p-2">
                <ListChecks className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Task Status</p>
                <p className="text-xs text-muted-foreground">Team progress</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  subtext: string;
  alert?: boolean;
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, subtext, alert }: StatCardProps) {
  return (
    <div className={`rounded-xl border bg-card p-4 ${
      alert ? 'border-warning/30' : 'border-border'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`rounded-lg ${iconBg} p-2`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {alert && (
          <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">
            Action needed
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}
