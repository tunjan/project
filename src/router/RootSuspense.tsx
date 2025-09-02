import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import FeedbackButton from '@/components/FeedbackButton';
import { LoadingSpinner } from '@/components/ui';

const RootSuspense = () => (
  <Suspense
    fallback={
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-white px-4">
        <LoadingSpinner size="lg" variant="primary" />
        <p className="text-center font-bold uppercase tracking-wider text-black">
          Loading Hub...
        </p>
      </div>
    }
  >
    <Outlet />
    <FeedbackButton />
  </Suspense>
);

export default RootSuspense;
