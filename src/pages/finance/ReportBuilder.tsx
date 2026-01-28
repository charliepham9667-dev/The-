import { useState } from 'react';
import { FileText, Download, Calendar, Filter, Plus, Clock, CheckCircle } from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  lastRun: string;
  schedule: string | null;
}

const templates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Daily Sales Summary',
    description: 'Revenue, pax count, and average spend breakdown by hour',
    lastRun: '2 hours ago',
    schedule: 'Daily at 6:00 AM',
  },
  {
    id: '2',
    name: 'Weekly P&L Report',
    description: 'Full profit and loss statement with category breakdown',
    lastRun: '3 days ago',
    schedule: 'Weekly on Monday',
  },
  {
    id: '3',
    name: 'Staff Performance Report',
    description: 'Individual staff metrics, hours worked, and efficiency scores',
    lastRun: '1 week ago',
    schedule: null,
  },
  {
    id: '4',
    name: 'Inventory Movement',
    description: 'Stock levels, usage rates, and reorder recommendations',
    lastRun: '5 days ago',
    schedule: 'Weekly on Friday',
  },
  {
    id: '5',
    name: 'Customer Insights',
    description: 'Review analysis, sentiment trends, and feedback summary',
    lastRun: '2 days ago',
    schedule: null,
  },
];

const recentReports = [
  { id: '1', name: 'Daily Sales Summary - Jan 27', date: '2026-01-27', status: 'ready' },
  { id: '2', name: 'Daily Sales Summary - Jan 26', date: '2026-01-26', status: 'ready' },
  { id: '3', name: 'Weekly P&L Report - Week 4', date: '2026-01-27', status: 'ready' },
  { id: '4', name: 'Customer Insights - Jan', date: '2026-01-25', status: 'ready' },
];

export function ReportBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Report Builder</h1>
          <p className="text-sm text-slate-400 mt-1">Create and schedule custom reports</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e55a2b] transition-colors">
          <Plus className="h-4 w-4" />
          New Report
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 text-left hover:border-[#ff6b35] transition-colors">
          <FileText className="h-5 w-5 text-[#ff6b35] mb-2" />
          <p className="text-sm font-medium text-white">Sales Report</p>
          <p className="text-xs text-slate-400">Generate now</p>
        </button>
        <button className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 text-left hover:border-[#ff6b35] transition-colors">
          <Calendar className="h-5 w-5 text-blue-400 mb-2" />
          <p className="text-sm font-medium text-white">Schedule Report</p>
          <p className="text-xs text-slate-400">Set up automation</p>
        </button>
        <button className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 text-left hover:border-[#ff6b35] transition-colors">
          <Filter className="h-5 w-5 text-purple-400 mb-2" />
          <p className="text-sm font-medium text-white">Custom Query</p>
          <p className="text-xs text-slate-400">Advanced filters</p>
        </button>
        <button className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 text-left hover:border-[#ff6b35] transition-colors">
          <Download className="h-5 w-5 text-emerald-400 mb-2" />
          <p className="text-sm font-medium text-white">Export Data</p>
          <p className="text-xs text-slate-400">CSV, Excel, PDF</p>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Templates */}
        <div className="lg:col-span-2 rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Report Templates</h2>
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10'
                    : 'border-[#374151] bg-[#0f1419] hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{template.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {template.lastRun}
                      </span>
                      {template.schedule && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <Calendar className="h-3 w-3" />
                          {template.schedule}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="rounded-lg border border-[#374151] px-3 py-1.5 text-xs text-slate-300 hover:bg-[#374151] transition-colors">
                    Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Reports</h2>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between py-2 border-b border-[#374151] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/20 p-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">{report.name}</p>
                    <p className="text-xs text-slate-500">{report.date}</p>
                  </div>
                </div>
                <button className="text-[#ff6b35] hover:underline text-xs">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
