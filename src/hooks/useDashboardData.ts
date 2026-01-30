import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// =============================================
// Types for Dashboard Data
// =============================================

export interface DailyMetric {
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
}

export interface Review {
  id: string;
  source: 'google' | 'tripadvisor' | 'facebook' | 'internal';
  authorName: string | null;
  rating: number;
  comment: string | null;
  sentimentScore: number | null;
  publishedAt: string;
}

export interface ComplianceItem {
  id: string;
  title: string;
  description: string | null;
  type: 'license' | 'permit' | 'certification' | 'audit' | 'training';
  status: 'action_required' | 'needs_attention' | 'passed' | 'pending';
  dueDate: string | null;
  completedAt: string | null;
}

export interface Shift {
  id: string;
  staffId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  role: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';
  clockIn: string | null;
  clockOut: string | null;
}

export interface Target {
  id: string;
  metric: 'revenue' | 'pax' | 'labor_cost_percentage' | 'avg_spend';
  targetValue: number;
  period: 'daily' | 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string | null;
}

// =============================================
// Revenue Velocity
// =============================================

export interface RevenueVelocityData {
  monthlyTarget: number;
  mtdRevenue: number;
  goalAchievedPercent: number;
  currentDay: number;
  daysInMonth: number;
  surplus: number; // positive = surplus, negative = deficit
  projectedMonthEnd: number;
  dailyTargetPace: number; // required daily to hit base target
  // Stretch goal (1.5x target, only shown if > 100% achieved)
  showStretchGoal: boolean;
  stretchGoal: number;
  gapToStretch: number;
  requiredPaceForStretch: number;
  // For insight text
  yesterdayRevenue: number;
  avgDailyRevenue: number;
}

export function useRevenueVelocity() {
  return useQuery({
    queryKey: ['revenue-velocity'],
    queryFn: async (): Promise<RevenueVelocityData> => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      // Get monthly target
      const periodStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const { data: targetData } = await supabase
        .from('targets')
        .select('target_value')
        .eq('metric', 'revenue')
        .eq('period', 'monthly')
        .eq('period_start', periodStart)
        .single();

      const monthlyTarget = targetData?.target_value || 750000000; // Default 750M

      // Get MTD revenue
      const { data: metricsData } = await supabase
        .from('daily_metrics')
        .select('date, revenue')
        .gte('date', periodStart)
        .lte('date', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`)
        .order('date', { ascending: false });

      const mtdRevenue = (metricsData || []).reduce((sum, row) => sum + (row.revenue || 0), 0);
      const daysWithData = (metricsData || []).filter(r => r.revenue > 0).length;
      
      // Yesterday's revenue (most recent day)
      const yesterdayRevenue = metricsData && metricsData.length > 0 ? metricsData[0].revenue : 0;
      
      // Average daily revenue
      const avgDailyRevenue = daysWithData > 0 ? mtdRevenue / daysWithData : 0;

      // Calculations
      const goalAchievedPercent = monthlyTarget > 0 ? (mtdRevenue / monthlyTarget) * 100 : 0;
      const surplus = mtdRevenue - monthlyTarget; // Simple: actual - target
      const projectedMonthEnd = daysWithData > 0 ? (mtdRevenue / daysWithData) * daysInMonth : 0;
      const dailyTargetPace = monthlyTarget / daysInMonth;

      // Stretch goal (1.5x, only if > 100% achieved)
      const showStretchGoal = goalAchievedPercent >= 100;
      const stretchGoal = monthlyTarget * 1.5;
      const gapToStretch = stretchGoal - mtdRevenue;
      const remainingDays = daysInMonth - currentDay;
      const requiredPaceForStretch = remainingDays > 0 ? gapToStretch / remainingDays : 0;

      return {
        monthlyTarget,
        mtdRevenue,
        goalAchievedPercent,
        currentDay,
        daysInMonth,
        surplus,
        projectedMonthEnd,
        dailyTargetPace,
        showStretchGoal,
        stretchGoal,
        gapToStretch,
        requiredPaceForStretch,
        yesterdayRevenue,
        avgDailyRevenue,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// =============================================
// Sync Status
// =============================================

export interface SyncStatus {
  lastSyncAt: string | null;
  status: 'completed' | 'failed' | 'running' | 'pending' | null;
  hoursAgo: number;
  isStale: boolean; // true if > 24 hours since last sync
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: async (): Promise<SyncStatus> => {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('completed_at, status')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data?.completed_at) {
        return {
          lastSyncAt: null,
          status: null,
          hoursAgo: -1,
          isStale: true,
        };
      }

      const completedAt = new Date(data.completed_at);
      const now = new Date();
      const hoursAgo = Math.round((now.getTime() - completedAt.getTime()) / (1000 * 60 * 60));

      return {
        lastSyncAt: data.completed_at,
        status: data.status,
        hoursAgo,
        isStale: hoursAgo > 24,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// =============================================
// Target Management
// =============================================

export function useTargets() {
  return useQuery({
    queryKey: ['targets'],
    queryFn: async (): Promise<Target[]> => {
      const { data, error } = await supabase
        .from('targets')
        .select('*')
        .eq('metric', 'revenue')
        .eq('period', 'monthly')
        .order('period_start', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        metric: row.metric,
        targetValue: row.target_value,
        period: row.period,
        periodStart: row.period_start,
        periodEnd: row.period_end,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTarget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { month: number; year: number; targetValue: number }) => {
      const periodStart = `${data.year}-${String(data.month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(data.year, data.month + 1, 0).getDate();
      const periodEnd = `${data.year}-${String(data.month + 1).padStart(2, '0')}-${lastDay}`;

      const { data: result, error } = await supabase
        .from('targets')
        .insert({
          metric: 'revenue',
          target_value: data.targetValue,
          period: 'monthly',
          period_start: periodStart,
          period_end: periodEnd,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-performance'] });
    },
  });
}

export function useUpdateTarget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: string; targetValue: number }) => {
      const { data: result, error } = await supabase
        .from('targets')
        .update({ target_value: data.targetValue })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-performance'] });
    },
  });
}

export function useDeleteTarget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('targets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-performance'] });
    },
  });
}

// =============================================
// KPI Summary (computed from daily_metrics)
// =============================================

export interface KPISummary {
  revenue: { value: number; trend: number; trendLabel: string };
  pax: { value: number; trend: number; trendLabel: string };
  avgSpend: { value: number; trend: number; trendLabel: string };
  yoyGrowth: { value: number; trendLabel: string };
  targetMet: { percentage: number; isOnTrack: boolean };
}

export function useKPISummary() {
  return useQuery({
    queryKey: ['kpi-summary'],
    queryFn: async (): Promise<KPISummary> => {
      // Get current year
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // First, find the latest date with data in current year
      const { data: latestData } = await supabase
        .from('daily_metrics')
        .select('date')
        .gte('date', `${currentYear}-01-01`)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      // Use latest data date, or fall back to today
      // Parse date string directly to avoid timezone issues (date is YYYY-MM-DD format)
      const endDay = latestData?.date 
        ? parseInt(latestData.date.split('-')[2], 10)
        : now.getDate();
      
      // Current period: Month start to latest data date (2026)
      const periodStart2026 = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const periodEnd2026 = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
      
      // Same period last year (2025) - use same day range for fair comparison
      const periodStart2025 = `${currentYear - 1}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const periodEnd2025 = `${currentYear - 1}-${String(currentMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

      // Get current period data (2026)
      const { data: currentPeriodData, error: currentError } = await supabase
        .from('daily_metrics')
        .select('revenue, pax, avg_spend')
        .gte('date', periodStart2026)
        .lte('date', periodEnd2026);

      if (currentError) {
        console.error('KPI fetch error:', currentError);
        throw currentError;
      }

      // Get same period last year data (2025) - matching date range
      const { data: lastYearPeriodData } = await supabase
        .from('daily_metrics')
        .select('revenue, pax, avg_spend')
        .gte('date', periodStart2025)
        .lte('date', periodEnd2025);

      // Get monthly target
      const { data: targetData } = await supabase
        .from('targets')
        .select('*')
        .eq('metric', 'revenue')
        .eq('period', 'monthly')
        .single();

      // Sum current period metrics
      const currentPeriod = (currentPeriodData || []).reduce(
        (acc, row) => ({
          revenue: acc.revenue + (row.revenue || 0),
          pax: acc.pax + (row.pax || 0),
          totalSpend: acc.totalSpend + ((row.avg_spend || 0) * (row.pax || 0)),
        }),
        { revenue: 0, pax: 0, totalSpend: 0 }
      );
      currentPeriod.avgSpend = currentPeriod.pax > 0 ? currentPeriod.totalSpend / currentPeriod.pax : 0;

      // Sum last year period metrics
      const lastYearPeriod = (lastYearPeriodData || []).reduce(
        (acc, row) => ({
          revenue: acc.revenue + (row.revenue || 0),
          pax: acc.pax + (row.pax || 0),
          totalSpend: acc.totalSpend + ((row.avg_spend || 0) * (row.pax || 0)),
        }),
        { revenue: 0, pax: 0, totalSpend: 0 }
      );
      lastYearPeriod.avgSpend = lastYearPeriod.pax > 0 ? lastYearPeriod.totalSpend / lastYearPeriod.pax : 0;

      const target = targetData?.target_value || 750000000;

      // Calculate YoY trends (same period comparison)
      const revenueTrend = lastYearPeriod.revenue > 0
        ? ((currentPeriod.revenue - lastYearPeriod.revenue) / lastYearPeriod.revenue) * 100
        : 0;
      const paxTrend = lastYearPeriod.pax > 0
        ? ((currentPeriod.pax - lastYearPeriod.pax) / lastYearPeriod.pax) * 100
        : 0;
      const avgSpendTrend = lastYearPeriod.avgSpend > 0
        ? ((currentPeriod.avgSpend - lastYearPeriod.avgSpend) / lastYearPeriod.avgSpend) * 100
        : 0;

      const targetPercentage = Math.round((currentPeriod.revenue / target) * 100);

      return {
        revenue: {
          value: currentPeriod.revenue,
          trend: revenueTrend,
          trendLabel: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend.toFixed(1)}% YoY`,
        },
        pax: {
          value: currentPeriod.pax,
          trend: paxTrend,
          trendLabel: `${paxTrend >= 0 ? '+' : ''}${paxTrend.toFixed(1)}% YoY`,
        },
        avgSpend: {
          value: Math.round(currentPeriod.avgSpend),
          trend: avgSpendTrend,
          trendLabel: `${avgSpendTrend >= 0 ? '+' : ''}${avgSpendTrend.toFixed(1)}% YoY`,
        },
        yoyGrowth: {
          value: revenueTrend,
          trendLabel: `${paxTrend >= 0 ? '+' : ''}${paxTrend.toFixed(1)}% Pax YoY`,
        },
        targetMet: {
          percentage: Math.min(targetPercentage, 100),
          isOnTrack: targetPercentage >= 100,
        },
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// =============================================
// Weekly Sales Trend
// =============================================

export interface WeeklySalesData {
  day: string;
  projected: number;
  actual: number;
  lastYear: number;
}

export function useWeeklySales() {
  return useQuery({
    queryKey: ['weekly-sales'],
    queryFn: async (): Promise<WeeklySalesData[]> => {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Get the last 7 days with data from current year
      const { data: currentYearData, error } = await supabase
        .from('daily_metrics')
        .select('date, revenue')
        .gte('date', `${currentYear}-01-01`)
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;
      
      // Reverse to get chronological order
      const recentDays = (currentYearData || []).reverse();
      
      // For each 2026 date, find the same day of week from last year
      // Go back 364 days (52 weeks) to get the same weekday
      const lastYearDates = recentDays.map(row => {
        const date2026 = new Date(row.date + 'T12:00:00'); // Use noon to avoid timezone issues
        // Subtract 364 days (52 weeks) to get same day of week in previous year
        const date2025 = new Date(date2026);
        date2025.setDate(date2025.getDate() - 364);
        // Format as YYYY-MM-DD using local date parts (not toISOString which uses UTC)
        const year = date2025.getFullYear();
        const month = String(date2025.getMonth() + 1).padStart(2, '0');
        const day = String(date2025.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      });
      
      const { data: lastYearData } = await supabase
        .from('daily_metrics')
        .select('date, revenue')
        .in('date', lastYearDates);
      
      // Create a map of last year's data by date
      const lastYearMap = new Map<string, number>();
      (lastYearData || []).forEach(row => {
        lastYearMap.set(row.date, row.revenue);
      });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      return recentDays.map((row, index) => {
        const lastYearDate = lastYearDates[index];
        const lastYearRevenue = lastYearMap.get(lastYearDate) || 0;
        
        return {
          day: dayNames[new Date(row.date + 'T00:00:00').getDay()],
          actual: Math.round(row.revenue / 1000000),
          lastYear: Math.round(lastYearRevenue / 1000000),
          projected: 0, // Not synced from sheet
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

// =============================================
// Reviews
// =============================================

export interface ReviewsSummary {
  averageRating: number;
  totalReviews: number;
  sentimentScore: number;
  recentReviews: Review[];
}

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async (): Promise<ReviewsSummary> => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const reviews = (data || []).map((row) => ({
        id: row.id,
        source: row.source as Review['source'],
        authorName: row.author_name,
        rating: row.rating,
        comment: row.comment,
        sentimentScore: row.sentiment_score,
        publishedAt: row.published_at,
      }));

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      const avgSentiment = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.sentimentScore || 0), 0) / reviews.length
        : 0;

      return {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
        sentimentScore: Math.round(avgSentiment * 100),
        recentReviews: reviews.slice(0, 5),
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// =============================================
// Google Reviews Integration
// =============================================

export interface GoogleReviewsData {
  isConnected: boolean;
  rating: number;
  reviewCount: number;
  recentReviews: Review[];
}

export function useGoogleReviews() {
  return useQuery({
    queryKey: ['google-reviews'],
    queryFn: async (): Promise<GoogleReviewsData> => {
      // Get latest Google review data from daily_metrics (synced from sheet)
      const { data: metricsData } = await supabase
        .from('daily_metrics')
        .select('date, google_rating, google_review_count')
        .not('google_rating', 'is', null)
        .order('date', { ascending: false })
        .limit(1);

      const latestMetric = metricsData?.[0];
      const rating = latestMetric?.google_rating || 0;
      const reviewCount = latestMetric?.google_review_count || 0;

      return {
        isConnected: true, // Data comes from sheet sync, always "connected"
        rating: Math.round(rating * 10) / 10,
        reviewCount,
        recentReviews: [], // No individual reviews from sheet sync
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGoogleAuth() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  const authorize = () => {
    // Redirect to Google auth endpoint
    window.location.href = `${supabaseUrl}/functions/v1/google-auth`;
  };

  const syncReviews = async () => {
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-google-reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  };

  return { authorize, syncReviews };
}

// =============================================
// Compliance
// =============================================

export function useCompliance() {
  return useQuery({
    queryKey: ['compliance'],
    queryFn: async (): Promise<ComplianceItem[]> => {
      const { data, error } = await supabase
        .from('compliance_items')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type as ComplianceItem['type'],
        status: row.status as ComplianceItem['status'],
        dueDate: row.due_date,
        completedAt: row.completed_at,
      }));
    },
    staleTime: 1000 * 60 * 10,
  });
}

// =============================================
// Monthly Performance
// =============================================

export interface MonthlyPerformanceData {
  month: string;
  monthIndex: number;
  actualRevenue: number;
  targetRevenue: number;
  achievementPercent: number;
}

export function useMonthlyPerformance() {
  return useQuery({
    queryKey: ['monthly-performance'],
    queryFn: async (): Promise<MonthlyPerformanceData[]> => {
      const now = new Date();
      const currentYear = now.getFullYear();

      // Get all daily metrics for current year
      const { data: metricsData, error } = await supabase
        .from('daily_metrics')
        .select('date, revenue')
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`)
        .order('date', { ascending: true });

      if (error) throw error;

      // Get all monthly revenue targets
      const { data: targetsData } = await supabase
        .from('targets')
        .select('*')
        .eq('metric', 'revenue')
        .eq('period', 'monthly');

      // Group metrics by month
      const monthlyRevenue: Record<number, number> = {};
      (metricsData || []).forEach(row => {
        const month = parseInt(row.date.split('-')[1], 10) - 1; // 0-indexed
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (row.revenue || 0);
      });

      // Create target map by month (parse period_start to get month)
      const targetMap: Record<number, number> = {};
      (targetsData || []).forEach(target => {
        if (target.period_start) {
          const month = parseInt(target.period_start.split('-')[1], 10) - 1;
          targetMap[month] = target.target_value;
        }
      });

      // Default target if none set
      const defaultTarget = 750000000; // 750M VND

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Build result for months that have data
      const result: MonthlyPerformanceData[] = [];
      for (let i = 0; i <= now.getMonth(); i++) {
        const actual = monthlyRevenue[i] || 0;
        const target = targetMap[i] || defaultTarget;
        
        // Only include months with data
        if (actual > 0) {
          result.push({
            month: monthNames[i],
            monthIndex: i,
            actualRevenue: actual,
            targetRevenue: target,
            achievementPercent: target > 0 ? Math.round((actual / target) * 100) : 0,
          });
        }
      }

      return result;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// =============================================
// Real-time Staffing
// =============================================

export interface StaffingSummary {
  activeStaff: number;
  totalRequired: number;
  coveragePercentage: number;
  guestStaffRatio: number;
  coverageGaps: { role: string; count: number }[];
}

export function useStaffing() {
  return useQuery({
    queryKey: ['staffing'],
    queryFn: async (): Promise<StaffingSummary> => {
      const today = new Date().toISOString().split('T')[0];

      // Get today's shifts
      const { data: shifts, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('shift_date', today);

      if (error) throw error;

      // Get today's metrics for guest count
      const { data: metrics } = await supabase
        .from('daily_metrics')
        .select('pax, staff_on_duty')
        .eq('date', today)
        .single();

      const activeShifts = (shifts || []).filter(
        (s) => s.status === 'in_progress' || s.status === 'scheduled'
      );
      const totalRequired = (shifts || []).filter(
        (s) => s.status !== 'cancelled'
      ).length;

      const activeStaff = activeShifts.filter((s) => s.status === 'in_progress').length;
      const pax = metrics?.pax || 0;

      // Find coverage gaps (scheduled but not started)
      const gaps: { role: string; count: number }[] = [];
      const scheduledNotStarted = activeShifts.filter((s) => s.status === 'scheduled');
      const roleGroups = scheduledNotStarted.reduce((acc, shift) => {
        acc[shift.role] = (acc[shift.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(roleGroups).forEach(([role, count]) => {
        gaps.push({ role, count });
      });

      return {
        activeStaff: metrics?.staff_on_duty || activeStaff || 4,
        totalRequired: totalRequired || 4,
        coveragePercentage: totalRequired > 0 ? Math.round((activeStaff / totalRequired) * 100) : 100,
        guestStaffRatio: activeStaff > 0 ? Math.round((pax / activeStaff) * 10) / 10 : 0,
        coverageGaps: gaps,
      };
    },
    staleTime: 1000 * 60, // 1 minute for real-time feel
  });
}
