import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card p-4 shadow-sm hover:shadow-md transition-shadow duration-150',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';


