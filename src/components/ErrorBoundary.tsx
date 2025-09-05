import React, { Component, ReactNode } from 'react';

import { useAuthStore } from '@/store'; // Import the auth store

import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo; // Add errorInfo to state
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
    // Log a structured object for better debugging
    console.error('ErrorBoundary caught an error:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      // Add more context
      location: window.location.href,
      currentUser: useAuthStore.getState().currentUser?.name || 'Not Logged In',
      timestamp: new Date().toISOString(),
    });

    // Store the errorInfo in state to display it
    this.setState({ errorInfo });
  }

  handleClearStoreData = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear store data:', e);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error!}
          resetErrorBoundary={() =>
            this.setState({
              hasError: false,
              error: undefined,
              errorInfo: undefined,
            })
          }
          clearStoreAndReload={this.handleClearStoreData}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
