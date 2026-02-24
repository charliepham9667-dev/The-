import { ListTodo, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyAssignedTasks } from '../../hooks/useDelegationTasks';
import type { TaskPriority } from '../../types';

const priorityConfig: Record<TaskPriority, { label: string; bg: string }> = {
  low: { label: 'Low', bg: 'bg-muted' },
  medium: { label: 'Medium', bg: 'bg-info/20' },
  high: { label: 'High', bg: 'bg-warning/20' },
  urgent: { label: 'Urgent', bg: 'bg-error/20' },
};

export function MyDelegatedTasks() {
  const { data: tasks, isLoading } = useMyAssignedTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Delegated Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tasks assigned to you by managers and owners
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !tasks?.length ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No tasks delegated to you</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const pri = priorityConfig[task.priority] || priorityConfig.medium;
            return (
              <div
                key={task.id}
                className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pri.bg} text-foreground`}>
                      {pri.label}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {task.assignedByProfile && (
                      <span>From {task.assignedByProfile.fullName}</span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  task.status === 'todo' ? 'bg-muted text-muted-foreground' :
                  task.status === 'in_progress' ? 'bg-info/20 text-info' :
                  task.status === 'blocked' ? 'bg-error/20 text-error' :
                  'bg-muted'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
