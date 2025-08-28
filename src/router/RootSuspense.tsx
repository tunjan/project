import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import FeedbackButton from '@/components/FeedbackButton';

const RootSuspense = () => (
  <Suspense
    fallback={
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    <Outlet />
    <FeedbackButton />
  </Suspense>
);

export default RootSuspense;
