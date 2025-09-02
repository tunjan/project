import React from 'react';

import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  children?: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ children }) => {
  return (
    <div
      className="absolute inset-0 z-50 flex min-h-screen w-full items-center justify-center bg-white/90 px-4"
      role="alert"
      aria-live="polite"
      style={{
        backdropFilter: 'blur(2px)',
      }}
    >
      <div className="text-center">
        <div className="mb-4">
          <LoadingSpinner size="lg" variant="primary" />
        </div>
        {children && (
          <p className="text-center text-sm font-bold uppercase tracking-wider text-black">
            {children}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
