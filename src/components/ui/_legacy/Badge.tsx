import * as React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-accent-green/10 text-accent-green border border-accent-green/40',
  warning: 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/40',
  error: 'bg-accent-red/10 text-accent-red border border-accent-red/40',
  info: 'bg-accent-blue/10 text-accent-blue border border-accent-blue/40'
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'info', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';

