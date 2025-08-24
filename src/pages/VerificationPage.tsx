import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserById, useUsersActions } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { hasOrganizerRole } from '@/utils/auth';
import { OnboardingStatus } from '@/types';
import { toast } from 'sonner';

const VerificationPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const userToVerify = useUserById(userId);
  const { confirmUserIdentity } = useUsersActions();

  if (!currentUser || !hasOrganizerRole(currentUser)) {
    return (
      <div className="p-8 text-center">Access Denied: Organizers only.</div>
    );
  }

  if (!userToVerify) {
    return <div className="p-8 text-center">User not found.</div>;
  }

  if (
    userToVerify.onboardingStatus !== OnboardingStatus.AWAITING_VERIFICATION
  ) {
    return (
      <div className="p-8 text-center">
        This user does not require verification.
      </div>
    );
  }

  const handleConfirm = () => {
    confirmUserIdentity(userToVerify.id);
    toast.success(
      `${userToVerify.name} has been verified and now has full access.`
    );
    navigate('/manage');
  };

  return (
    <div className="py-16">
      <div className="mx-auto max-w-md border-2 border-black bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Confirm Identity</h1>
        <p className="my-4 text-neutral-600">
          You are about to grant full activist permissions to:
        </p>
        <div className="flex flex-col items-center space-y-2">
          <img
            src={userToVerify.profilePictureUrl}
            alt={userToVerify.name}
            className="h-24 w-24 object-cover"
          />
          <p className="text-xl font-bold">{userToVerify.name}</p>
          <p className="text-neutral-500">
            {userToVerify.chapters?.join(', ') || 'No chapters'} Chapter
          </p>
        </div>
        <button
          onClick={handleConfirm}
          className="mt-6 w-full bg-primary py-3 font-bold text-white hover:bg-primary-hover"
        >
          Confirm Identity & Issue ID
        </button>
      </div>
    </div>
  );
};

export default VerificationPage;
