import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-light shadow-kid-3d',
  secondary: 'bg-secondary text-white hover:bg-secondary-light shadow-kid-3d',
  accent: 'bg-accent text-gray-800 hover:bg-accent-light shadow-kid-3d',
  ghost: 'bg-transparent text-primary hover:bg-primary-container',
};

const sizeClasses = {
  md: 'h-touch px-kid-sm text-kid-base',
  lg: 'h-14 px-kid-md text-kid-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'font-heading font-bold rounded-kid-full transition-all duration-150 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed no-select',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
