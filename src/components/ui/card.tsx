import { type HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('bg-surface rounded-kid-lg shadow-kid p-kid-sm', className)} {...props}>
      {children}
    </div>
  )
);
Card.displayName = 'Card';
