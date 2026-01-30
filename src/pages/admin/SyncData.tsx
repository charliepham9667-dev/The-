import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, FileSpreadsheet, DollarSign, Bug } from 'lucide-react';
import { useSyncLogs, useSyncSheets, extractSheetId, type SyncLog } from '../../hooks/useSync';
import { usePLSync } from '../../hooks/usePLData';
import { supabase } from '../../lib/supabase';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  running: { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/20', animate: true },
  completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  partial: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
};

// Pre-configured sheet ID for The Roof HQ
const DEFAULT_SHEET_ID = '1xAWccI666vfcoUWpMzQyrlQ-sZ4ggkPS7oNwfIx71iw';

// P&L sheet options - must match exact tab names in Google Sheet
// CSV URLs bypass Google Sheets API cache issues
// yearOverride handles inconsistent year labels in headers
const PNL_SHEETS = [
  { 
    value: 'PnL 2025', 
    label: 'P&L 2025 (Historical)',
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpKJ5tNIx13ACvsiHq0GKrCsTinyt94yItKLybdtkw-ufFfE6NYiSR41bS8lLTBFiTKrqYSBlM55Zm/pub?gid=1452228622&single=true&output=csv',
    yearOverride: undefined
  },
  { 
    value: 'PnL 2026', 
    label: 'P&L 2026 (Current Year)',
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpKJ5tNIx13ACvsiHq0GKrCsTinyt94yItKLybdtkw-ufFfE6NYiSR41bS8lLTBFiTKrqYSBlM55Zm/pub?gid=358626846&single=true&output=csv',
    yearOverride: 2026 // Headers have inconsistent years, force all to 2026
  },
];

export function SyncData() {
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_ID);
  const [sheetName, setSheetName] = useState('Sales26*');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // P&L sync state
  const [pnlSheetUrl, setPnlSheetUrl] = useState(DEFAULT_SHEET_ID);
  const [pnlSheetName, setPnlSheetName] = useState('PnL 2025');
  const [pnlError, setPnlError] = useState<string | null>(null);
  const [pnlSuccess, setPnlSuccess] = useState<string | null>(null);
  const [pnlSyncing, setPnlSyncing] = useState(false);

  const { data: syncLogs, isLoading: logsLoading, refetch: refetchLogs } = useSyncLogs();
  const syncSheets = useSyncSheets();
  const { syncPnl } = usePLSync();

  // Debug state
  const [debugData, setDebugData] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  // Debug function to query database directly
  const handleDebugQuery = async () => {
    setDebugLoading(true);
    try {
      // Query March 2025 budget data directly from database
      const { data, error } = await supabase
        .from('pnl_monthly')
        .select('*')
        .eq('year', 2025)
        .eq('month', 3)
        .eq('data_type', 'budget')
        .single();

      if (error) {
        setDebugData({ error: error.message });
      } else {
        setDebugData({
          month: 'March 2025 Budget',
          labor_cost: data.labor_cost,
          labor_salary: data.labor_salary,
          labor_casual: data.labor_casual,
          labor_insurance: data.labor_insurance,
          labor_13th_month: data.labor_13th_month,
          labor_holiday: data.labor_holiday,
          labor_svc: data.labor_svc,
          opex: data.opex,
          opex_marketing: data.opex_marketing,
          opex_events: data.opex_events,
          opex_consumables: data.opex_consumables,
          fixed_costs: data.fixed_costs,
          fixed_rental: data.fixed_rental,
          synced_at: data.synced_at,
        });
      }
    } catch (err) {
      setDebugData({ error: String(err) });
    } finally {
      setDebugLoading(false);
    }
  };

  const handleSync = async () => {
    setError(null);
    setSuccess(null);

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setError('Invalid Google Sheets URL or ID');
      return;
    }

    try {
      const result = await syncSheets.mutateAsync({
        sheetId,
        sheetName: sheetName || undefined,
      });

      if (result.success) {
        setSuccess(`Synced ${result.processed} records successfully!`);
        refetchLogs();
      } else {
        setError(result.error || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    }
  };

  const handlePnlSync = async () => {
    setPnlError(null);
    setPnlSuccess(null);
    setPnlSyncing(true);
    setDebugData(null); // Clear previous debug

    const sheetId = extractSheetId(pnlSheetUrl);
    if (!sheetId) {
      setPnlError('Invalid Google Sheets URL or ID');
      setPnlSyncing(false);
      return;
    }

    // Get CSV URL and yearOverride for selected sheet
    const selectedSheet = PNL_SHEETS.find(s => s.value === pnlSheetName);
    const csvUrl = selectedSheet?.csvUrl;
    const yearOverride = selectedSheet?.yearOverride;

    try {
      const result = await syncPnl(sheetId, pnlSheetName, csvUrl, yearOverride);
      console.log('P&L Sync result:', result);
      
      // Show full debug info
      if (result.debug) {
        setDebugData({
          syncResult: 'SYNC RESPONSE',
          processed: result.processed,
          monthColumns: result.monthColumns,
          sampleData: result.debug.sampleMonthData,
          sectionChanges: result.debug.sectionChanges,
          rawValuesSample: result.debug.rawValuesSample,
        });
      }

      if (result.success && result.processed > 0) {
        setPnlSuccess(`Synced ${result.processed} months of P&L data successfully! Columns: ${result.monthColumns?.join(', ') || 'N/A'}`);
        refetchLogs();
      } else if (result.processed === 0 && result.monthColumns?.length > 0) {
        // Found columns but no data inserted
        setPnlError(`Found month columns (${result.monthColumns?.join(', ')}) but no P&L categories matched. Check that row labels match expected format.`);
      } else {
        // Build detailed error
        let errorMsg = result.error || 'P&L sync failed';
        if (result.debug) {
          errorMsg += ` | Hint: ${result.debug.hint || 'Check sheet format'}`;
        }
        setPnlError(errorMsg);
      }
    } catch (err) {
      setPnlError(err instanceof Error ? err.message : 'P&L sync failed');
    } finally {
      setPnlSyncing(false);
    }
  };

  // Sync both 2025 and 2026 P&L data
  const handleSyncBothYears = async () => {
    setPnlError(null);
    setPnlSuccess(null);
    setPnlSyncing(true);

    const sheetId = extractSheetId(pnlSheetUrl);
    if (!sheetId) {
      setPnlError('Invalid Google Sheets URL or ID');
      setPnlSyncing(false);
      return;
    }

    try {
      const results = [];
      
      // Sync each year
      for (const sheet of PNL_SHEETS) {
        const result = await syncPnl(sheetId, sheet.value, sheet.csvUrl, sheet.yearOverride);
        results.push({ sheet: sheet.value, ...result });
      }
      
      const successCount = results.filter(r => r.success).length;
      const totalMonths = results.reduce((sum, r) => sum + (r.processed || 0), 0);
      
      if (successCount === PNL_SHEETS.length) {
        setPnlSuccess(`Successfully synced both years! Total: ${totalMonths} months of P&L data.`);
        refetchLogs();
      } else {
        const failed = results.filter(r => !r.success);
        setPnlError(`Some syncs failed: ${failed.map(f => f.sheet).join(', ')}`);
      }
    } catch (err) {
      setPnlError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setPnlSyncing(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Data Sync</h1>
        <p className="text-sm text-slate-400 mt-1">Import data from Google Sheets</p>
      </div>

      {/* Sync Form */}
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Google Sheets Sync</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Google Sheets URL or ID</label>
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/... or just the ID"
              className="w-full rounded-lg bg-[#0f1419] border border-[#374151] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff6b35]"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Sheet Name</label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Sales26*"
              className="w-full rounded-lg bg-[#0f1419] border border-[#374151] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff6b35]"
            />
            <p className="text-xs text-slate-500 mt-1">The tab name in your spreadsheet</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">{success}</span>
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={syncSheets.isPending || !sheetUrl}
            className="flex items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e55a2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${syncSheets.isPending ? 'animate-spin' : ''}`} />
            {syncSheets.isPending ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* P&L Sync Form */}
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">P&L Data Sync</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Google Sheets URL or ID</label>
            <input
              type="text"
              value={pnlSheetUrl}
              onChange={(e) => setPnlSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/... or just the ID"
              className="w-full rounded-lg bg-[#0f1419] border border-[#374151] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff6b35]"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">P&L Sheet</label>
            <select
              value={pnlSheetName}
              onChange={(e) => setPnlSheetName(e.target.value)}
              className="w-full rounded-lg bg-[#0f1419] border border-[#374151] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b35]"
            >
              {PNL_SHEETS.map(sheet => (
                <option key={sheet.value} value={sheet.value}>{sheet.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              P&L data is typically available 15 days after month end
            </p>
          </div>

          {pnlError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">{pnlError}</span>
            </div>
          )}

          {pnlSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">{pnlSuccess}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handlePnlSync}
              disabled={pnlSyncing || !pnlSheetUrl}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${pnlSyncing ? 'animate-spin' : ''}`} />
              {pnlSyncing ? 'Syncing...' : `Sync ${pnlSheetName}`}
            </button>
            <button
              onClick={handleSyncBothYears}
              disabled={pnlSyncing || !pnlSheetUrl}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${pnlSyncing ? 'animate-spin' : ''}`} />
              {pnlSyncing ? 'Syncing...' : 'Sync Both Years'}
            </button>
          </div>
        </div>
      </div>

      {/* Debug Section */}
      <div className="rounded-xl border border-amber-500/30 bg-[#1a1f2e] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bug className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Debug: Check Database Values</h2>
        </div>
        
        <button
          onClick={handleDebugQuery}
          disabled={debugLoading}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50 mb-4"
        >
          <Bug className={`h-4 w-4 ${debugLoading ? 'animate-spin' : ''}`} />
          {debugLoading ? 'Querying...' : 'Check March 2025 Budget Data'}
        </button>

        {debugData && (
          <div className="bg-[#0f1419] rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      <div className="rounded-xl border border-dashed border-[#374151] bg-[#1a1f2e]/50 p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Setup Requirements</h3>
        <ol className="space-y-2 text-sm text-slate-400">
          <li>1. Your Google Sheet must be set to "Anyone with link can view"</li>
          <li>2. The Edge Function requires a <code className="text-[#ff6b35]">GOOGLE_API_KEY</code> secret</li>
          <li>3. <strong>Sales sheets:</strong> C=Date, H=TotalRevenue (VND), AC=Pax, AF=AvgSpend</li>
          <li>4. <strong>P&L sheets:</strong> Monthly data with categories in columns A-B, months starting at column H</li>
          <li>5. Date format: DD.MM.YYYY (European format)</li>
        </ol>
      </div>

      {/* Sync History */}
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Sync History</h2>
        
        {logsLoading ? (
          <p className="text-slate-400">Loading...</p>
        ) : !syncLogs || syncLogs.length === 0 ? (
          <p className="text-slate-400 text-sm">No sync history yet</p>
        ) : (
          <div className="space-y-3">
            {syncLogs.map((log) => {
              const config = statusConfig[log.status];
              const Icon = config.icon;
              
              return (
                <div key={log.id} className="flex items-center justify-between rounded-lg bg-[#0f1419] p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">
                        {log.syncType.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-slate-400">{formatTime(log.startedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {log.status === 'completed' ? (
                      <p className="text-sm text-emerald-400">{log.recordsProcessed} records</p>
                    ) : log.status === 'failed' ? (
                      <p className="text-xs text-red-400 max-w-xs truncate">{log.errorMessage}</p>
                    ) : (
                      <p className="text-sm text-slate-400 capitalize">{log.status}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
