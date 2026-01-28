import { Loader2, Clock, User } from 'lucide-react';
import type { Shift } from '../../hooks/useShifts';

interface ShiftCalendarProps {
  weekStart: Date;
  shifts: Shift[];
  isLoading: boolean;
  onEditShift: (shiftId: string) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const statusColors: Record<string, string> = {
  scheduled: 'border-blue-500 bg-blue-500/10',
  in_progress: 'border-emerald-500 bg-emerald-500/10',
  completed: 'border-slate-500 bg-slate-500/10',
  no_show: 'border-red-500 bg-red-500/10',
  cancelled: 'border-slate-600 bg-slate-600/10 opacity-50',
};

const roleColors: Record<string, string> = {
  server: 'text-blue-400',
  bartender: 'text-purple-400',
  host: 'text-emerald-400',
  manager: 'text-orange-400',
  kitchen: 'text-yellow-400',
  default: 'text-slate-400',
};

export function ShiftCalendar({ weekStart, shifts, isLoading, onEditShift }: ShiftCalendarProps) {
  // Generate array of dates for the week
  const weekDates = DAYS.map((_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });

  // Group shifts by date
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const dateKey = shift.shiftDate;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-[#374151]">
        {weekDates.map((date, index) => (
          <div
            key={index}
            className={`p-3 text-center border-r border-[#374151] last:border-r-0 ${
              isToday(date) ? 'bg-[#ff6b35]/10' : ''
            }`}
          >
            <p className="text-xs text-slate-400 uppercase">{DAYS[index]}</p>
            <p className={`text-lg font-semibold ${isToday(date) ? 'text-[#ff6b35]' : 'text-white'}`}>
              {date.getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDates.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0];
          const dayShifts = shiftsByDate[dateKey] || [];

          return (
            <div
              key={index}
              className={`p-2 border-r border-[#374151] last:border-r-0 ${
                isToday(date) ? 'bg-[#ff6b35]/5' : ''
              }`}
            >
              <div className="space-y-2">
                {dayShifts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No shifts</p>
                ) : (
                  dayShifts.map((shift) => (
                    <button
                      key={shift.id}
                      onClick={() => onEditShift(shift.id)}
                      className={`w-full rounded-lg border-l-2 p-2 text-left transition-colors hover:bg-[#374151]/50 ${
                        statusColors[shift.status] || statusColors.scheduled
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="text-xs font-medium text-white truncate">
                          {shift.staffName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span className="text-[10px] text-slate-400">
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </span>
                      </div>
                      <span className={`text-[10px] capitalize ${roleColors[shift.role] || roleColors.default}`}>
                        {shift.role}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t border-[#374151] bg-[#0f1419]">
        <span className="text-xs text-slate-500">Status:</span>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-xs text-slate-400">Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-400">In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          <span className="text-xs text-slate-400">Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-xs text-slate-400">No Show</span>
        </div>
      </div>
    </div>
  );
}
