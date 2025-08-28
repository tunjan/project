import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import FeedbackButton from '@/components/FeedbackButton';

const RootSuspense = () => (
  <Suspense
    fallback={
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="font-bold text-neutral-600">Loading Hub...</p>
      </div>
    }
  >
    <Outlet />
    <FeedbackButton />
  </Suspense>
);

export default RootSuspense;
