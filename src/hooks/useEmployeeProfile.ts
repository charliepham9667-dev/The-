import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

// =============================================
// Types
// =============================================

export interface EmployeeDetail {
  id: string;
  email: string;
  fullName: string;
  role: string;
  managerType?: string;
  jobRole?: string;
  employmentType: string;
  avatarUrl?: string;
  phone?: string;
  hireDate?: string;
  isActive: boolean;
  annualLeaveDays: number;
  leaveDaysUsed: number;
  targetHoursWeek: number;
  // Extended personal info
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  nationality?: string;
  idNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PayDetails {
  id?: string;
  staffId: string;
  payType: 'monthly' | 'hourly' | 'daily';
  baseSalary?: number;
  hourlyRate?: number;
  payCurrency: string;
  payFrequency: 'weekly' | 'biweekly' | 'monthly';
  nextReviewDate?: string;
  lastIncreaseDate?: string;
  lastIncreaseAmount?: number;
  nextBonusDate?: string;
  bonusNotes?: string;
  serviceChargeEligible: boolean;
}

export interface BankingDetails {
  id?: string;
  staffId: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branch?: string;
  swiftCode?: string;
  notes?: string;
}

export interface EmploymentBenefits {
  id?: string;
  staffId: string;
  healthInsurance: boolean;
  socialInsurance: boolean;
  probationEndDate?: string;
  contractType: 'probation' | 'fixed_term' | 'indefinite';
  contractStartDate?: string;
  contractEndDate?: string;
  mealAllowance: boolean;
  transportAllowance: boolean;
  otherBenefits?: string;
}

export interface EmployeeNote {
  id: string;
  staffId: string;
  authorId: string;
  authorName?: string;
  note: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EmploymentHistoryEntry {
  id: string;
  staffId: string;
  eventType: 'hired' | 'promotion' | 'role_change' | 'salary_change' | 'contract_renewal' | 'warning' | 'termination' | 'other';
  description: string;
  effectiveDate: string;
  recordedBy?: string;
  recordedByName?: string;
  createdAt: string;
}

export interface EmployeeDocument {
  name: string;
  id: string;
  size?: number;
  createdAt?: string;
  url?: string;
}

// =============================================
// Fetch full employee detail
// =============================================

export function useEmployeeDetail(staffId: string | undefined) {
  return useQuery({
    queryKey: ['employee-detail', staffId],
    queryFn: async (): Promise<EmployeeDetail | null> => {
      if (!staffId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', staffId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name || '',
        role: data.role,
        managerType: data.manager_type,
        jobRole: data.job_role,
        employmentType: data.employment_type || 'full_time',
        avatarUrl: data.avatar_url,
        phone: data.phone,
        hireDate: data.hire_date,
        isActive: data.is_active,
        annualLeaveDays: data.annual_leave_days ?? 12,
        leaveDaysUsed: data.leave_days_used ?? 0,
        targetHoursWeek: data.target_hours_week ?? 40,
        dateOfBirth: data.date_of_birth,
        address: data.address,
        emergencyContact: data.emergency_contact,
        emergencyContactPhone: data.emergency_contact_phone,
        nationality: data.nationality,
        idNumber: data.id_number,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    enabled: !!staffId,
  });
}

// =============================================
// Update profile (personal info)
// =============================================

export function useUpdateProfile(staffId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<{
      fullName: string;
      phone: string;
      jobRole: string;
      employmentType: string;
      hireDate: string;
      isActive: boolean;
      annualLeaveDays: number;
      targetHoursWeek: number;
      dateOfBirth: string;
      address: string;
      emergencyContact: string;
      emergencyContactPhone: string;
      nationality: string;
      idNumber: string;
    }>) => {
      if (!staffId) throw new Error('No staff ID');

      const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.jobRole !== undefined) dbUpdates.job_role = updates.jobRole;
      if (updates.employmentType !== undefined) dbUpdates.employment_type = updates.employmentType;
      if (updates.hireDate !== undefined) dbUpdates.hire_date = updates.hireDate;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.annualLeaveDays !== undefined) dbUpdates.annual_leave_days = updates.annualLeaveDays;
      if (updates.targetHoursWeek !== undefined) dbUpdates.target_hours_week = updates.targetHoursWeek;
      if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth || null;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.emergencyContact !== undefined) dbUpdates.emergency_contact = updates.emergencyContact;
      if (updates.emergencyContactPhone !== undefined) dbUpdates.emergency_contact_phone = updates.emergencyContactPhone;
      if (updates.nationality !== undefined) dbUpdates.nationality = updates.nationality;
      if (updates.idNumber !== undefined) dbUpdates.id_number = updates.idNumber;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', staffId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-detail', staffId] });
    },
  });
}

// =============================================
// Pay Details
// =============================================

export function usePayDetails(staffId: string | undefined) {
  return useQuery({
    queryKey: ['employee-pay', staffId],
    queryFn: async (): Promise<PayDetails | null> => {
      if (!staffId) return null;

      const { data, error } = await supabase
        .from('employee_pay')
        .select('*')
        .eq('staff_id', staffId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        staffId: data.staff_id,
        payType: data.pay_type,
        baseSalary: data.base_salary,
        hourlyRate: data.hourly_rate,
        payCurrency: data.pay_currency || 'VND',
        payFrequency: data.pay_frequency,
        nextReviewDate: data.next_review_date,
        lastIncreaseDate: data.last_increase_date,
        lastIncreaseAmount: data.last_increase_amount,
        nextBonusDate: data.next_bonus_date,
        bonusNotes: data.bonus_notes,
        serviceChargeEligible: data.service_charge_eligible ?? true,
      };
    },
    enabled: !!staffId,
  });
}

export function useUpdatePayDetails(staffId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<PayDetails, 'id' | 'staffId'>) => {
      if (!staffId) throw new Error('No staff ID');

      const payload = {
        staff_id: staffId,
        pay_type: data.payType,
        base_salary: data.baseSalary ?? null,
        hourly_rate: data.hourlyRate ?? null,
        pay_currency: data.payCurrency,
        pay_frequency: data.payFrequency,
        next_review_date: data.nextReviewDate || null,
        last_increase_date: data.lastIncreaseDate || null,
        last_increase_amount: data.lastIncreaseAmount ?? null,
        next_bonus_date: data.nextBonusDate || null,
        bonus_notes: data.bonusNotes || null,
        service_charge_eligible: data.serviceChargeEligible,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('employee_pay')
        .upsert(payload, { onConflict: 'staff_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-pay', staffId] });
    },
  });
}

// =============================================
// Banking Details
// =============================================

export function useBankingDetails(staffId: string | undefined) {
  return useQuery({
    queryKey: ['employee-banking', staffId],
    queryFn: async (): Promise<BankingDetails | null> => {
      if (!staffId) return null;

      const { data, error } = await supabase
        .from('employee_banking')
        .select('*')
        .eq('staff_id', staffId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        staffId: data.staff_id,
        bankName: data.bank_name,
        accountName: data.account_name,
        accountNumber: data.account_number,
        branch: data.branch,
        swiftCode: data.swift_code,
        notes: data.notes,
      };
    },
    enabled: !!staffId,
  });
}

export function useUpdateBanking(staffId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<BankingDetails, 'id' | 'staffId'>) => {
      if (!staffId) throw new Error('No staff ID');

      const payload = {
        staff_id: staffId,
        bank_name: data.bankName || null,
        account_name: data.accountName || null,
        account_number: data.accountNumber || null,
        branch: data.branch || null,
        swift_code: data.swiftCode || null,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('employee_banking')
        .upsert(payload, { onConflict: 'staff_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-banking', staffId] });
    },
  });
}

// =============================================
// Employment Benefits
// =============================================

export function useEmploymentBenefits(staffId: string | undefined) {
  return useQuery({
    queryKey: ['employee-benefits', staffId],
    queryFn: async (): Promise<EmploymentBenefits | null> => {
      if (!staffId) return null;

      const { data, error } = await supabase
        .from('employee_benefits')
        .select('*')
        .eq('staff_id', staffId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        staffId: data.staff_id,
        healthInsurance: data.health_insurance ?? false,
        socialInsurance: data.social_insurance ?? false,
        probationEndDate: data.probation_end_date,
        contractType: data.contract_type,
        contractStartDate: data.contract_start_date,
        contractEndDate: data.contract_end_date,
        mealAllowance: data.meal_allowance ?? false,
        transportAllowance: data.transport_allowance ?? false,
        otherBenefits: data.other_benefits,
      };
    },
    enabled: !!staffId,
  });
}

export function useUpdateBenefits(staffId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<EmploymentBenefits, 'id' | 'staffId'>) => {
      if (!staffId) throw new Error('No staff ID');

      const payload = {
        staff_id: staffId,
        health_insurance: data.healthInsurance,
        social_insurance: data.socialInsurance,
        probation_end_date: data.probationEndDate || null,
        contract_type: data.contractType,
        contract_start_date: data.contractStartDate || null,
        contract_end_date: data.contractEndDate || null,
        meal_allowance: data.mealAllowance,
        transport_allowance: data.transportAllowance,
        other_benefits: data.otherBenefits || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('employee_benefits')
        .upsert(payload, { onConflict: 'staff_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-benefits', staffId] });
    },
  });
}

// =============================================
// Management Notes
// =============================================

export function useEmployeeNotes(staffId: string | undefined) {
  return useQuery({
    queryKey: ['employee-notes', staffId],
    queryFn: async (): Promise<EmployeeNote[]> => {
      if (!staffId) return [];

      const { data, error } = await supabase
        .from('employee_notes')
        .select('*, author:profiles!author_id(full_name)')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        staffId: row.staff_id,
        authorId: row.author_id,
        authorName: row.author?.full_name || 'Unknown',
        note: row.note,
        isPrivate: row.is_private,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    },
    enabled: !!staffId,
  });
}

export function useAddNote(staffId: string | undefined) {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);

  return useMutation({
    mutationFn: async (note: string) => {
      if (!staffId) throw new Error('No staff ID');
      if (!profile?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('employee_notes')
        .insert({
          staff_id: staffId,
          author_id: profile.id,
          note,
          is_private: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-notes', staffId] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, note, staffId }: { noteId: string; note: string; staffId: string }) => {
      const { error } = await supabase
        .from('employee_notes')
        .update({ note, updated_at: new Date().toISOString() })
        .eq('id', noteId);

      if (error) throw error;
      return staffId;
    },
    onSuccess: (_data, { staffId }) => {
      queryClient.invalidateQueries({ queryKey: ['employee-notes', staffId] });
    },
  });
}

// =============================================
// Employment History
// =============================================

export function useEmploymentHistory(staffId: string | undefined) {
  return useQuery({
    queryKey: ['employment-history', staffId],
    queryFn: async (): Promise<EmploymentHistoryEntry[]> => {
      if (!staffId) return [];

      const { data, error } = await supabase
        .from('employment_history')
        .select('*, recorder:profiles!recorded_by(full_name)')
        .eq('staff_id', staffId)
        .order('effective_date', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        staffId: row.staff_id,
        eventType: row.event_type,
        description: row.description,
        effectiveDate: row.effective_date,
        recordedBy: row.recorded_by,
        recordedByName: row.recorder?.full_name || null,
        createdAt: row.created_at,
      }));
    },
    enabled: !!staffId,
  });
}

export function useAddHistoryEntry(staffId: string | undefined) {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);

  return useMutation({
    mutationFn: async (entry: {
      eventType: EmploymentHistoryEntry['eventType'];
      description: string;
      effectiveDate: string;
    }) => {
      if (!staffId) throw new Error('No staff ID');
      if (!profile?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('employment_history')
        .insert({
          staff_id: staffId,
          event_type: entry.eventType,
          description: entry.description,
          effective_date: entry.effectiveDate,
          recorded_by: profile.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-history', staffId] });
    },
  });
}

export function useUpdateHistoryEntry(staffId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      id: string;
      eventType: EmploymentHistoryEntry['eventType'];
      description: string;
      effectiveDate: string;
    }) => {
      const { error } = await supabase
        .from('employment_history')
        .update({
          event_type: entry.eventType,
          description: entry.description,
          effective_date: entry.effectiveDate,
        })
        .eq('id', entry.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-history', staffId] });
    },
  });
}

// =============================================
// Documents (Supabase Storage)
// =============================================

const BUCKET = 'employee-documents';

export function useEmployeeDocuments(staffId: string | undefined) {
  return useQuery({
    queryKey: ['employee-documents', staffId],
    queryFn: async (): Promise<EmployeeDocument[]> => {
      if (!staffId) return [];

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(staffId, { sortBy: { column: 'created_at', order: 'desc' } });

      if (error) {
        // Bucket may not exist yet — return empty rather than throwing
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          return [];
        }
        throw error;
      }

      return (data || [])
        .filter((f) => f.name !== '.emptyFolderPlaceholder')
        .map((f) => ({
          name: f.name,
          id: f.id || f.name,
          size: f.metadata?.size,
          createdAt: f.created_at,
        }));
    },
    enabled: !!staffId,
  });
}

export function useUploadDocument(staffId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!staffId) throw new Error('No staff ID');

      const path = `${staffId}/${file.name}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', staffId] });
    },
  });
}

export function useDeleteDocument(staffId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileName: string) => {
      if (!staffId) throw new Error('No staff ID');

      const { error } = await supabase.storage
        .from(BUCKET)
        .remove([`${staffId}/${fileName}`]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', staffId] });
    },
  });
}

export function getDocumentUrl(staffId: string, fileName: string): string {
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(`${staffId}/${fileName}`);
  return data.publicUrl;
}
