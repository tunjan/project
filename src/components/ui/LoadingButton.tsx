import React from 'react';

import LoadingSpinner from './LoadingSpinner';

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'black' | 'white';
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  className = '',
  onClick,
  disabled,
  variant = 'white',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative ${className} ${
        loading ? 'cursor-not-allowed opacity-75' : ''
      }`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" variant={variant} />
        </div>
      )}
      <span className={loading ? 'invisible' : 'visible'}>{children}</span>
    </button>
  );
};

export default LoadingButton;
