import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Target,
  DollarSign,
  FileText,
  PieChart,
  Wallet,
  Calculator,
  TrendingUp,
  Users,
  UserCheck,
  UsersRound,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Wine,
  Megaphone,
  UtensilsCrossed,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole, ManagerType } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: any;
}

interface NavSection {
  title: string;
  icon: any;
  defaultOpen?: boolean;
  items: NavItem[];
  allowedRoles?: UserRole[];
}

// Owner sees everything
const ownerSections: NavSection[] = [
  {
    title: 'Command Center',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { to: '/', label: 'Live Snapshot', icon: Activity },
      { to: '/my-dashboard', label: 'My Dashboard', icon: Target },
    ],
  },
  {
    title: 'Finance Analytics',
    icon: DollarSign,
    defaultOpen: false,
    items: [
      { to: '/finance/pl', label: 'P&L Performance', icon: FileText },
      { to: '/finance/reports', label: 'Report Builder', icon: PieChart },
      { to: '/finance/category', label: 'Category Drill-down', icon: PieChart },
      { to: '/finance/cashflow', label: 'Cash Flow', icon: Wallet },
      { to: '/finance/costs', label: 'Cost Control', icon: Calculator },
      { to: '/finance/forecast', label: 'Forecast', icon: TrendingUp },
    ],
  },
  {
    title: 'Operations',
    icon: Users,
    defaultOpen: false,
    items: [
      { to: '/ops/workforce', label: 'Workforce Overview', icon: UsersRound },
      { to: '/ops/managers', label: 'Manager Performance', icon: UserCheck },
      { to: '/ops/staffing', label: 'Staffing & Team', icon: Users },
    ],
  },
  {
    title: 'Admin',
    icon: Settings,
    defaultOpen: false,
    items: [
      { to: '/admin/sync', label: 'Data Sync', icon: RefreshCw },
    ],
  },
];

// Manager sees dashboard, their team, operations
const getManagerSections = (managerType: ManagerType): NavSection[] => {
  const managerLabels: Record<string, { label: string; icon: any }> = {
    bar: { label: 'Bar Operations', icon: Wine },
    floor: { label: 'Floor Operations', icon: UtensilsCrossed },
    marketing: { label: 'Marketing', icon: Megaphone },
  };

  const typeInfo = managerType ? managerLabels[managerType] : { label: 'My Team', icon: Users };

  return [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      defaultOpen: true,
      items: [
        { to: '/', label: 'Overview', icon: Activity },
        { to: '/my-dashboard', label: 'My Dashboard', icon: Target },
      ],
    },
    {
      title: typeInfo.label,
      icon: typeInfo.icon,
      defaultOpen: true,
      items: [
        { to: '/ops/staffing', label: 'Team Schedule', icon: Calendar },
        { to: '/ops/workforce', label: 'Team Status', icon: UsersRound },
      ],
    },
  ];
};

// Staff sees minimal: own shifts, profile
const staffItems: NavItem[] = [
  { to: '/', label: 'My Dashboard', icon: Activity },
  { to: '/my-shifts', label: 'My Shifts', icon: Calendar },
  { to: '/profile', label: 'My Profile', icon: User },
];

function getRoleBadge(role: UserRole, managerType?: ManagerType | null): string {
  if (role === 'owner') return 'Owner';
  if (role === 'manager') {
    const labels: Record<string, string> = {
      bar: 'Bar Manager',
      floor: 'Floor Manager',
      marketing: 'Marketing Manager',
    };
    return managerType ? labels[managerType] || 'Manager' : 'Manager';
  }
  return 'Staff';
}

function CollapsibleSection({ section }: { section: NavSection }) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false);
  const Icon = section.icon;

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-[#1a1f2e] hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{section.title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <div className="ml-2 mt-1 space-y-1 border-l border-[#374151] pl-2">
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-[#1a1f2e] hover:text-white transition-colors',
                    isActive && 'bg-[#1a1f2e] text-[#ff6b35] border-l-2 border-[#ff6b35] -ml-[2px]'
                  )
                }
              >
                <ItemIcon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-[#1a1f2e] hover:text-white transition-colors',
          isActive && 'bg-[#1a1f2e] text-[#ff6b35]'
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </NavLink>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role || 'staff';
  const managerType = profile?.managerType;

  // Get sections based on role
  const sections = role === 'owner' 
    ? ownerSections 
    : role === 'manager' 
      ? getManagerSections(managerType || null)
      : [];

  const roleBadge = getRoleBadge(role, managerType);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - hidden on mobile unless open, always visible on lg+ */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-[#0d1117] border-r border-[#374151] transition-transform duration-300 lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#374151]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6b35]">
          <LayoutDashboard className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-white">The Roof</div>
          <div className="text-xs text-slate-500">Restaurant Management Hub</div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-3 py-4">
        <div className="flex w-full items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-3 text-sm font-medium text-white">
          <LayoutDashboard className="h-4 w-4" />
          {roleBadge} Dashboard
        </div>
      </div>

      {/* Navigation - Role Based */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {role === 'staff' ? (
          // Staff gets flat list
          <div className="space-y-1">
            {staffItems.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </div>
        ) : (
          // Owner/Manager gets collapsible sections
          sections.map((section) => (
            <CollapsibleSection key={section.title} section={section} />
          ))
        )}
      </nav>

      {/* Chat Section - Everyone */}
      <div className="px-3 py-4 border-t border-[#374151]">
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-[#1a1f2e] hover:text-white transition-colors',
              isActive && 'bg-[#1a1f2e] text-white'
            )
          }
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat</span>
        </NavLink>
      </div>

      {/* User Info */}
      {profile && (
        <div className="px-3 py-4 border-t border-[#374151]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium text-white">
              {profile.fullName?.split(' ').map(n => n[0]).join('') || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{profile.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
