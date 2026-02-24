import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  LogOut,
  Edit2,
  Save,
  X,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Cake,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUpdateProfile } from '../../hooks/useEmployeeProfile';

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Not set';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export function Profile() {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const updateProfile = useUpdateProfile(profile?.id);

  if (!profile) return null;

  const roleLabels: Record<string, string> = {
    owner: 'Owner',
    manager: 'Manager',
    staff: 'Staff',
    investor: 'Investor',
  };

  const managerLabels: Record<string, string> = {
    bar: 'Bar Manager',
    floor: 'Floor Manager',
    marketing: 'Marketing Manager',
  };

  const displayRole =
    profile.role === 'manager' && profile.managerType
      ? managerLabels[profile.managerType]
      : roleLabels[profile.role];

  const startEdit = () => {
    setForm({
      phone: (profile as any).phone || '',
      dateOfBirth: (profile as any).dateOfBirth || '',
      address: (profile as any).address || '',
      emergencyContact: (profile as any).emergencyContact || '',
      emergencyContactPhone: (profile as any).emergencyContactPhone || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      address: form.address,
      emergencyContact: form.emergencyContact,
      emergencyContactPhone: form.emergencyContactPhone,
    });
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const f = (k: string) => form[k] ?? '';

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">View and update your personal information</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-2">
          <CheckCircle2 className="h-4 w-4" /> Profile updated successfully
        </div>
      )}

      {/* Profile header card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-2xl font-semibold text-primary-foreground flex-shrink-0">
            {profile.fullName?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{profile.fullName}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-sm text-primary mt-1">
              <Shield className="h-3 w-3" />
              {displayRole}
            </span>
          </div>
        </div>

        {/* Read-only info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2.5 border-b border-border">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2.5 border-b border-border">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Hire Date</p>
              <p className="text-sm text-foreground">
                {profile.hireDate
                  ? new Date(profile.hireDate).toLocaleDateString('en-GB', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : 'Not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2.5">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={`text-sm font-medium ${profile.isActive ? 'text-success' : 'text-error'}`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editable personal info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground">Personal Information</h3>
          {!isEditing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Phone</label>
              <input
                type="tel"
                value={f('phone')}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+84..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Date of Birth</label>
              <input
                type="date"
                value={f('dateOfBirth')}
                onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Address</label>
              <input
                type="text"
                value={f('address')}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Your home address"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Emergency Contact Name</label>
              <input
                type="text"
                value={f('emergencyContact')}
                onChange={(e) => setForm((p) => ({ ...p, emergencyContact: e.target.value }))}
                placeholder="e.g. Nguyen Van A (Father)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Emergency Contact Phone</label>
              <input
                type="tel"
                value={f('emergencyContactPhone')}
                onChange={(e) => setForm((p) => ({ ...p, emergencyContactPhone: e.target.value }))}
                placeholder="+84..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2.5 border-b border-border">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground">{(profile as any).phone || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2.5 border-b border-border">
              <Cake className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm text-foreground">{formatDate((profile as any).dateOfBirth)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2.5 border-b border-border">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm text-foreground">{(profile as any).address || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Emergency Contact</p>
                <p className="text-sm text-foreground">
                  {(profile as any).emergencyContact
                    ? `${(profile as any).emergencyContact}${(profile as any).emergencyContactPhone ? ` · ${(profile as any).emergencyContactPhone}` : ''}`
                    : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error hover:bg-error/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
