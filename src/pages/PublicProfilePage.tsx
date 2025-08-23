import React from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '@/components/profile/UserProfile'; // Use the consolidated component
import { useUserById } from '@/store';
import LoadingSpinner from '@/components/LoadingSpinner';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const user = useUserById(userId);

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // The page now simply renders the consolidated UserProfile with the fetched user
  return <UserProfile user={user} />;
};

export default PublicProfilePage;
