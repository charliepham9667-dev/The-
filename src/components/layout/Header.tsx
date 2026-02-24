import { Settings, Search, LogOut, ChevronRight, Home, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { NotificationBell } from '../common/NotificationBell';
import { RoleSwitcher } from '../dev/RoleSwitcher';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      {/* Left side: Menu button (mobile) + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Hamburger menu - visible on mobile only */}
        <button 
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Breadcrumb - hidden on mobile, visible on md+ */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <Home className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Home</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {/* Hide middle breadcrumb on tablet, show on lg+ */}
          <span className="hidden lg:inline text-muted-foreground">Owner Dashboard</span>
          <ChevronRight className="hidden lg:inline h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">Command Center</span>
        </div>
        
        {/* Mobile title - visible on mobile only */}
        <span className="md:hidden text-foreground font-medium">The Roof</span>
      </div>

      {/* Search - hidden on mobile, visible on md+ */}
      <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search employees, shifts, tasks..."
            className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Role Switcher - Owner only */}
        <RoleSwitcher />

        {/* Notifications */}
        <NotificationBell />

        {/* Settings - hidden on mobile */}
        <button className="hidden sm:block rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="h-5 w-5" />
        </button>

        {/* Logout */}
        <button
          onClick={signOut}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
