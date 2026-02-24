import * as React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-orange text-white hover:bg-orange-500 disabled:bg-orange-800 disabled:text-orange-200',
  secondary:
    'bg-background-secondary text-slate-100 border border-border hover:bg-background-primary',
  ghost:
    'bg-transparent text-slate-200 hover:bg-background-secondary border border-transparent'
};

// Responsive size classes with mobile-first approach
// Mobile: touch-friendly minimum 44px height, tablet+: standard sizing
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs min-h-[40px] md:px-3 md:py-1.5 md:text-sm md:min-h-0',
  md: 'px-4 py-2.5 text-sm min-h-[44px] md:px-4 md:py-2 md:min-h-0',
  lg: 'px-5 py-3 text-base min-h-[48px] md:px-5 md:py-3 md:min-h-0'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

