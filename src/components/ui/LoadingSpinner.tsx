import React from 'react';

import ModernLoader from '../ModernLoader';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'primary' | 'black' | 'white';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  variant = 'primary',
}) => {
  return (
    <div role="status" aria-label="Loading" className={className}>
      {/* Use ModernLoader as the primary spinner */}
      <ModernLoader size={size} variant={variant} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
