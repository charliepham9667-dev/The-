import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  User,
  Briefcase,
  Shield,
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useStaffList } from '../../hooks/useShifts';
import type { UserRole, JobRole } from '../../types';

const roleConfig: Record<UserRole, { label: string; color: string; bg: string }> = {
  owner: { label: 'Owner', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  manager: { label: 'Manager', color: 'text-info', bg: 'bg-info/20' },
  staff: { label: 'Staff', color: 'text-success', bg: 'bg-success/20' },
};

const jobRoleLabels: Record<string, string> = {
  bartender: 'Bartender',
  service: 'Service',
  floor_manager: 'Floor Manager',
  receptionist: 'Receptionist',
  host: 'Host',
  videographer: 'Videographer',
  marketing_manager: 'Marketing Manager',
  bar_manager: 'Bar Manager',
  accountant: 'Accountant',
};

export function TeamDirectory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const { data: staffList, isLoading } = useStaffList();

  const filteredStaff = staffList?.filter(staff => {
    const matchesSearch = !searchQuery || 
      staff.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  // Group by role
  const owners = filteredStaff.filter(s => s.role === 'owner');
  const managers = filteredStaff.filter(s => s.role === 'manager');
  const staff = filteredStaff.filter(s => s.role === 'staff');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Team Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your team members
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-purple-400" />
            <p className="text-xs text-muted-foreground">Owners</p>
          </div>
          <p className="text-2xl font-bold text-purple-400">{owners.length}</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-info" />
            <p className="text-xs text-muted-foreground">Managers</p>
          </div>
          <p className="text-2xl font-bold text-info">{managers.length}</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-success" />
            <p className="text-xs text-muted-foreground">Staff</p>
          </div>
          <p className="text-2xl font-bold text-success">{staff.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-foreground focus:border-ring focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owners</option>
            <option value="manager">Managers</option>
            <option value="staff">Staff</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Team List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-8 w-8 mb-2" />
            <p>No team members found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Owners */}
            {owners.length > 0 && roleFilter !== 'manager' && roleFilter !== 'staff' && (
              <>
                <div className="px-4 py-2 bg-purple-500/10 border-b border-border">
                  <h3 className="text-sm font-medium text-purple-400">Owners</h3>
                </div>
                {owners.map((person) => (
                  <TeamMemberCard key={person.id} person={person} onClick={() => navigate(`/owner/team/${person.id}`)} />
                ))}
              </>
            )}

            {/* Managers */}
            {managers.length > 0 && roleFilter !== 'owner' && roleFilter !== 'staff' && (
              <>
                <div className="px-4 py-2 bg-info/10 border-b border-border">
                  <h3 className="text-sm font-medium text-info">Managers</h3>
                </div>
                {managers.map((person) => (
                  <TeamMemberCard key={person.id} person={person} onClick={() => navigate(`/owner/team/${person.id}`)} />
                ))}
              </>
            )}

            {/* Staff */}
            {staff.length > 0 && roleFilter !== 'owner' && roleFilter !== 'manager' && (
              <>
                <div className="px-4 py-2 bg-success/10 border-b border-border">
                  <h3 className="text-sm font-medium text-success">Staff</h3>
                </div>
                {staff.map((person) => (
                  <TeamMemberCard key={person.id} person={person} onClick={() => navigate(`/owner/team/${person.id}`)} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface TeamMemberCardProps {
  person: {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    phone?: string;
    job_role?: string;
    hire_date?: string;
    avatar_url?: string;
  };
  onClick?: () => void;
}

function TeamMemberCard({ person, onClick }: TeamMemberCardProps) {
  const role = roleConfig[person.role] || { label: person.role, color: 'text-muted-foreground', bg: 'bg-muted' };

  return (
    <div
      className={`p-4 hover:bg-muted/50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {person.avatar_url ? (
            <img 
              src={person.avatar_url} 
              alt="" 
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium text-foreground">
              {person.full_name?.split(' ').map(n => n[0]).join('') || '?'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-foreground">{person.full_name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs ${role.bg} ${role.color}`}>
              {role.label}
            </span>
            {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />}
          </div>

          {person.job_role && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {jobRoleLabels[person.job_role] || person.job_role}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <a 
              href={`mailto:${person.email}`}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Mail className="h-3 w-3" />
              {person.email}
            </a>
            {person.phone && (
              <a 
                href={`tel:${person.phone}`}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Phone className="h-3 w-3" />
                {person.phone}
              </a>
            )}
            {person.hire_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {new Date(person.hire_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
