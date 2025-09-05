import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  clearStoreAndReload: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  clearStoreAndReload,
}) => {
  // This hook will now work correctly because ThemeProvider is an ancestor
  const { theme } = useTheme();

  useEffect(() => {
    // This ensures the correct class (e.g., 'dark') is on the html tag
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);

  return (
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
            We're sorry, but an unexpected error occurred.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={resetErrorBoundary}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
          <Button
            onClick={clearStoreAndReload}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="mr-2 size-4" />
            Clear Data & Reload
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 rounded-md bg-muted p-3">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
