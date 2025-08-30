import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import LoadingSpinner from '@/components/LoadingSpinner';
import MemberProfile from '@/components/management/MemberProfile';
import { useUsers, useUsersActions } from '@/store';

const MemberProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const users = useUsers();
  const { init, clearPersistedData } = useUsersActions();
  const [showResetButton, setShowResetButton] = useState(false);
  const user = users.find((u) => u.id === userId);

  // Initialize store when component mounts
  useEffect(() => {
    init();
  }, [init]);

  // Show reset button after 5 seconds if still loading
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setShowResetButton(true), 5000);
      return () => clearTimeout(timer);
    }
    setShowResetButton(false);
  }, [user]);

  const handleResetStore = () => {
    clearPersistedData();
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="py-16 text-center">
        <div className="mb-4">
          <LoadingSpinner size="lg" />
          <p className="text-grey-600 mt-4">Loading user profile...</p>
          <p className="mt-2 text-sm text-neutral-500">
            User ID: {userId} | Total users: {users.length}
          </p>

          {/* Add a button to reset store data if loading takes too long */}
          {showResetButton && (
            <button
              onClick={handleResetStore}
              className="bg-red mt-4 rounded px-4 py-2 text-sm text-white hover:bg-black"
            >
              Reset Store Data
            </button>
          )}
        </div>
      </div>
    );
  }

  return <MemberProfile user={user} onBack={() => navigate('/manage')} />;
};

export default MemberProfilePage;
