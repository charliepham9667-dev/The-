import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type {
  RevenueVelocityData,
  KPISummary,
  WeeklySalesData,
  ReviewsSummary,
  GoogleReviewsData,
  StaffingSummary,
  ComplianceItem,
  MonthlyPerformanceData,
  SyncStatus,
} from './useDashboardData';

export interface DashboardSummary {
  revenueVelocity: RevenueVelocityData;
  kpiSummary: KPISummary;
  weeklySales: WeeklySalesData[];
  reviews: ReviewsSummary;
  googleReviews: GoogleReviewsData;
  staffing: StaffingSummary;
  compliance: ComplianceItem[];
  monthlyPerformance: MonthlyPerformanceData[];
  syncStatus: SyncStatus;
}

export function useDashboardSummary() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async (): Promise<DashboardSummary> => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/dashboard-summary`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          },
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`dashboard-summary error ${res.status}: ${text}`);
        }

        return res.json();
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            throw new Error('Dashboard load timed out. Please refresh the page.');
          }
          throw err;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });
}
