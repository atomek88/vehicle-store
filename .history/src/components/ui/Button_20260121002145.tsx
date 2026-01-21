import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus-visible:ring-blue-600':
              variant === 'primary',
            'border border-gray-300 bg-white text-gray-900 shadow-sm hover:bg-gray-50 hover:shadow-md focus-visible:ring-gray-500':
              variant === 'secondary',
            'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md focus-visible:ring-red-600':
              variant === 'danger',
            'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500':
              variant === 'ghost',
          },
          {
            'h-11 px-5 py-2.5 text-base': size === 'default',
            'h-9 px-4 py-2 text-sm': size === 'sm',
            'h-12 px-8 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
