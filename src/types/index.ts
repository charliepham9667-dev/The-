export type UserRole = 'owner' | 'manager' | 'staff';
export type ManagerType = 'bar' | 'floor' | 'marketing' | null;

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  managerType?: ManagerType;
  avatarUrl?: string;
  phone?: string;
  hireDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  timezone: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
}

export interface DailyMetrics {
  id: string;
  date: string;
  revenue: number;
  pax: number;
  avgSpend: number;
  laborCost: number;
  staffOnDuty: number;
  hoursScheduled: number;
  hoursWorked: number;
  projectedRevenue: number;
  createdAt: string;
}

export type ShiftStatus = 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';

export interface Shift {
  id: string;
  venueId: string;
  staffId: string;
  role: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
}

export type ComplianceStatus = 'action_required' | 'needs_attention' | 'passed' | 'pending';
export type ComplianceType = 'license' | 'permit' | 'certification' | 'audit' | 'training';

export interface ComplianceItem {
  id: string;
  title: string;
  description?: string;
  type: ComplianceType;
  status: ComplianceStatus;
  dueDate?: string;
  completedAt?: string;
  staffId?: string;
  createdAt: string;
}

export type ReviewSource = 'google' | 'tripadvisor' | 'facebook' | 'internal';

export interface Review {
  id: string;
  source: ReviewSource;
  authorName?: string;
  rating: number;
  comment?: string;
  sentimentScore?: number;
  publishedAt: string;
  createdAt: string;
}

export interface Target {
  id: string;
  venueId: string;
  metric: 'laborCostPercentage' | 'sales' | 'hoursWorked' | 'hoursScheduled';
  value: number;
  period: 'daily' | 'weekly' | 'monthly';
  effectiveFrom: string;
  effectiveTo?: string;
}

