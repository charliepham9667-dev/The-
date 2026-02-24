import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useShifts, useClockInOut } from '../../hooks/useShifts';

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'text-info', bg: 'bg-info/20' },
  in_progress: { label: 'In Progress', color: 'text-success', bg: 'bg-success/20' },
  completed: { label: 'Completed', color: 'text-muted-foreground', bg: 'bg-muted' },
  no_show: { label: 'No Show', color: 'text-error', bg: 'bg-error/20' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted/50' },
};

export function MyShifts() {
  const profile = useAuthStore((s) => s.profile);
  const [weekOffset, setWeekOffset] = useState(0);
  
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  
  const { data: shifts, isLoading } = useShifts(weekStart);
  const clockInOut = useClockInOut();

  const myShifts = shifts?.filter(s => s.staffId === profile?.id) || [];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const handleClockAction = (shiftId: string, action: 'clock_in' | 'clock_out') => {
    clockInOut.mutate({ shiftId, action });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Shifts</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage your scheduled shifts</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-foreground font-medium">{formatWeekRange()}</span>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Shifts List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading shifts...</div>
        ) : myShifts.length === 0 ? (
          <div className="text-center py-8 rounded-xl border border-border bg-card">
            <p className="text-muted-foreground">No shifts scheduled for this week</p>
          </div>
        ) : (
          weekDays.map((day) => {
            const dayStr = day.toISOString().split('T')[0];
            const dayShifts = myShifts.filter(s => s.shiftDate === dayStr);
            const isToday = dayStr === today.toISOString().split('T')[0];

            return (
              <div 
                key={dayStr} 
                className={`rounded-xl border p-4 ${
                  isToday 
                    ? 'border-primary/30 bg-primary/5' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                      TODAY
                    </span>
                  )}
                </div>

                {dayShifts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No shift</p>
                ) : (
                  <div className="space-y-2">
                    {dayShifts.map((shift) => {
                      const config = statusConfig[shift.status];
                      const canClockIn = shift.status === 'scheduled' && isToday;
                      const canClockOut = shift.status === 'in_progress';

                      return (
                        <div key={shift.id} className="flex items-center justify-between rounded-lg bg-background p-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {shift.startTime} - {shift.endTime}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">{shift.role}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {canClockIn && (
                              <button
                                onClick={() => handleClockAction(shift.id, 'clock_in')}
                                disabled={clockInOut.isPending}
                                className="flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-success/90 transition-colors"
                              >
                                <Clock className="h-3 w-3" />
                                Clock In
                              </button>
                            )}
                            {canClockOut && (
                              <button
                                onClick={() => handleClockAction(shift.id, 'clock_out')}
                                disabled={clockInOut.isPending}
                                className="flex items-center gap-1 rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-white hover:bg-error/90 transition-colors"
                              >
                                <XCircle className="h-3 w-3" />
                                Clock Out
                              </button>
                            )}
                            {shift.status === 'completed' && (
                              <CheckCircle className="h-5 w-5 text-success" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
