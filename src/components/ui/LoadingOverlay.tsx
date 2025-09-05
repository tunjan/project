import { Loader2 } from 'lucide-react';
import React from 'react';

interface LoadingOverlayProps {
  children?: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ children }) => {
  return (
    <div
      className="absolute inset-0 z-50 flex min-h-screen w-full items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      role="alert"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="mb-4">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
        {children && (
          <p className="text-center text-sm font-medium text-foreground">
            {children}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
