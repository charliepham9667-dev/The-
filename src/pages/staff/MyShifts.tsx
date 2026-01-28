import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useShifts, useClockInOut } from '../../hooks/useShifts';

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  in_progress: { label: 'In Progress', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  completed: { label: 'Completed', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  no_show: { label: 'No Show', color: 'text-red-400', bg: 'bg-red-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-500/10' },
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
          <h1 className="text-2xl font-semibold text-white">My Shifts</h1>
          <p className="text-sm text-slate-400 mt-1">View and manage your scheduled shifts</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="rounded-lg p-2 text-slate-400 hover:bg-[#374151] hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-white font-medium">{formatWeekRange()}</span>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="rounded-lg p-2 text-slate-400 hover:bg-[#374151] hover:text-white transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Shifts List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading shifts...</div>
        ) : myShifts.length === 0 ? (
          <div className="text-center py-8 rounded-xl border border-[#374151] bg-[#1a1f2e]">
            <p className="text-slate-400">No shifts scheduled for this week</p>
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
                    ? 'border-[#ff6b35]/30 bg-[#ff6b35]/5' 
                    : 'border-[#374151] bg-[#1a1f2e]'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-medium ${isToday ? 'text-[#ff6b35]' : 'text-white'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-[#ff6b35] px-2 py-0.5 text-[10px] font-medium text-white">
                      TODAY
                    </span>
                  )}
                </div>

                {dayShifts.length === 0 ? (
                  <p className="text-sm text-slate-500">No shift</p>
                ) : (
                  <div className="space-y-2">
                    {dayShifts.map((shift) => {
                      const config = statusConfig[shift.status];
                      const canClockIn = shift.status === 'scheduled' && isToday;
                      const canClockOut = shift.status === 'in_progress';

                      return (
                        <div key={shift.id} className="flex items-center justify-between rounded-lg bg-[#0f1419] p-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {shift.startTime} - {shift.endTime}
                              </p>
                              <p className="text-xs text-slate-400 capitalize">{shift.role}</p>
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
                                className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors"
                              >
                                <Clock className="h-3 w-3" />
                                Clock In
                              </button>
                            )}
                            {canClockOut && (
                              <button
                                onClick={() => handleClockAction(shift.id, 'clock_out')}
                                disabled={clockInOut.isPending}
                                className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
                              >
                                <XCircle className="h-3 w-3" />
                                Clock Out
                              </button>
                            )}
                            {shift.status === 'completed' && (
                              <CheckCircle className="h-5 w-5 text-emerald-400" />
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
