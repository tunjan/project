import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // ADD THIS
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeProvider';
import { router } from './router';

// ADD THIS: Create a client
const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
