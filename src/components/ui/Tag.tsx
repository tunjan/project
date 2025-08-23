import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  primary: 'bg-primary text-white border-primary',
  secondary: 'bg-black text-white border-black',
  success: 'bg-success text-white border-success',
  warning: 'bg-warning text-white border-warning',
  danger: 'bg-danger text-white border-danger',
  info: 'bg-info text-white border-info',
  neutral: 'bg-neutral-100 text-neutral-900 border-black',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center border-2 font-bold uppercase tracking-wider ${variantStyles[variant]} ${sizeStyles[size]} ${className} `}
    >
      {children}
    </span>
  );
};

export default Tag;
