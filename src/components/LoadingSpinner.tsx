import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

// A custom SVG component for our thematic spinner
const PigSpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Head */}
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
    {/* Snout */}
    <path d="M12 14c-1.66 0-3-1.12-3-2.5S10.34 9 12 9s3 1.12 3 2.5-1.34 2.5-3 2.5z" />
    {/* Nostrils */}
    <path d="M11.25 11.5v.01M12.75 11.5v.01" />
    {/* Eyes */}
    <path d="M9.5 9.5v.01M14.5 9.5v.01" />
  </svg>
);

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <div role="status" aria-label="Loading">
      <PigSpinnerIcon
        className={`animate-spin ${sizeClasses[size]} ${className}`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

export const LoadingOverlay: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        {children && <p className="mt-4 text-gray-600">{children}</p>}
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
