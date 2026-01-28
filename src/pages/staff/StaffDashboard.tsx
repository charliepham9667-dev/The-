import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useShifts } from '../../hooks/useShifts';

export function StaffDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  const { data: shifts, isLoading } = useShifts(weekStart);

  const myShifts = shifts?.filter(s => s.staffId === profile?.id) || [];
  const todayShift = myShifts.find(s => s.shiftDate === today.toISOString().split('T')[0]);
  const upcomingShifts = myShifts.filter(s => new Date(s.shiftDate) > today).slice(0, 3);
  const completedThisWeek = myShifts.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Welcome back, {profile?.fullName?.split(' ')[0]}!
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Today's Shift */}
      <div className={`rounded-xl border p-6 ${
        todayShift 
          ? 'border-[#ff6b35]/30 bg-[#ff6b35]/10' 
          : 'border-[#374151] bg-[#1a1f2e]'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-[#ff6b35]" />
          <h2 className="text-lg font-semibold text-white">Today's Shift</h2>
        </div>
        
        {todayShift ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {todayShift.startTime} - {todayShift.endTime}
              </p>
              <p className="text-sm text-slate-400 capitalize">{todayShift.role}</p>
            </div>
            <div className="text-right">
              {todayShift.status === 'in_progress' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                  <Clock className="h-4 w-4" />
                  Clocked In
                </span>
              ) : todayShift.status === 'scheduled' ? (
                <button className="rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a2b] transition-colors">
                  Clock In
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/20 px-3 py-1 text-sm text-slate-400">
                  <CheckCircle className="h-4 w-4" />
                  {todayShift.status}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400">No shift scheduled for today</p>
            <p className="text-sm text-slate-500 mt-1">Enjoy your day off!</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
          <p className="text-xs text-slate-400">This Week</p>
          <p className="text-2xl font-bold text-white">{myShifts.length}</p>
          <p className="text-xs text-slate-500">shifts scheduled</p>
        </div>
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
          <p className="text-xs text-slate-400">Completed</p>
          <p className="text-2xl font-bold text-emerald-400">{completedThisWeek}</p>
          <p className="text-xs text-slate-500">shifts this week</p>
        </div>
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
          <p className="text-xs text-slate-400">Hours</p>
          <p className="text-2xl font-bold text-white">
            {myShifts.reduce((acc, s) => {
              const start = parseInt(s.startTime.split(':')[0]);
              const end = parseInt(s.endTime.split(':')[0]);
              return acc + (end > start ? end - start : 24 - start + end);
            }, 0)}
          </p>
          <p className="text-xs text-slate-500">scheduled this week</p>
        </div>
      </div>

      {/* Upcoming Shifts */}
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Shifts</h2>
        {isLoading ? (
          <p className="text-slate-400">Loading...</p>
        ) : upcomingShifts.length > 0 ? (
          <div className="space-y-3">
            {upcomingShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between py-2 border-b border-[#374151] last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">
                    {new Date(shift.shiftDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-400">{shift.startTime} - {shift.endTime}</p>
                </div>
                <span className="text-xs text-slate-400 capitalize">{shift.role}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No upcoming shifts scheduled</p>
        )}
      </div>
    </div>
  );
}
