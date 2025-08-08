import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '@/components/profile/UserProfile';
import { useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    } else if (currentUser.onboardingStatus !== OnboardingStatus.CONFIRMED) {
      navigate('/onboarding-status', { replace: true });
    }
  }, [currentUser, navigate]);

  if (
    !currentUser ||
    currentUser.onboardingStatus !== OnboardingStatus.CONFIRMED
  ) {
    return (
      <div className="py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <UserProfile user={currentUser} />;
};

export default DashboardPage;
