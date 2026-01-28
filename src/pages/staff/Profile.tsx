import { useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Save, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function Profile() {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const [isEditing, setIsEditing] = useState(false);

  if (!profile) return null;

  const roleLabels: Record<string, string> = {
    owner: 'Owner',
    manager: 'Manager',
    staff: 'Staff',
  };

  const managerLabels: Record<string, string> = {
    bar: 'Bar Manager',
    floor: 'Floor Manager',
    marketing: 'Marketing Manager',
  };

  const displayRole = profile.role === 'manager' && profile.managerType 
    ? managerLabels[profile.managerType] 
    : roleLabels[profile.role];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">My Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-[#ff6b35] flex items-center justify-center text-2xl font-semibold text-white">
            {profile.fullName?.split(' ').map(n => n[0]).join('') || '?'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{profile.fullName}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ff6b35]/20 px-3 py-1 text-sm text-[#ff6b35]">
              <Shield className="h-3 w-3" />
              {displayRole}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 py-3 border-b border-[#374151]">
            <Mail className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm text-white">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3 border-b border-[#374151]">
            <Phone className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm text-white">{profile.phone || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3 border-b border-[#374151]">
            <Calendar className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Hire Date</p>
              <p className="text-sm text-white">
                {profile.hireDate 
                  ? new Date(profile.hireDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Not set'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-3">
            <User className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className={`text-sm ${profile.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 rounded-lg border border-[#374151] px-4 py-2.5 text-sm text-slate-300 hover:bg-[#374151] transition-colors"
        >
          <Save className="h-4 w-4" />
          Edit Profile
        </button>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Edit Modal Placeholder */}
      {isEditing && (
        <div className="rounded-xl border border-dashed border-[#374151] bg-[#1a1f2e]/50 p-8 text-center">
          <p className="text-slate-400">Profile editing coming soon...</p>
          <button 
            onClick={() => setIsEditing(false)}
            className="mt-4 text-sm text-[#ff6b35] hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
