import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return null;
}

function parseNumber(value: string | number): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/[đ₫VND\s$,]/gi, "");
  return parseFloat(cleaned) || 0;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { sheetId, sheetName } = await req.json();
    if (!sheetId) throw new Error("sheetId is required");

    const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!googleApiKey) throw new Error("GOOGLE_API_KEY not configured. Set it in Edge Function secrets.");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const range = `${sheetName || "Sales26*"}!A16:AF386`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${googleApiKey}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sheets API error: ${await res.text()}`);

    const { values: rows = [] } = await res.json();
    let processed = 0;
    let skipped = 0;
    let errors: string[] = [];
    
    console.log(`Fetched ${rows.length} rows from sheet`);

    for (const row of rows) {
      // Sales26* sheet has 2 empty columns at start, so date is at index 2
      // Check both index 0 and index 2 for date
      let dateStr = (row[0] || "").toString().trim();
      let dateIndex = 0;
      
      // If column A is empty, check column C (index 2)
      if (!dateStr || dateStr.match(/^[A-Za-z]{3,}$/)) {
        dateStr = (row[2] || "").toString().trim();
        dateIndex = 2;
      }
      
      // Skip KW rows (week summaries), month labels, and empty rows
      if (dateStr.startsWith("KW") || dateStr.match(/^[A-Za-z]{3,}$/) || !dateStr) {
        skipped++;
        continue;
      }
      
      const date = parseDate(dateStr);
      if (!date) {
        // Log first few non-parseable rows for debugging
        if (errors.length < 5) {
          errors.push(`Cannot parse date: "${dateStr}"`);
        }
        skipped++;
        continue;
      }

      // Column mapping:
      // H(7)=TotalRevenue, AC(28)=Pax, AD(29)=GoogleReviews, AE(30)=GoogleStars
      // Sales25*: AD(29)=AvgSpend | Sales26*: AF(31)=AvgSpend
      const totalRevenue = parseNumber(row[7] || 0);   // Column H - Daily Total Revenue VND
      const pax = parseInt(row[28] || "0") || 0;       // Column AC - Pax
      const isSales25 = (sheetName || "").toLowerCase().includes("25");
      const avgSpend = parseNumber(row[isSales25 ? 29 : 31] || 0);  // AD for Sales25, AF for Sales26
      
      // Google Reviews data (Sales26* only - columns AD and AE)
      const googleReviewCount = !isSales25 ? (parseInt(row[29] || "0") || 0) : 0;  // Column AD
      const googleRatingStr = !isSales25 ? (row[30] || "").toString().replace("*", "") : "0";  // Column AE
      const googleRating = parseFloat(googleRatingStr) || 0;

      // Skip rows with no meaningful data
      if (totalRevenue === 0 && pax === 0) {
        skipped++;
        continue;
      }

      // Build upsert object
      const upsertData: Record<string, unknown> = {
        date,
        revenue: Math.round(totalRevenue),
        pax,
        avg_spend: Math.round(avgSpend),
      };
      
      // Add Google review data if available
      if (googleRating > 0) upsertData.google_rating = googleRating;
      if (googleReviewCount > 0) upsertData.google_review_count = googleReviewCount;

      const { error: insertError } = await supabase.from("daily_metrics").upsert(
        upsertData, 
        { onConflict: "date" }
      );

      if (insertError) {
        if (errors.length < 5) {
          errors.push(`Insert error for ${date}: ${insertError.message}`);
        }
      } else {
        processed++;
      }
    }

    // Find rows with actual revenue data for debugging
    let sampleWithData = null;
    let processedDates: string[] = [];
    
    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const r = rows[i];
      let dateStr = (r[0] || "").toString().trim();
      let dateIndex = 0;
      
      if (!dateStr || !dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
        dateStr = (r[2] || "").toString().trim();
        dateIndex = 2;
      }
      
      if (dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
        const offset = dateIndex;
        const rev = parseNumber(r[3 + offset] || 0);
        if (rev > 0 && !sampleWithData) {
          sampleWithData = { row: i, date: dateStr, offset, data: r.slice(0, 25) };
        }
        if (processedDates.length < 5 && rev > 0) {
          processedDates.push(`${dateStr}: rev=${rev}`);
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      processed,
      skipped,
      totalRows: rows.length,
      errors: errors.length > 0 ? errors : undefined,
      sampleRow: rows.length > 0 ? rows[0]?.slice(0, 10) : null,
      sampleWithData,
      processedDates
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
