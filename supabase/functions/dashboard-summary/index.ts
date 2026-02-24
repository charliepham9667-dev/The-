import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentDay = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const pad = (n: number) => String(n).padStart(2, "0");
    const periodStart = `${currentYear}-${pad(currentMonth + 1)}-01`;
    const periodEnd = `${currentYear}-${pad(currentMonth + 1)}-${pad(currentDay)}`;
    const periodStartLastYear = `${currentYear - 1}-${pad(currentMonth + 1)}-01`;
    const today = `${currentYear}-${pad(currentMonth + 1)}-${pad(currentDay)}`;

    // Run all queries in parallel
    const [
      targetResult,
      mtdMetricsResult,
      latestDateResult,
      lastYearPeriodResult,
      weeklyCurrentResult,
      reviewsResult,
      latestGoogleResult,
      shiftsResult,
      todayMetricsResult,
      complianceResult,
      allYearMetricsResult,
      allTargetsResult,
      syncLogResult,
    ] = await Promise.all([
      // 1. Monthly revenue target
      db.from("targets")
        .select("target_value")
        .eq("metric", "revenue")
        .eq("period", "monthly")
        .eq("period_start", periodStart)
        .single(),

      // 2. MTD daily metrics (revenue)
      db.from("daily_metrics")
        .select("date, revenue")
        .gte("date", periodStart)
        .lte("date", periodEnd)
        .order("date", { ascending: false }),

      // 3. Latest date with data this year (for KPI period alignment)
      db.from("daily_metrics")
        .select("date")
        .gte("date", `${currentYear}-01-01`)
        .order("date", { ascending: false })
        .limit(1)
        .single(),

      // 4. Last year same period (revenue, pax, avg_spend) — fetched after we know endDay below
      // Placeholder — resolved after latestDateResult
      Promise.resolve({ data: null, error: null }),

      // 5. Weekly: last 7 days of current year
      db.from("daily_metrics")
        .select("date, revenue")
        .gte("date", `${currentYear}-01-01`)
        .order("date", { ascending: false })
        .limit(7),

      // 6. Reviews (most recent 10)
      db.from("reviews")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(10),

      // 7. Latest Google rating from daily_metrics
      db.from("daily_metrics")
        .select("date, google_rating, google_review_count")
        .not("google_rating", "is", null)
        .order("date", { ascending: false })
        .limit(1),

      // 8. Today's shifts
      db.from("shifts")
        .select("*")
        .eq("shift_date", today),

      // 9. Today's metrics for staffing
      db.from("daily_metrics")
        .select("pax, staff_on_duty")
        .eq("date", today)
        .single(),

      // 10. Compliance items
      db.from("compliance_items")
        .select("*")
        .order("due_date", { ascending: true }),

      // 11. All daily metrics for the year (monthly performance)
      db.from("daily_metrics")
        .select("date, revenue")
        .gte("date", `${currentYear}-01-01`)
        .lte("date", `${currentYear}-12-31`)
        .order("date", { ascending: true }),

      // 12. All monthly revenue targets
      db.from("targets")
        .select("*")
        .eq("metric", "revenue")
        .eq("period", "monthly"),

      // 13. Last sync log
      db.from("sync_logs")
        .select("completed_at, status")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    // Resolve endDay from latestDateResult for KPI comparison
    const endDay = latestDateResult.data?.date
      ? parseInt(latestDateResult.data.date.split("-")[2], 10)
      : currentDay;

    const periodEnd2026 = `${currentYear}-${pad(currentMonth + 1)}-${pad(endDay)}`;
    const periodEnd2025 = `${currentYear - 1}-${pad(currentMonth + 1)}-${pad(endDay)}`;

    // Fetch last year KPI period data now that we have endDay
    const [currentPeriodResult, lastYearPeriodFull] = await Promise.all([
      db.from("daily_metrics")
        .select("revenue, pax, avg_spend")
        .gte("date", periodStart)
        .lte("date", periodEnd2026),
      db.from("daily_metrics")
        .select("revenue, pax, avg_spend")
        .gte("date", periodStartLastYear)
        .lte("date", periodEnd2025),
    ]);

    // ─── Revenue Velocity ────────────────────────────────────────────────────
    const monthlyTarget = targetResult.data?.target_value || 750000000;
    const metricsRows = mtdMetricsResult.data || [];
    const mtdRevenue = metricsRows.reduce((s: number, r: { revenue: number }) => s + (r.revenue || 0), 0);
    const daysWithData = metricsRows.filter((r: { revenue: number }) => r.revenue > 0).length;
    const yesterdayRevenue = metricsRows[0]?.revenue || 0;
    const avgDailyRevenue = daysWithData > 0 ? mtdRevenue / daysWithData : 0;
    const goalAchievedPercent = monthlyTarget > 0 ? (mtdRevenue / monthlyTarget) * 100 : 0;
    const surplus = mtdRevenue - monthlyTarget;
    const projectedMonthEnd = daysWithData > 0 ? (mtdRevenue / daysWithData) * daysInMonth : 0;
    const dailyTargetPace = monthlyTarget / daysInMonth;
    const showStretchGoal = goalAchievedPercent >= 100;
    const stretchGoal = monthlyTarget * 1.5;
    const gapToStretch = stretchGoal - mtdRevenue;
    const remainingDays = daysInMonth - currentDay;
    const requiredPaceForStretch = remainingDays > 0 ? gapToStretch / remainingDays : 0;

    const revenueVelocity = {
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

    // ─── KPI Summary ────────────────────────────────────────────────────────
    const sumPeriod = (rows: { revenue: number; pax: number; avg_spend: number }[]) =>
      rows.reduce(
        (acc, row) => ({
          revenue: acc.revenue + (row.revenue || 0),
          pax: acc.pax + (row.pax || 0),
          totalSpend: acc.totalSpend + ((row.avg_spend || 0) * (row.pax || 0)),
        }),
        { revenue: 0, pax: 0, totalSpend: 0, avgSpend: 0 }
      );

    const currentP = sumPeriod(currentPeriodResult.data || []);
    currentP.avgSpend = currentP.pax > 0 ? currentP.totalSpend / currentP.pax : 0;
    const lastYearP = sumPeriod(lastYearPeriodFull.data || []);
    lastYearP.avgSpend = lastYearP.pax > 0 ? lastYearP.totalSpend / lastYearP.pax : 0;

    const pct = (curr: number, prev: number) =>
      prev > 0 ? ((curr - prev) / prev) * 100 : 0;
    const revenueTrend = pct(currentP.revenue, lastYearP.revenue);
    const paxTrend = pct(currentP.pax, lastYearP.pax);
    const avgSpendTrend = pct(currentP.avgSpend, lastYearP.avgSpend);
    const targetPercentage = Math.round((currentP.revenue / monthlyTarget) * 100);

    const kpiSummary = {
      revenue: {
        value: currentP.revenue,
        trend: revenueTrend,
        trendLabel: `${revenueTrend >= 0 ? "+" : ""}${revenueTrend.toFixed(1)}% YoY`,
      },
      pax: {
        value: currentP.pax,
        trend: paxTrend,
        trendLabel: `${paxTrend >= 0 ? "+" : ""}${paxTrend.toFixed(1)}% YoY`,
      },
      avgSpend: {
        value: Math.round(currentP.avgSpend),
        trend: avgSpendTrend,
        trendLabel: `${avgSpendTrend >= 0 ? "+" : ""}${avgSpendTrend.toFixed(1)}% YoY`,
      },
      yoyGrowth: {
        value: revenueTrend,
        trendLabel: `${paxTrend >= 0 ? "+" : ""}${paxTrend.toFixed(1)}% Pax YoY`,
      },
      targetMet: {
        percentage: Math.min(targetPercentage, 100),
        isOnTrack: targetPercentage >= 100,
      },
    };

    // ─── Weekly Sales ────────────────────────────────────────────────────────
    const recentDays = [...(weeklyCurrentResult.data || [])].reverse();
    const lastYearDates = recentDays.map((row: { date: string }) => {
      const d = new Date(row.date + "T12:00:00");
      d.setDate(d.getDate() - 364);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    });

    const lastYearWeeklyResult = await db.from("daily_metrics")
      .select("date, revenue")
      .in("date", lastYearDates);

    const lyMap = new Map<string, number>();
    (lastYearWeeklyResult.data || []).forEach((r: { date: string; revenue: number }) => {
      lyMap.set(r.date, r.revenue);
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklySales = recentDays.map((row: { date: string; revenue: number }, i: number) => ({
      day: dayNames[new Date(row.date + "T00:00:00").getDay()],
      actual: Math.round(row.revenue / 1000000),
      lastYear: Math.round((lyMap.get(lastYearDates[i]) || 0) / 1000000),
      projected: 0,
    }));

    // ─── Reviews ────────────────────────────────────────────────────────────
    const reviewRows = reviewsResult.data || [];
    const mappedReviews = reviewRows.map((r: {
      id: string;
      source: string;
      author_name: string | null;
      rating: number;
      comment: string | null;
      sentiment_score: number | null;
      published_at: string;
    }) => ({
      id: r.id,
      source: r.source,
      authorName: r.author_name,
      rating: r.rating,
      comment: r.comment,
      sentimentScore: r.sentiment_score,
      publishedAt: r.published_at,
    }));
    const avgRating =
      mappedReviews.length > 0
        ? mappedReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / mappedReviews.length
        : 0;
    const avgSentiment =
      mappedReviews.length > 0
        ? mappedReviews.reduce((s: number, r: { sentimentScore: number | null }) => s + (r.sentimentScore || 0), 0) / mappedReviews.length
        : 0;

    const reviews = {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: mappedReviews.length,
      sentimentScore: Math.round(avgSentiment * 100),
      recentReviews: mappedReviews.slice(0, 5),
    };

    // ─── Google Reviews ──────────────────────────────────────────────────────
    const latestMetric = latestGoogleResult.data?.[0];
    const googleReviews = {
      isConnected: true,
      rating: Math.round((latestMetric?.google_rating || 0) * 10) / 10,
      reviewCount: latestMetric?.google_review_count || 0,
      recentReviews: [],
    };

    // ─── Staffing ────────────────────────────────────────────────────────────
    const shifts = shiftsResult.data || [];
    const activeShifts = shifts.filter(
      (s: { status: string }) => s.status === "in_progress" || s.status === "scheduled"
    );
    const totalRequired = shifts.filter((s: { status: string }) => s.status !== "cancelled").length;
    const activeStaff = activeShifts.filter((s: { status: string }) => s.status === "in_progress").length;
    const pax = todayMetricsResult.data?.pax || 0;
    const scheduledNotStarted = activeShifts.filter((s: { status: string }) => s.status === "scheduled");
    const roleGroups = scheduledNotStarted.reduce((acc: Record<string, number>, s: { role: string }) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {});
    const coverageGaps = Object.entries(roleGroups).map(([role, count]) => ({ role, count }));

    const staffing = {
      activeStaff: todayMetricsResult.data?.staff_on_duty || activeStaff || 4,
      totalRequired: totalRequired || 4,
      coveragePercentage: totalRequired > 0 ? Math.round((activeStaff / totalRequired) * 100) : 100,
      guestStaffRatio: activeStaff > 0 ? Math.round((pax / activeStaff) * 10) / 10 : 0,
      coverageGaps,
    };

    // ─── Compliance ──────────────────────────────────────────────────────────
    const compliance = (complianceResult.data || []).map((r: {
      id: string;
      title: string;
      description: string | null;
      type: string;
      status: string;
      due_date: string | null;
      completed_at: string | null;
    }) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      status: r.status,
      dueDate: r.due_date,
      completedAt: r.completed_at,
    }));

    // ─── Monthly Performance ─────────────────────────────────────────────────
    const monthlyRevenue: Record<number, number> = {};
    (allYearMetricsResult.data || []).forEach((r: { date: string; revenue: number }) => {
      const m = parseInt(r.date.split("-")[1], 10) - 1;
      monthlyRevenue[m] = (monthlyRevenue[m] || 0) + (r.revenue || 0);
    });
    const targetMap: Record<number, number> = {};
    (allTargetsResult.data || []).forEach((t: { period_start: string; target_value: number }) => {
      if (t.period_start) {
        const m = parseInt(t.period_start.split("-")[1], 10) - 1;
        targetMap[m] = t.target_value;
      }
    });
    const defaultTarget = 750000000;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyPerformance = [];
    for (let i = 0; i <= currentMonth; i++) {
      const actual = monthlyRevenue[i] || 0;
      if (actual > 0) {
        const tgt = targetMap[i] || defaultTarget;
        monthlyPerformance.push({
          month: monthNames[i],
          monthIndex: i,
          actualRevenue: actual,
          targetRevenue: tgt,
          achievementPercent: tgt > 0 ? Math.round((actual / tgt) * 100) : 0,
        });
      }
    }

    // ─── Sync Status ─────────────────────────────────────────────────────────
    let syncStatus = { lastSyncAt: null, status: null, hoursAgo: -1, isStale: true };
    if (syncLogResult.data?.completed_at) {
      const completedAt = new Date(syncLogResult.data.completed_at);
      const hoursAgo = Math.round((now.getTime() - completedAt.getTime()) / (1000 * 60 * 60));
      syncStatus = {
        lastSyncAt: syncLogResult.data.completed_at,
        status: syncLogResult.data.status,
        hoursAgo,
        isStale: hoursAgo > 24,
      };
    }

    const payload = {
      revenueVelocity,
      kpiSummary,
      weeklySales,
      reviews,
      googleReviews,
      staffing,
      compliance,
      monthlyPerformance,
      syncStatus,
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        // Cache at the CDN edge for 5 minutes; browser must revalidate
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("dashboard-summary error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
