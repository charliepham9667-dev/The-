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
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-5 min-h-[100px] md:min-h-[120px]">
      <div className="flex items-start justify-between h-full">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-1 md:mt-2 text-xl md:text-3xl font-bold text-white truncate">{value}</p>
          <p
            className={cn(
              'mt-0.5 md:mt-1 text-xs md:text-sm truncate',
              trend === 'up' && 'text-green-400',
              trend === 'down' && 'text-red-400',
              trend === 'neutral' && 'text-slate-400'
            )}
          >
            {subtitle}
          </p>
        </div>
        <div className={cn('rounded-lg p-2 md:p-2.5 flex-shrink-0', iconBgColor)}>
          <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
