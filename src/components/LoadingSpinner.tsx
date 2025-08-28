import React from 'react';
import MorphingFarmLoader from './MorphingFarmLoader';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <div role="status" aria-label="Loading" className={className}>
      {/* Use MorphingFarmLoader as the primary spinner */}
      <MorphingFarmLoader size={size} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

export const LoadingOverlay: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-white/80"
      role="alert"
      aria-live="polite"
    >
      <div className="text-center">
        <LoadingSpinner size="lg" />
        {children && (
          <p className="mt-4 text-sm font-semibold text-black">
            {children}
          </p>
        )}
      </div>
    </div>
  );
};

export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ loading, children, className = '', onClick, disabled }) => {
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
          <LoadingSpinner size="sm" className="text-white" />
        </div>
      )}
      <span className={loading ? 'invisible' : 'visible'}>{children}</span>
    </button>
  );
};
