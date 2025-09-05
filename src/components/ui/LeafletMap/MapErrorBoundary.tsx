import React, { Component, type ReactNode } from 'react';

import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card
            className="relative z-30 w-full overflow-hidden"
            style={{ height: '600px' }}
          >
            <div className="flex h-full items-center justify-center bg-muted/20">
              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-foreground">
                  Map temporarily unavailable
                </p>
                <p className="text-sm text-muted-foreground">
                  Please try refreshing the page
                </p>
              </div>
            </div>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
