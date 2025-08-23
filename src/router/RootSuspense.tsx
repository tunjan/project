import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';

const RootSuspense = () => (
  <Suspense
    fallback={
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    <Outlet />
  </Suspense>
);

export default RootSuspense;
