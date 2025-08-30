import React from 'react';
import { useNavigate } from 'react-router-dom';

import Login from '@/components/auth/Login';
import { useUsers } from '@/store';
import { useAuthActions } from '@/store/auth.store';
import { OnboardingStatus, Role, type User } from '@/types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthActions();
  const users = useUsers();

  const handleLogin = (user: User) => {
    login(user);
    if (user.onboardingStatus === OnboardingStatus.CONFIRMED) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding-status');
    }
  };

  const organizers = users.filter(
    (u) => u.role === Role.GLOBAL_ADMIN || u.role === Role.REGIONAL_ORGANISER
  );

  const loginableUsers = users.filter(
    (u) =>
      u.onboardingStatus === OnboardingStatus.CONFIRMED ||
      u.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE ||
      u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW ||
      u.onboardingStatus === OnboardingStatus.PENDING_ONBOARDING_CALL ||
      u.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS ||
      u.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL
  );

  return (
    <Login
      users={loginableUsers}
      onLogin={handleLogin}
      organizers={organizers}
    />
  );
};

export default LoginPage;
