import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import { can, Permission } from '@/config/permissions';
import { type ProtectedRole, OnboardingStatus } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: ProtectedRole;
  requireCoreAccess?: boolean;
  requireFullAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireCoreAccess,
  requireFullAccess,
}) => {
  const currentUser = useCurrentUser();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const canAccessCoreApp = ![
    OnboardingStatus.PENDING_APPLICATION_REVIEW,
    OnboardingStatus.DENIED,
    OnboardingStatus.INACTIVE,
  ].includes(currentUser.onboardingStatus);

  const isConfirmed =
    currentUser.onboardingStatus === OnboardingStatus.CONFIRMED;

  if (requireCoreAccess && !canAccessCoreApp) {
    return <Navigate to="/onboarding-status" replace />;
  }

  if (requireFullAccess && !isConfirmed) {
    return <Navigate to="/dashboard" replace />;
  }

  if (
    requiredRole === 'organizer' &&
    !can(currentUser, Permission.VIEW_MANAGEMENT_DASHBOARD)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
