import { clsx } from 'clsx';
import { type HTMLAttributes, forwardRef } from 'react';

export const Badge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement> & { variant?: 'star' | 'streak' | 'level' }>(
  ({ className, variant = 'star', children, ...props }, ref) => {
    const variants = {
      star: 'bg-accent text-gray-800',
      streak: 'bg-orange-400 text-white',
      level: 'bg-primary text-white',
    };
    return (
      <span
        ref={ref}
        className={clsx('inline-flex items-center gap-1 px-3 py-1 rounded-kid-full text-kid-sm font-heading font-bold no-select', variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
