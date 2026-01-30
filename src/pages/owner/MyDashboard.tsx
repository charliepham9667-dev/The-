import { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Users, 
  TrendingDown, 
  CheckCircle,
  Target,
  Circle,
  Plus,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  Calendar,
  Tag,
  GripVertical
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'staffing' | 'compliance' | 'performance' | 'inventory';
  title: string;
  description: string;
  timestamp: string;
  actionLabel?: string;
}

interface Bottleneck {
  id: string;
  area: string;
  issue: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: string;
  category: 'revenue' | 'service' | 'team' | 'operations';
  isCompleted: boolean;
}

interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  category: 'staffing' | 'finance' | 'operations' | 'marketing' | 'compliance';
  priority: 'high' | 'medium' | 'low';
}

type KanbanStatus = 'not_started' | 'in_progress' | 'pending' | 'follow_up' | 'done';

// ============================================================================
// MOCK DATA
// ============================================================================

const alerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    category: 'staffing',
    title: 'Server shortage for tonight',
    description: '1 server called in sick. PM shift is understaffed.',
    timestamp: '2 hours ago',
    actionLabel: 'Find Coverage',
  },
  {
    id: '2',
    type: 'warning',
    category: 'compliance',
    title: 'Liquor license expires in 14 days',
    description: 'Renewal application needs to be submitted.',
    timestamp: '1 day ago',
    actionLabel: 'Start Renewal',
  },
  {
    id: '3',
    type: 'warning',
    category: 'performance',
    title: 'Labor cost trending above target',
    description: 'Current week labor cost is at 32% vs 30% target.',
    timestamp: '3 hours ago',
    actionLabel: 'View Details',
  },
];

const bottlenecks: Bottleneck[] = [
  {
    id: '1',
    area: 'Bar Service',
    issue: 'Average wait time 8 mins (target: 5 mins)',
    impact: 'high',
    suggestion: 'Add 1 bartender during peak hours',
  },
  {
    id: '2',
    area: 'Kitchen',
    issue: 'Food order completion 22 mins (target: 15 mins)',
    impact: 'medium',
    suggestion: 'Review prep workflow',
  },
];

const weeklyGoals: Goal[] = [
  {
    id: '1',
    title: 'Hit 800M đ weekly revenue',
    description: 'Focus on upselling premium cocktails',
    progress: 85,
    target: '800M đ',
    category: 'revenue',
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Maintain 4.5+ star rating',
    description: 'Respond to all reviews within 24 hours',
    progress: 100,
    target: '4.5 stars',
    category: 'service',
    isCompleted: true,
  },
  {
    id: '3',
    title: 'Complete staff training',
    description: '3 bartenders need certification renewal',
    progress: 67,
    target: '3 sessions',
    category: 'team',
    isCompleted: false,
  },
];

const initialTasks: Record<KanbanStatus, KanbanTask[]> = {
  not_started: [
    { id: '1', title: 'Review Q1 budget allocations', deadline: '2026-02-05', category: 'finance', priority: 'high' },
    { id: '2', title: 'Update employee handbook', deadline: '2026-02-10', category: 'compliance', priority: 'medium' },
  ],
  in_progress: [
    { id: '3', title: 'New cocktail menu design', deadline: '2026-01-31', category: 'operations', priority: 'high' },
    { id: '4', title: 'Social media campaign planning', deadline: '2026-02-01', category: 'marketing', priority: 'medium' },
  ],
  pending: [
    { id: '5', title: 'Vendor contract negotiation', deadline: '2026-02-07', category: 'finance', priority: 'high', description: 'Waiting for supplier response' },
  ],
  follow_up: [
    { id: '6', title: 'Staff feedback collection', deadline: '2026-02-03', category: 'staffing', priority: 'low' },
    { id: '7', title: 'Equipment maintenance check', deadline: '2026-01-30', category: 'operations', priority: 'medium' },
  ],
  done: [
    { id: '8', title: 'Monthly inventory count', deadline: '2026-01-25', category: 'operations', priority: 'medium' },
    { id: '9', title: 'DJ booking confirmation', deadline: '2026-01-24', category: 'marketing', priority: 'low' },
  ],
};

// ============================================================================
// CONFIG
// ============================================================================

const typeConfig = {
  critical: { icon: AlertCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', iconColor: 'text-red-500', badge: 'bg-red-500' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', iconColor: 'text-yellow-500', badge: 'bg-yellow-500' },
  info: { icon: Clock, bg: 'bg-blue-500/10', border: 'border-blue-500/30', iconColor: 'text-blue-500', badge: 'bg-blue-500' },
};

const impactColors = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-emerald-400' };

const goalCategoryConfig = {
  revenue: { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  service: { icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  team: { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  operations: { icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/20' },
};

const kanbanColumns: { key: KanbanStatus; label: string; color: string }[] = [
  { key: 'not_started', label: 'Not Started', color: 'border-slate-500' },
  { key: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
  { key: 'pending', label: 'Pending', color: 'border-yellow-500' },
  { key: 'follow_up', label: 'Follow Up', color: 'border-purple-500' },
  { key: 'done', label: 'Done', color: 'border-emerald-500' },
];

const taskCategoryColors: Record<string, string> = {
  staffing: 'bg-purple-500/20 text-purple-400',
  finance: 'bg-emerald-500/20 text-emerald-400',
  operations: 'bg-orange-500/20 text-orange-400',
  marketing: 'bg-pink-500/20 text-pink-400',
  compliance: 'bg-blue-500/20 text-blue-400',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-slate-500/20 text-slate-400',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function MyDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState<{ task: KanbanTask; fromColumn: KanbanStatus } | null>(null);

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const completedGoals = weeklyGoals.filter(g => g.isCompleted).length;
  const overallProgress = Math.round(weeklyGoals.reduce((sum, g) => sum + g.progress, 0) / weeklyGoals.length);

  const handleDragStart = (task: KanbanTask, fromColumn: KanbanStatus) => {
    setDraggedTask({ task, fromColumn });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toColumn: KanbanStatus) => {
    if (!draggedTask) return;
    
    const { task, fromColumn } = draggedTask;
    if (fromColumn === toColumn) {
      setDraggedTask(null);
      return;
    }

    setTasks(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(t => t.id !== task.id),
      [toColumn]: [...prev[toColumn], task],
    }));
    setDraggedTask(null);
  };

  const formatDeadline = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Today', color: 'text-yellow-400' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-400' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-slate-400' };
    return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-slate-500' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Your tasks, alerts, and weekly focus</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e55a2b] transition-colors">
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-slate-400">Critical</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{criticalCount}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-slate-400">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{warningCount}</p>
        </div>
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-slate-400">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{tasks.in_progress.length}</p>
        </div>
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-slate-400">Bottlenecks</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{bottlenecks.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-500" />
            <span className="text-sm text-slate-400">Weekly Progress</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{overallProgress}%</p>
        </div>
      </div>

      {/* Main Grid: Alerts + Goals + Bottlenecks */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Alerts */}
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-5">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Active Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const config = typeConfig[alert.type];
              const Icon = config.icon;
              return (
                <div key={alert.id} className={`rounded-lg border p-3 ${config.bg} ${config.border}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 ${config.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{alert.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{alert.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                        {alert.actionLabel && (
                          <button className="text-[10px] font-medium text-[#ff6b35] hover:underline">
                            {alert.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Weekly Goals</h2>
            <span className="text-xs text-slate-400">{completedGoals}/{weeklyGoals.length}</span>
          </div>
          <div className="space-y-3">
            {weeklyGoals.map((goal) => {
              const config = goalCategoryConfig[goal.category];
              const Icon = config.icon;
              return (
                <div key={goal.id} className={`rounded-lg bg-[#0f1419] p-3 ${goal.isCompleted ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-1.5 ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${goal.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {goal.title}
                        </p>
                        {goal.isCompleted && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 rounded-full bg-[#374151]">
                          <div
                            className={`h-1 rounded-full ${goal.isCompleted ? 'bg-emerald-500' : 'bg-[#ff6b35]'}`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottlenecks */}
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-5">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Bottlenecks</h2>
          <div className="space-y-3">
            {bottlenecks.map((item) => (
              <div key={item.id} className="rounded-lg bg-[#0f1419] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{item.area}</span>
                  <span className={`text-[10px] font-medium uppercase ${impactColors[item.impact]}`}>
                    {item.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{item.issue}</p>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                  <span>{item.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Task Board</h2>
        <div className="grid grid-cols-5 gap-4 overflow-x-auto">
          {kanbanColumns.map((column) => (
            <div
              key={column.key}
              className={`rounded-xl border-t-2 ${column.color} border border-[#374151] bg-[#1a1f2e] min-h-[400px]`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.key)}
            >
              <div className="p-3 border-b border-[#374151]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{column.label}</span>
                  <span className="text-xs text-slate-400 bg-[#0f1419] px-2 py-0.5 rounded">
                    {tasks[column.key].length}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-2">
                {tasks[column.key].map((task) => {
                  const deadline = formatDeadline(task.deadline);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task, column.key)}
                      className="rounded-lg bg-[#0f1419] p-3 cursor-grab active:cursor-grabbing hover:bg-[#151922] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <GripVertical className="h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-white flex-1">{task.title}</p>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 mb-2 ml-6">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap ml-6">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${taskCategoryColors[task.category]}`}>
                          {task.category}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 ml-6">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span className={`text-[10px] ${deadline.color}`}>{deadline.text}</span>
                      </div>
                    </div>
                  );
                })}
                <button className="w-full rounded-lg border border-dashed border-[#374151] p-2 text-xs text-slate-500 hover:text-slate-400 hover:border-slate-400 transition-colors flex items-center justify-center gap-1">
                  <Plus className="h-3 w-3" />
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
