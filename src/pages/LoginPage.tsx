import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Login from '@/components/auth/Login';
import { useUsersStore } from '@/store';
import { useAuthActions } from '@/store/auth.store';
import { OnboardingStatus, type User } from '@/types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthActions();

  // Select the stable 'users' array from the store
  const allUsers = useUsersStore((state) => state.users);

  // Use useMemo to create a stable, cached version of the filtered array
  const loginableUsers = useMemo(
    () =>
      allUsers.filter(
        (u: User) =>
          u.onboardingStatus === OnboardingStatus.CONFIRMED ||
          u.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE ||
          u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW ||
          u.onboardingStatus === OnboardingStatus.PENDING_ONBOARDING_CALL ||
          u.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS ||
          u.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL
      ),
    [allUsers] // This dependency array ensures filtering only runs when 'allUsers' changes
  );

  const handleLogin = (user: User) => {
    login(user);
    if (user.onboardingStatus === OnboardingStatus.CONFIRMED) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding-status');
    }
  };

  return <Login users={loginableUsers} onLogin={handleLogin} />;
};

export default LoginPage;
