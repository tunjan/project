import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';

const IndexRedirect = () => {
  const currentUser = useCurrentUser();
  return <Navigate to={currentUser ? '/dashboard' : '/login'} replace />;
};

export default IndexRedirect;
