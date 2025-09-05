import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import FeedbackButton from '@/components/FeedbackButton';

const RootSuspense = () => (
  <Suspense
    fallback={
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4">
        <div className="flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
        <p className="text-center font-bold uppercase tracking-wider text-foreground">
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
