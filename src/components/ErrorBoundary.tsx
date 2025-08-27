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
          <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="card-brutal card-padding text-center">
              <h1 className="mb-4 text-2xl font-bold text-black">
                Something went wrong
              </h1>
              <p className="text-grey-600 mb-6">
                We're sorry, but something unexpected happened.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() =>
                    this.setState({ hasError: false, error: undefined })
                  }
                  className="btn-secondary w-full"
                >
                  Try again
                </button>
                <button
                  onClick={this.handleClearStoreData}
                  className="btn-secondary bg-red w-full text-white hover:bg-black"
                >
                  Clear Data & Reload
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
