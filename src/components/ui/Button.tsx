import React from 'react';

import { cn } from '@/utils/cn'; // Import the new utility

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'outline'
    | 'warning'
    | 'success'
    | 'info'
    | 'gray';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', className = '', children, ...props },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-bold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-hover',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      danger: 'bg-danger text-white hover:bg-danger-hover',
      outline:
        'border-2 border-black bg-white text-black hover:bg-black hover:text-white',
      warning: 'bg-warning text-black hover:bg-warning-hover',
      success: 'bg-success text-white hover:bg-success-hover',
      info: 'bg-info text-white hover:bg-info-hover',
      gray: 'bg-grey-200 text-black hover:bg-grey-300',
    };

    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    // REFACTOR: Use the cn utility for robust class merging
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
