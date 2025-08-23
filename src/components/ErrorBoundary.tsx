import React, { Component, ReactNode } from 'react';

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

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-neutral-50">
            <div className="card-brutal card-padding text-center">
              <h1 className="mb-4 text-2xl font-bold text-black">
                Something went wrong
              </h1>
              <p className="mb-6 text-neutral-600">
                We're sorry, but something unexpected happened.
              </p>
              <button
                onClick={() =>
                  this.setState({ hasError: false, error: undefined })
                }
                className="btn-secondary"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
