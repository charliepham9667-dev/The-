import { Bell, Settings, Search, LogOut, ChevronRight, Home } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function Header() {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#374151] bg-[#0f1419] px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Home className="h-4 w-4 text-slate-400" />
        <span className="text-slate-400">Home</span>
        <ChevronRight className="h-4 w-4 text-slate-500" />
        <span className="text-slate-400">Owner Dashboard</span>
        <ChevronRight className="h-4 w-4 text-slate-500" />
        <span className="text-white">Command Center</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search employees, shifts, tasks..."
            className="w-full rounded-lg border border-[#374151] bg-[#1a1f2e] py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#ff6b35] focus:outline-none"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* User badge */}
        <div className="flex items-center gap-2 rounded-full bg-[#1a1f2e] px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-white capitalize">{profile?.role || 'Owner'}</span>
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-[#1a1f2e] hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            2
          </span>
        </button>

        {/* Settings */}
        <button className="rounded-lg p-2 text-slate-400 hover:bg-[#1a1f2e] hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
        </button>

        {/* Logout */}
        <button
          onClick={signOut}
          className="rounded-lg p-2 text-slate-400 hover:bg-[#1a1f2e] hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
