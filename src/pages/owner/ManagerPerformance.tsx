import { UserCheck, TrendingUp, Star, Target, Award } from 'lucide-react';

const managers = [
  {
    id: '1',
    name: 'Minh Tran',
    role: 'Bar Manager',
    avatar: null,
    metrics: {
      teamEfficiency: 94,
      customerRating: 4.8,
      targetsMet: 100,
      attendance: 98,
    },
    highlights: ['Zero complaints this month', 'Trained 2 new bartenders'],
  },
  {
    id: '2',
    name: 'Linh Nguyen',
    role: 'Floor Manager',
    avatar: null,
    metrics: {
      teamEfficiency: 88,
      customerRating: 4.6,
      targetsMet: 85,
      attendance: 100,
    },
    highlights: ['Improved table turnover by 15%'],
  },
  {
    id: '3',
    name: 'David Pham',
    role: 'Marketing Manager',
    avatar: null,
    metrics: {
      teamEfficiency: 92,
      customerRating: 4.7,
      targetsMet: 95,
      attendance: 96,
    },
    highlights: ['Social media engagement up 30%', 'VIP event success'],
  },
];

export function ManagerPerformance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Manager Performance</h1>
        <p className="text-sm text-slate-400 mt-1">Track and evaluate manager metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <UserCheck className="h-4 w-4" />
            <span className="text-xs">Active Managers</span>
          </div>
          <p className="text-2xl font-bold text-white">{managers.length}</p>
        </div>
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Avg Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">91%</p>
        </div>
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Star className="h-4 w-4" />
            <span className="text-xs">Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">4.7</p>
        </div>
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Target className="h-4 w-4" />
            <span className="text-xs">Targets Met</span>
          </div>
          <p className="text-2xl font-bold text-white">93%</p>
        </div>
      </div>

      {/* Manager Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {managers.map((manager) => (
          <div key={manager.id} className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-[#ff6b35] flex items-center justify-center text-white font-semibold">
                {manager.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{manager.name}</p>
                <p className="text-xs text-slate-400">{manager.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-[#0f1419] p-3">
                <p className="text-xs text-slate-400 mb-1">Efficiency</p>
                <p className="text-lg font-semibold text-emerald-400">{manager.metrics.teamEfficiency}%</p>
              </div>
              <div className="rounded-lg bg-[#0f1419] p-3">
                <p className="text-xs text-slate-400 mb-1">Rating</p>
                <p className="text-lg font-semibold text-yellow-400">{manager.metrics.customerRating}</p>
              </div>
              <div className="rounded-lg bg-[#0f1419] p-3">
                <p className="text-xs text-slate-400 mb-1">Targets</p>
                <p className="text-lg font-semibold text-white">{manager.metrics.targetsMet}%</p>
              </div>
              <div className="rounded-lg bg-[#0f1419] p-3">
                <p className="text-xs text-slate-400 mb-1">Attendance</p>
                <p className="text-lg font-semibold text-white">{manager.metrics.attendance}%</p>
              </div>
            </div>

            <div className="border-t border-[#374151] pt-3">
              <p className="text-xs text-slate-400 mb-2">Highlights</p>
              {manager.highlights.map((highlight, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <Award className="h-3 w-3 text-[#ff6b35]" />
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
