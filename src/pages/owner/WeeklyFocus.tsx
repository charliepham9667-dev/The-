import { useState } from 'react';
import { Target, CheckCircle, Circle, Plus, TrendingUp, Users, DollarSign } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: string;
  category: 'revenue' | 'service' | 'team' | 'operations';
  isCompleted: boolean;
}

const weeklyGoals: Goal[] = [
  {
    id: '1',
    title: 'Hit 800M đ weekly revenue',
    description: 'Focus on upselling premium cocktails and bottle service',
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
    title: 'Complete staff training sessions',
    description: '3 bartenders need cocktail certification renewal',
    progress: 67,
    target: '3 sessions',
    category: 'team',
    isCompleted: false,
  },
  {
    id: '4',
    title: 'Reduce average wait time to 5 mins',
    description: 'Optimize bar workflow during peak hours',
    progress: 60,
    target: '5 mins',
    category: 'operations',
    isCompleted: false,
  },
];

const priorities = [
  { id: '1', text: 'VIP reservation Saturday - 20 pax private event', done: true },
  { id: '2', text: 'New cocktail menu launch Friday', done: false },
  { id: '3', text: 'Monthly inventory count Thursday', done: false },
  { id: '4', text: 'Team meeting Wednesday 3PM', done: true },
  { id: '5', text: 'DJ booking confirmation for weekend', done: false },
];

const categoryConfig = {
  revenue: { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  service: { icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  team: { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  operations: { icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/20' },
};

export function WeeklyFocus() {
  const [todos, setTodos] = useState(priorities);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedGoals = weeklyGoals.filter(g => g.isCompleted).length;
  const overallProgress = Math.round(weeklyGoals.reduce((sum, g) => sum + g.progress, 0) / weeklyGoals.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Weekly Focus</h1>
          <p className="text-sm text-slate-400 mt-1">Week of Jan 27 - Feb 2, 2026</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e55a2b] transition-colors">
          <Plus className="h-4 w-4" />
          Add Goal
        </button>
      </div>

      {/* Progress Overview */}
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Weekly Progress</h2>
          <span className="text-sm text-slate-400">{completedGoals}/{weeklyGoals.length} goals completed</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90 transform">
              <circle cx="40" cy="40" r="36" stroke="#374151" strokeWidth="6" fill="none" />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#ff6b35"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(overallProgress / 100) * 226} 226`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
              {overallProgress}%
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400 mb-2">Overall weekly goal completion</p>
            <div className="h-2 rounded-full bg-[#374151]">
              <div
                className="h-2 rounded-full bg-[#ff6b35] transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Goals */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Weekly Goals</h2>
          {weeklyGoals.map((goal) => {
            const config = categoryConfig[goal.category];
            const Icon = config.icon;
            return (
              <div
                key={goal.id}
                className={`rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 ${
                  goal.isCompleted ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-2 ${config.bg}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${goal.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {goal.title}
                      </p>
                      {goal.isCompleted && (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{goal.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-1.5 rounded-full bg-[#374151]">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              goal.isCompleted ? 'bg-emerald-500' : 'bg-[#ff6b35]'
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{goal.progress}%</span>
                      <span className="text-xs font-medium text-white">{goal.target}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Priority Tasks */}
        <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Priority Tasks</h2>
          <div className="space-y-3">
            {todos.map((todo) => (
              <button
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                className="flex items-start gap-3 w-full text-left group"
              >
                {todo.done ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-500 mt-0.5 shrink-0 group-hover:text-slate-400" />
                )}
                <span className={`text-sm ${todo.done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {todo.text}
                </span>
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 mt-4 text-sm text-[#ff6b35] hover:underline">
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </div>
      </div>
    </div>
  );
}
