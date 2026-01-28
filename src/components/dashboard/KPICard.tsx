import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconBgColor?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-[#ff6b35]',
  trend = 'up',
}: KPICardProps) {
  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          <p
            className={cn(
              'mt-1 text-sm',
              trend === 'up' && 'text-green-400',
              trend === 'down' && 'text-red-400',
              trend === 'neutral' && 'text-slate-400'
            )}
          >
            {subtitle}
          </p>
        </div>
        <div className={cn('rounded-lg p-2.5', iconBgColor)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
