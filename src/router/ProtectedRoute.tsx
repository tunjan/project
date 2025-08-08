import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import { hasOrganizerRole } from '@/utils/auth';
import { type ProtectedRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: ProtectedRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const currentUser = useCurrentUser();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'organizer' && !hasOrganizerRole(currentUser)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
