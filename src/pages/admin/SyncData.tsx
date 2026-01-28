import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useSyncLogs, useSyncSheets, extractSheetId, type SyncLog } from '../../hooks/useSync';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  running: { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/20', animate: true },
  completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
};

// Pre-configured sheet ID for The Roof HQ
const DEFAULT_SHEET_ID = '1xAWccI666vfcoUWpMzQyrlQ-sZ4ggkPS7oNwfIx71iw';

export function SyncData() {
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_ID);
  const [sheetName, setSheetName] = useState('Sales26*');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: syncLogs, isLoading: logsLoading } = useSyncLogs();
  const syncSheets = useSyncSheets();

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
      } else {
        setError(result.error || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
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

      {/* Setup Instructions */}
      <div className="rounded-xl border border-dashed border-[#374151] bg-[#1a1f2e]/50 p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Setup Requirements</h3>
        <ol className="space-y-2 text-sm text-slate-400">
          <li>1. Your Google Sheet must be set to "Anyone with link can view"</li>
          <li>2. The Edge Function requires a <code className="text-[#ff6b35]">GOOGLE_API_KEY</code> secret</li>
          <li>3. Expected columns: C=Date, H=TotalRevenue (VND), Q=Pax, T=AvgSpend</li>
          <li>4. Date format: DD.MM.YYYY (European format)</li>
          <li>5. Rows starting with "KW" (weekly summaries) are automatically skipped</li>
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
