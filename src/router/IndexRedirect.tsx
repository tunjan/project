import { Navigate } from 'react-router-dom';

import LandingPage from '@/pages/LandingPage';
import { useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';

const IndexRedirect = () => {
  const currentUser = useCurrentUser();
  if (!currentUser) {
    return <LandingPage />;
  }

  if (currentUser.onboardingStatus !== OnboardingStatus.CONFIRMED) {
    return <Navigate to="/onboarding-status" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default IndexRedirect;
