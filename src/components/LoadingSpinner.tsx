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
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    fill="#FFF0F5"
    stroke="#F4B5D1"
    strokeWidth="3"
  >
    {/* Head */}
    <path d="M32 8 C17.64 8 8 17.64 8 32 C8 46.36 17.64 56 32 56 C46.36 56 56 46.36 56 32 C56 17.64 46.36 8 32 8 Z" />

    {/* Ears */}
    <path d="M20 16 C16 12 20 24 26 22" />
    <path d="M44 16 C48 12 44 24 38 22" />

    {/* Snout */}
    <ellipse cx="32" cy="38" rx="10" ry="7" />

    {/* Nostrils */}
    <path d="M29 38 L29 38" strokeLinecap="round" />
    <path d="M35 38 L35 38" strokeLinecap="round" />

    {/* Eyes */}
    <path d="M25 30 L25 30" strokeLinecap="round" />
    <path d="M39 30 L39 30" strokeLinecap="round" />
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
        {children && <p className="mt-4 text-red">{children}</p>}
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
