import { 
  Clock, 
  Calendar, 
  ListChecks, 
  Bell,
  ChevronRight,
  Megaphone,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ClockInOut, TaskChecklistSummary, LeaveBalanceWidget } from '../../components/staff';
import { useShifts } from '../../hooks/useShifts';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useMyAssignedTasks } from '../../hooks/useDelegationTasks';

export function StaffDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const today = new Date();
  const { data: shifts } = useShifts(today);
  const { data: announcements } = useAnnouncements();
  const { data: delegatedTasks } = useMyAssignedTasks();

  // Get today's shift for current user
  const todayStr = today.toISOString().split('T')[0];
  const todayShift = shifts?.find(
    s => s.staffId === profile?.id && s.shiftDate === todayStr
  );

  // Unread announcements
  const unreadAnnouncements = announcements?.filter(a => !a.isRead) || [];

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
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

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Clock In/Out */}
          <ClockInOut />

          {/* Today's Shift Info */}
          {todayShift && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Today's Shift
                </h3>
                <Link 
                  to="/my-shifts"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {todayShift.startTime} - {todayShift.endTime}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{todayShift.role}</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                    todayShift.status === 'scheduled' ? 'bg-info/20 text-info' :
                    todayShift.status === 'in_progress' ? 'bg-success/20 text-success' :
                    todayShift.status === 'completed' ? 'bg-muted text-muted-foreground' :
                    'bg-error/20 text-error'
                  }`}>
                    {todayShift.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leave Balance */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Time Off
              </h3>
              <Link 
                to="/leave"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Request <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <LeaveBalanceWidget />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* My Delegated Tasks */}
          {delegatedTasks && delegatedTasks.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
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

          {/* Task Checklists */}
          <TaskChecklistSummary />

          {/* Announcements */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                Announcements
                {unreadAnnouncements.length > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {unreadAnnouncements.length} new
                  </span>
                )}
              </h3>
              <Link 
                to="/announcements"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            
            {announcements?.length ? (
              <div className="space-y-2">
                {announcements.slice(0, 3).map((announcement) => (
                  <Link
                    key={announcement.id}
                    to={`/announcements/${announcement.id}`}
                    className={`block rounded-lg p-3 transition-colors ${
                      announcement.isRead 
                        ? 'bg-background hover:bg-muted/50' 
                        : 'bg-primary/10 hover:bg-primary/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          announcement.isRead ? 'text-foreground' : 'text-primary'
                        }`}>
                          {announcement.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {announcement.body}
                        </p>
                      </div>
                      {announcement.isPinned && (
                        <span className="flex-shrink-0 text-xs text-warning">📌</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No announcements
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/my-shifts"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="rounded-lg bg-info/20 p-2">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">My Shifts</p>
                <p className="text-xs text-muted-foreground">View schedule</p>
              </div>
            </Link>
            
            <Link
              to="/tasks"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="rounded-lg bg-success/20 p-2">
                <ListChecks className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Checklists</p>
                <p className="text-xs text-muted-foreground">Daily tasks</p>
              </div>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="rounded-lg bg-purple-500/20 p-2">
                <Bell className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Profile</p>
                <p className="text-xs text-muted-foreground">Settings</p>
              </div>
            </Link>
            
            <Link
              to="/chat"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="rounded-lg bg-warning/20 p-2">
                <Megaphone className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Team Chat</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
