import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import React, { Component, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleClearStoreData = () => {
    try {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      // Reload the page
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear store data:', e);
      // Fallback to just reloading
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="size-6 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Something went wrong
                </CardTitle>
                <CardDescription>
                  We're sorry, but something unexpected happened. This might be
                  due to a temporary issue or corrupted data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() =>
                    this.setState({ hasError: false, error: undefined })
                  }
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Try again
                </Button>
                <Button
                  onClick={this.handleClearStoreData}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="mr-2 size-4" />
                  Clear Data & Reload
                </Button>
                {this.state.error && (
                  <details className="mt-4 rounded-md bg-muted p-3">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                      Error Details
                    </summary>
                    <pre className="mt-2 text-xs text-muted-foreground">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
