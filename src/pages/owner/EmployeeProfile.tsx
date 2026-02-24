import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  DollarSign,
  Landmark,
  Heart,
  FileText,
  MessageSquare,
  Clock,
  Edit2,
  Save,
  X,
  Plus,
  Upload,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import {
  useEmployeeDetail,
  useUpdateProfile,
  usePayDetails,
  useUpdatePayDetails,
  useBankingDetails,
  useUpdateBanking,
  useEmploymentBenefits,
  useUpdateBenefits,
  useEmployeeNotes,
  useAddNote,
  useUpdateNote,
  useEmploymentHistory,
  useAddHistoryEntry,
  useUpdateHistoryEntry,
  useEmployeeDocuments,
  useUploadDocument,
  useDeleteDocument,
  getDocumentUrl,
  type EmploymentHistoryEntry,
} from '../../hooks/useEmployeeProfile';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'pay', label: 'Pay Details', icon: DollarSign },
  { id: 'banking', label: 'Banking', icon: Landmark },
  { id: 'benefits', label: 'Benefits', icon: Heart },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'notes', label: 'Management Notes', icon: MessageSquare },
  { id: 'history', label: 'Employment History', icon: Clock },
] as const;

type TabId = typeof TABS[number]['id'];

const JOB_ROLES = [
  { value: 'bartender', label: 'Bartender' },
  { value: 'service', label: 'Service' },
  { value: 'floor_manager', label: 'Floor Manager' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'host', label: 'Host' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'marketing_manager', label: 'Marketing Manager' },
  { value: 'bar_manager', label: 'Bar Manager' },
  { value: 'accountant', label: 'Accountant' },
];

const EVENT_TYPE_LABELS: Record<EmploymentHistoryEntry['eventType'], string> = {
  hired: 'Hired',
  promotion: 'Promotion',
  role_change: 'Role Change',
  salary_change: 'Salary Change',
  contract_renewal: 'Contract Renewal',
  warning: 'Warning',
  termination: 'Termination',
  other: 'Other',
};

const EVENT_TYPE_COLORS: Record<EmploymentHistoryEntry['eventType'], string> = {
  hired: 'bg-success/20 text-success',
  promotion: 'bg-info/20 text-info',
  role_change: 'bg-primary/20 text-primary',
  salary_change: 'bg-warning/20 text-warning',
  contract_renewal: 'bg-cyan-500/20 text-cyan-400',
  warning: 'bg-error/20 text-error',
  termination: 'bg-error/20 text-error',
  other: 'bg-muted text-muted-foreground',
};

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// =============================================
// Reusable field components
// =============================================

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{value || '—'}</p>
    </div>
  );
}

function EditField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-0.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

function SaveBar({ onSave, onCancel, isPending }: { onSave: () => void; onCancel: () => void; isPending: boolean }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-border">
      <button
        onClick={onSave}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </button>
      <button
        onClick={onCancel}
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" /> Cancel
      </button>
    </div>
  );
}

// =============================================
// Tab: Personal Info
// =============================================

function PersonalTab({ staffId, isOwner }: { staffId: string; isOwner: boolean }) {
  const { data: employee, isLoading } = useEmployeeDetail(staffId);
  const updateProfile = useUpdateProfile(staffId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const startEdit = () => {
    if (!employee) return;
    setForm({
      fullName: employee.fullName || '',
      phone: employee.phone || '',
      jobRole: employee.jobRole || '',
      employmentType: employee.employmentType || 'full_time',
      hireDate: employee.hireDate || '',
      dateOfBirth: employee.dateOfBirth || '',
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || '',
      emergencyContactPhone: employee.emergencyContactPhone || '',
      nationality: employee.nationality || '',
      idNumber: employee.idNumber || '',
      annualLeaveDays: String(employee.annualLeaveDays ?? 12),
      targetHoursWeek: String(employee.targetHoursWeek ?? 40),
    });
    setEditing(true);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      fullName: form.fullName,
      phone: form.phone,
      jobRole: form.jobRole,
      employmentType: form.employmentType,
      hireDate: form.hireDate,
      dateOfBirth: form.dateOfBirth,
      address: form.address,
      emergencyContact: form.emergencyContact,
      emergencyContactPhone: form.emergencyContactPhone,
      nationality: form.nationality,
      idNumber: form.idNumber,
      annualLeaveDays: parseInt(form.annualLeaveDays) || 12,
      targetHoursWeek: parseInt(form.targetHoursWeek) || 40,
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!employee) return <p className="text-muted-foreground py-8 text-center">Employee not found.</p>;

  const f = (k: string) => form[k] ?? '';

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-2">
          <CheckCircle2 className="h-4 w-4" /> Saved successfully
        </div>
      )}

      {/* Identity */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Identity</h3>
          {isOwner && !editing && (
            <button onClick={startEdit} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField label="Full Name" name="fullName" value={f('fullName')} onChange={(v) => setForm(p => ({ ...p, fullName: v }))} />
            <EditField label="Date of Birth" name="dateOfBirth" type="date" value={f('dateOfBirth')} onChange={(v) => setForm(p => ({ ...p, dateOfBirth: v }))} />
            <EditField label="Nationality" name="nationality" value={f('nationality')} onChange={(v) => setForm(p => ({ ...p, nationality: v }))} />
            <EditField label="ID / Passport Number" name="idNumber" value={f('idNumber')} onChange={(v) => setForm(p => ({ ...p, idNumber: v }))} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={employee.fullName} />
            <Field label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
            <Field label="Nationality" value={employee.nationality} />
            <Field label="ID / Passport Number" value={employee.idNumber} />
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium text-foreground flex items-center gap-2 mb-4"><Phone className="h-4 w-4 text-muted-foreground" /> Contact</h3>
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField label="Phone" name="phone" type="tel" value={f('phone')} onChange={(v) => setForm(p => ({ ...p, phone: v }))} />
            <div className="sm:col-span-2">
              <EditField label="Address" name="address" value={f('address')} onChange={(v) => setForm(p => ({ ...p, address: v }))} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground">{employee.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm text-foreground">{employee.address || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium text-foreground flex items-center gap-2 mb-4"><AlertTriangle className="h-4 w-4 text-warning" /> Emergency Contact</h3>
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField label="Contact Name" name="emergencyContact" value={f('emergencyContact')} onChange={(v) => setForm(p => ({ ...p, emergencyContact: v }))} />
            <EditField label="Contact Phone" name="emergencyContactPhone" type="tel" value={f('emergencyContactPhone')} onChange={(v) => setForm(p => ({ ...p, emergencyContactPhone: v }))} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Name" value={employee.emergencyContact} />
            <Field label="Contact Phone" value={employee.emergencyContactPhone} />
          </div>
        )}
      </div>

      {/* Employment Info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium text-foreground flex items-center gap-2 mb-4"><Shield className="h-4 w-4 text-muted-foreground" /> Employment</h3>
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Job Role</label>
              <select
                value={f('jobRole')}
                onChange={(e) => setForm(p => ({ ...p, jobRole: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none"
              >
                <option value="">— Select —</option>
                {JOB_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Employment Type</label>
              <select
                value={f('employmentType')}
                onChange={(e) => setForm(p => ({ ...p, employmentType: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <EditField label="Hire Date" name="hireDate" type="date" value={f('hireDate')} onChange={(v) => setForm(p => ({ ...p, hireDate: v }))} />
            <EditField label="Annual Leave Days" name="annualLeaveDays" type="number" value={f('annualLeaveDays')} onChange={(v) => setForm(p => ({ ...p, annualLeaveDays: v }))} />
            <EditField label="Target Hours / Week" name="targetHoursWeek" type="number" value={f('targetHoursWeek')} onChange={(v) => setForm(p => ({ ...p, targetHoursWeek: v }))} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Role" value={employee.role.charAt(0).toUpperCase() + employee.role.slice(1)} />
            <Field label="Job Role" value={JOB_ROLES.find(r => r.value === employee.jobRole)?.label} />
            <Field label="Employment Type" value={employee.employmentType?.replace('_', ' ')} />
            <Field label="Hire Date" value={formatDate(employee.hireDate)} />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span className={`text-sm font-medium ${employee.isActive ? 'text-success' : 'text-error'}`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <Field label="Annual Leave Days" value={String(employee.annualLeaveDays)} />
            <Field label="Target Hours / Week" value={`${employee.targetHoursWeek}h`} />
          </div>
        )}
      </div>

      {editing && <SaveBar onSave={handleSave} onCancel={() => setEditing(false)} isPending={updateProfile.isPending} />}
    </div>
  );
}

// =============================================
// Tab: Pay Details
// =============================================

function PayTab({ staffId }: { staffId: string }) {
  const { data: pay, isLoading } = usePayDetails(staffId);
  const updatePay = useUpdatePayDetails(staffId);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const startEdit = () => {
    setForm({
      payType: pay?.payType || 'monthly',
      baseSalary: String(pay?.baseSalary ?? ''),
      hourlyRate: String(pay?.hourlyRate ?? ''),
      payCurrency: pay?.payCurrency || 'VND',
      payFrequency: pay?.payFrequency || 'monthly',
      nextReviewDate: pay?.nextReviewDate || '',
      lastIncreaseDate: pay?.lastIncreaseDate || '',
      lastIncreaseAmount: String(pay?.lastIncreaseAmount ?? ''),
      nextBonusDate: pay?.nextBonusDate || '',
      bonusNotes: pay?.bonusNotes || '',
      serviceChargeEligible: String(pay?.serviceChargeEligible ?? true),
    });
    setEditing(true);
  };

  const handleSave = async () => {
    await updatePay.mutateAsync({
      payType: form.payType as any,
      baseSalary: form.baseSalary ? parseFloat(form.baseSalary) : undefined,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
      payCurrency: form.payCurrency,
      payFrequency: form.payFrequency as any,
      nextReviewDate: form.nextReviewDate,
      lastIncreaseDate: form.lastIncreaseDate,
      lastIncreaseAmount: form.lastIncreaseAmount ? parseFloat(form.lastIncreaseAmount) : undefined,
      nextBonusDate: form.nextBonusDate,
      bonusNotes: form.bonusNotes,
      serviceChargeEligible: form.serviceChargeEligible === 'true',
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const f = (k: string) => form[k] ?? '';

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const currency = pay?.payCurrency || 'VND';
  const fmt = (n?: number) => n != null ? n.toLocaleString() + ' ' + currency : '—';

  return (
    <div className="space-y-4">
      {saved && (
        <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-2">
          <CheckCircle2 className="h-4 w-4" /> Saved successfully
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground">Compensation</h3>
          {!editing && (
            <button onClick={startEdit} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Pay Type</label>
              <select value={f('payType')} onChange={e => setForm(p => ({ ...p, payType: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none">
                <option value="monthly">Monthly Salary</option>
                <option value="hourly">Hourly Rate</option>
                <option value="daily">Daily Rate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Currency</label>
              <select value={f('payCurrency')} onChange={e => setForm(p => ({ ...p, payCurrency: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
            {(f('payType') === 'monthly' || f('payType') === 'daily') && (
              <EditField label="Base Salary" name="baseSalary" type="number" value={f('baseSalary')} onChange={v => setForm(p => ({ ...p, baseSalary: v }))} />
            )}
            {f('payType') === 'hourly' && (
              <EditField label="Hourly Rate" name="hourlyRate" type="number" value={f('hourlyRate')} onChange={v => setForm(p => ({ ...p, hourlyRate: v }))} />
            )}
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Pay Frequency</label>
              <select value={f('payFrequency')} onChange={e => setForm(p => ({ ...p, payFrequency: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none">
                <option value="monthly">Monthly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Pay Type" value={pay?.payType?.replace('_', ' ')} />
            <Field label="Currency" value={pay?.payCurrency} />
            <Field label="Base Salary" value={fmt(pay?.baseSalary)} />
            <Field label="Hourly Rate" value={pay?.hourlyRate ? fmt(pay.hourlyRate) : undefined} />
            <Field label="Pay Frequency" value={pay?.payFrequency} />
            <Field label="Service Charge Eligible" value={pay?.serviceChargeEligible ? 'Yes' : 'No'} />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium text-foreground mb-4">Reviews & Bonuses</h3>
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField label="Next Review Date" name="nextReviewDate" type="date" value={f('nextReviewDate')} onChange={v => setForm(p => ({ ...p, nextReviewDate: v }))} />
            <EditField label="Last Increase Date" name="lastIncreaseDate" type="date" value={f('lastIncreaseDate')} onChange={v => setForm(p => ({ ...p, lastIncreaseDate: v }))} />
            <EditField label="Last Increase Amount" name="lastIncreaseAmount" type="number" value={f('lastIncreaseAmount')} onChange={v => setForm(p => ({ ...p, lastIncreaseAmount: v }))} />
            <EditField label="Next Bonus Date" name="nextBonusDate" type="date" value={f('nextBonusDate')} onChange={v => setForm(p => ({ ...p, nextBonusDate: v }))} />
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted-foreground mb-0.5">Bonus Notes</label>
              <textarea value={f('bonusNotes')} onChange={e => setForm(p => ({ ...p, bonusNotes: e.target.value }))} rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none resize-none" />
            </div>
            <div className="sm:col-span-2">
              <Toggle label="Service Charge Eligible" checked={f('serviceChargeEligible') === 'true'} onChange={v => setForm(p => ({ ...p, serviceChargeEligible: String(v) }))} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Next Review Date" value={formatDate(pay?.nextReviewDate)} />
            <Field label="Last Increase Date" value={formatDate(pay?.lastIncreaseDate)} />
            <Field label="Last Increase Amount" value={pay?.lastIncreaseAmount ? fmt(pay.lastIncreaseAmount) : undefined} />
            <Field label="Next Bonus Date" value={formatDate(pay?.nextBonusDate)} />
            <div className="sm:col-span-2">
              <Field label="Bonus Notes" value={pay?.bonusNotes} />
            </div>
          </div>
        )}
      </div>

      {editing && <SaveBar onSave={handleSave} onCancel={() => setEditing(false)} isPending={updatePay.isPending} />}
    </div>
  );
}

// =============================================
// Tab: Banking Details
// =============================================

function BankingTab({ staffId }: { staffId: string }) {
  const { data: banking, isLoading } = useBankingDetails(staffId);
  const updateBanking = useUpdateBanking(staffId);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const startEdit = () => {
    setForm({
      bankName: banking?.bankName || '',
      accountName: banking?.accountName || '',
      accountNumber: banking?.accountNumber || '',
      branch: banking?.branch || '',
      swiftCode: banking?.swiftCode || '',
      notes: banking?.notes || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    await updateBanking.mutateAsync({
      bankName: form.bankName,
      accountName: form.accountName,
      accountNumber: form.accountNumber,
      branch: form.branch,
      swiftCode: form.swiftCode,
      notes: form.notes,
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const f = (k: string) => form[k] ?? '';

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {saved && (
        <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-2">
          <CheckCircle2 className="h-4 w-4" /> Saved successfully
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 border border-warning/20 rounded-lg px-4 py-2">
        <Shield className="h-4 w-4" /> This information is confidential — visible to owners only.
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground">Bank Account</h3>
          {!editing && (
            <button onClick={startEdit} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField label="Bank Name" name="bankName" value={f('bankName')} onChange={v => setForm(p => ({ ...p, bankName: v }))} />
            <EditField label="Account Name" name="accountName" value={f('accountName')} onChange={v => setForm(p => ({ ...p, accountName: v }))} />
            <EditField label="Account Number" name="accountNumber" value={f('accountNumber')} onChange={v => setForm(p => ({ ...p, accountNumber: v }))} />
            <EditField label="Branch" name="branch" value={f('branch')} onChange={v => setForm(p => ({ ...p, branch: v }))} />
            <EditField label="SWIFT Code" name="swiftCode" value={f('swiftCode')} onChange={v => setForm(p => ({ ...p, swiftCode: v }))} />
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted-foreground mb-0.5">Notes</label>
              <textarea value={f('notes')} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none resize-none" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bank Name" value={banking?.bankName} />
            <Field label="Account Name" value={banking?.accountName} />
            <Field label="Account Number" value={banking?.accountNumber} />
            <Field label="Branch" value={banking?.branch} />
            <Field label="SWIFT Code" value={banking?.swiftCode} />
            <div className="sm:col-span-2">
              <Field label="Notes" value={banking?.notes} />
            </div>
          </div>
        )}
      </div>

      {editing && <SaveBar onSave={handleSave} onCancel={() => setEditing(false)} isPending={updateBanking.isPending} />}
    </div>
  );
}

// =============================================
// Tab: Employment Benefits
// =============================================

function BenefitsTab({ staffId, isOwner }: { staffId: string; isOwner: boolean }) {
  const { data: benefits, isLoading } = useEmploymentBenefits(staffId);
  const updateBenefits = useUpdateBenefits(staffId);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const startEdit = () => {
    setForm({
      healthInsurance: benefits?.healthInsurance ?? false,
      socialInsurance: benefits?.socialInsurance ?? false,
      mealAllowance: benefits?.mealAllowance ?? false,
      transportAllowance: benefits?.transportAllowance ?? false,
      contractType: benefits?.contractType || 'indefinite',
      contractStartDate: benefits?.contractStartDate || '',
      contractEndDate: benefits?.contractEndDate || '',
      probationEndDate: benefits?.probationEndDate || '',
      otherBenefits: benefits?.otherBenefits || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    await updateBenefits.mutateAsync({
      healthInsurance: form.healthInsurance,
      socialInsurance: form.socialInsurance,
      mealAllowance: form.mealAllowance,
      transportAllowance: form.transportAllowance,
      contractType: form.contractType,
      contractStartDate: form.contractStartDate,
      contractEndDate: form.contractEndDate,
      probationEndDate: form.probationEndDate,
      otherBenefits: form.otherBenefits,
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const f = (k: string) => form[k];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {saved && (
        <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-2">
          <CheckCircle2 className="h-4 w-4" /> Saved successfully
        </div>
      )}

      {/* Contract */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground">Contract</h3>
          {isOwner && !editing && (
            <button onClick={startEdit} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Contract Type</label>
              <select value={f('contractType')} onChange={e => setForm(p => ({ ...p, contractType: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none">
                <option value="probation">Probation</option>
                <option value="fixed_term">Fixed Term</option>
                <option value="indefinite">Indefinite</option>
              </select>
            </div>
            <EditField label="Contract Start Date" name="contractStartDate" type="date" value={f('contractStartDate') || ''} onChange={v => setForm(p => ({ ...p, contractStartDate: v }))} />
            <EditField label="Contract End Date" name="contractEndDate" type="date" value={f('contractEndDate') || ''} onChange={v => setForm(p => ({ ...p, contractEndDate: v }))} />
            <EditField label="Probation End Date" name="probationEndDate" type="date" value={f('probationEndDate') || ''} onChange={v => setForm(p => ({ ...p, probationEndDate: v }))} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contract Type" value={benefits?.contractType?.replace('_', ' ')} />
            <Field label="Contract Start" value={formatDate(benefits?.contractStartDate)} />
            <Field label="Contract End" value={formatDate(benefits?.contractEndDate)} />
            <Field label="Probation End" value={formatDate(benefits?.probationEndDate)} />
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium text-foreground mb-4">Entitlements</h3>
        {editing ? (
          <div className="space-y-3">
            <Toggle label="Health Insurance" checked={!!f('healthInsurance')} onChange={v => setForm(p => ({ ...p, healthInsurance: v }))} />
            <Toggle label="Social Insurance" checked={!!f('socialInsurance')} onChange={v => setForm(p => ({ ...p, socialInsurance: v }))} />
            <Toggle label="Meal Allowance" checked={!!f('mealAllowance')} onChange={v => setForm(p => ({ ...p, mealAllowance: v }))} />
            <Toggle label="Transport Allowance" checked={!!f('transportAllowance')} onChange={v => setForm(p => ({ ...p, transportAllowance: v }))} />
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Other Benefits</label>
              <textarea value={f('otherBenefits') || ''} onChange={e => setForm(p => ({ ...p, otherBenefits: e.target.value }))} rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none resize-none"
                placeholder="e.g. gym membership, parking..." />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { label: 'Health Insurance', val: benefits?.healthInsurance },
              { label: 'Social Insurance', val: benefits?.socialInsurance },
              { label: 'Meal Allowance', val: benefits?.mealAllowance },
              { label: 'Transport Allowance', val: benefits?.transportAllowance },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                {item.val
                  ? <CheckCircle2 className="h-4 w-4 text-success" />
                  : <X className="h-4 w-4 text-muted-foreground" />}
                <span className={`text-sm ${item.val ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
              </div>
            ))}
            {benefits?.otherBenefits && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-0.5">Other</p>
                <p className="text-sm text-foreground">{benefits.otherBenefits}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {editing && <SaveBar onSave={handleSave} onCancel={() => setEditing(false)} isPending={updateBenefits.isPending} />}
    </div>
  );
}

// =============================================
// Tab: Documents
// =============================================

function DocumentsTab({ staffId, isOwner }: { staffId: string; isOwner: boolean }) {
  const { data: docs, isLoading, error } = useEmployeeDocuments(staffId);
  const uploadDoc = useUploadDocument(staffId);
  const deleteDoc = useDeleteDocument(staffId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDoc.mutateAsync(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-lg px-4 py-2">
          <AlertCircle className="h-4 w-4" /> Could not load documents. Ensure the &quot;employee-documents&quot; storage bucket exists in Supabase.
        </div>
      )}

      {isOwner && (
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadDoc.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {uploadDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Document
          </button>
        </div>
      )}

      {!docs?.length ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground text-sm">No documents uploaded yet</p>
          {isOwner && (
            <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-primary hover:underline">
              Upload first document
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {docs.map((doc) => {
              const url = getDocumentUrl(staffId, doc.name);
              return (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.size ? formatBytes(doc.size) : ''}
                        {doc.size && doc.createdAt ? ' · ' : ''}
                        {doc.createdAt ? formatDate(doc.createdAt) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    {isOwner && (
                      <button
                        onClick={() => deleteDoc.mutate(doc.name)}
                        disabled={deleteDoc.isPending}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// Tab: Management Notes
// =============================================

function NotesTab({ staffId }: { staffId: string }) {
  const { data: notes, isLoading } = useEmployeeNotes(staffId);
  const addNote = useAddNote(staffId);
  const updateNote = useUpdateNote();
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    await addNote.mutateAsync(newNote.trim());
    setNewNote('');
  };

  const handleUpdate = async (noteId: string) => {
    await updateNote.mutateAsync({ noteId, note: editText, staffId });
    setEditingId(null);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="block text-sm font-medium text-foreground mb-2">Add Note</label>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          placeholder="Write a private management note..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none resize-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleAdd}
            disabled={!newNote.trim() || addNote.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {addNote.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add Note
          </button>
        </div>
      </div>

      {!notes?.length ? (
        <p className="text-muted-foreground text-center py-8 text-sm">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-border bg-card p-4">
              {editingId === note.id ? (
                <>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleUpdate(note.id)} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-muted-foreground hover:text-foreground">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.note}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {note.authorName} · {formatDate(note.createdAt)}
                      {note.updatedAt && note.updatedAt !== note.createdAt ? ' (edited)' : ''}
                    </p>
                    <button
                      onClick={() => { setEditingId(note.id); setEditText(note.note); }}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================
// Tab: Employment History
// =============================================

function HistoryTab({ staffId, isOwner }: { staffId: string; isOwner: boolean }) {
  const { data: history, isLoading } = useEmploymentHistory(staffId);
  const addEntry = useAddHistoryEntry(staffId);
  const updateEntry = useUpdateHistoryEntry(staffId);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ eventType: 'other' as EmploymentHistoryEntry['eventType'], description: '', effectiveDate: '' });
  const [editForm, setEditForm] = useState({ eventType: 'other' as EmploymentHistoryEntry['eventType'], description: '', effectiveDate: '' });

  const handleAdd = async () => {
    if (!form.description.trim() || !form.effectiveDate) return;
    await addEntry.mutateAsync(form);
    setForm({ eventType: 'other', description: '', effectiveDate: '' });
    setShowForm(false);
  };

  const handleUpdate = async (id: string) => {
    await updateEntry.mutateAsync({ id, ...editForm });
    setEditingId(null);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Entry
          </button>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-medium text-foreground text-sm">New History Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Event Type</label>
              <select value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value as any }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none">
                {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <EditField label="Effective Date" name="effectiveDate" type="date" value={form.effectiveDate} onChange={v => setForm(p => ({ ...p, effectiveDate: v }))} />
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted-foreground mb-0.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none resize-none"
                placeholder="Describe the event..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={addEntry.isPending || !form.description.trim() || !form.effectiveDate}
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {addEntry.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-muted-foreground hover:text-foreground px-3">Cancel</button>
          </div>
        </div>
      )}

      {!history?.length ? (
        <p className="text-muted-foreground text-center py-8 text-sm">No employment history recorded.</p>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="relative">
                <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                <div className="rounded-xl border border-border bg-card p-4">
                  {editingId === entry.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-0.5">Event Type</label>
                          <select value={editForm.eventType} onChange={e => setEditForm(p => ({ ...p, eventType: e.target.value as any }))}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none">
                            {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                        <EditField label="Effective Date" name="effectiveDate" type="date" value={editForm.effectiveDate} onChange={v => setEditForm(p => ({ ...p, effectiveDate: v }))} />
                        <div className="sm:col-span-2">
                          <label className="block text-xs text-muted-foreground mb-0.5">Description</label>
                          <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2}
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none resize-none" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(entry.id)} disabled={updateEntry.isPending}
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                          {updateEntry.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-sm text-muted-foreground hover:text-foreground px-3">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_TYPE_COLORS[entry.eventType]}`}>
                            {EVENT_TYPE_LABELS[entry.eventType]}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatDate(entry.effectiveDate)}</span>
                        </div>
                        <p className="text-sm text-foreground">{entry.description}</p>
                        {entry.recordedByName && (
                          <p className="text-xs text-muted-foreground mt-1">Recorded by {entry.recordedByName}</p>
                        )}
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => { setEditingId(entry.id); setEditForm({ eventType: entry.eventType, description: entry.description, effectiveDate: entry.effectiveDate }); }}
                          className="text-muted-foreground hover:text-primary flex-shrink-0"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// Main EmployeeProfile page
// =============================================

export function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const { data: employee, isLoading: loadingEmployee } = useEmployeeDetail(id);
  const [activeTab, setActiveTab] = useState<TabId>('personal');

  const isOwner = profile?.role === 'owner';
  const isManager = profile?.role === 'manager';

  // Filter tabs based on role
  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === 'banking') return isOwner;
    if (tab.id === 'pay') return isOwner;
    if (tab.id === 'notes') return isOwner || isManager;
    if (tab.id === 'history') return isOwner || isManager;
    return true;
  });

  if (!id) return null;

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div>
        <button
          onClick={() => navigate('/owner/team')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Team Directory
        </button>

        {loadingEmployee ? (
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ) : employee ? (
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-xl font-semibold text-primary-foreground flex-shrink-0">
              {employee.fullName?.split(' ').map((n: string) => n[0]).join('') || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{employee.fullName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-muted-foreground">{employee.email}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${employee.isActive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Employee not found.</p>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-0 scrollbar-hide">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'personal' && <PersonalTab staffId={id} isOwner={isOwner} />}
        {activeTab === 'pay' && isOwner && <PayTab staffId={id} />}
        {activeTab === 'banking' && isOwner && <BankingTab staffId={id} />}
        {activeTab === 'benefits' && <BenefitsTab staffId={id} isOwner={isOwner} />}
        {activeTab === 'documents' && <DocumentsTab staffId={id} isOwner={isOwner} />}
        {activeTab === 'notes' && (isOwner || isManager) && <NotesTab staffId={id} />}
        {activeTab === 'history' && (isOwner || isManager) && <HistoryTab staffId={id} isOwner={isOwner} />}
      </div>
    </div>
  );
}
