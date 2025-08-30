import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import LoadingSpinner from '@/components/LoadingSpinner';
import UserProfile from '@/components/profile/UserProfile'; // Use the consolidated component
import { useUserById, useUsersActions, useUsersState } from '@/store';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const user = useUserById(userId);
  const allUsers = useUsersState();
  const { init, clearPersistedData } = useUsersActions();
  const [showResetButton, setShowResetButton] = useState(false);

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

  // Debug logging

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-grey-600 mt-4">Loading profile...</p>
          <p className="mt-2 text-sm text-white">
            User ID: {userId} | Total users: {allUsers.length}
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

  // The page now simply renders the consolidated UserProfile with the fetched user
  return <UserProfile user={user} />;
};

export default PublicProfilePage;
