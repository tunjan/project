import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui';
import { useCurrentUser } from '@/store';
import { useUsersActions } from '@/store/users.store';
import { OnboardingStatus, type User } from '@/types';

interface OnboardingActionsProps {
  user: User;
}

const OnboardingActions: React.FC<OnboardingActionsProps> = ({ user }) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { updateUserStatus, confirmFirstCubeAttended, finalizeOnboarding } =
    useUsersActions();

  const handleApprove = () => {
    if (!currentUser) return;
    updateUserStatus(
      user.id,
      OnboardingStatus.PENDING_ONBOARDING_CALL,
      currentUser
    );
    toast.success(`${user.name} approved. Next: schedule onboarding call.`);
    navigate('/manage');
  };

  const handleDeny = () => {
    if (!currentUser) return;
    updateUserStatus(user.id, OnboardingStatus.DENIED, currentUser);
    toast.error(`${user.name} has been denied.`);
    navigate('/manage');
  };

  const handleOnboardingCallPassed = () => {
    if (!currentUser) return;
    updateUserStatus(
      user.id,
      OnboardingStatus.AWAITING_FIRST_CUBE,
      currentUser
    );
    toast.success(
      `${user.name} passed the onboarding call. Next: attend first Cube.`
    );
  };

  const handleConfirmFirstCube = () => {
    confirmFirstCubeAttended(user.id);
    toast.success(
      `${user.name}'s first cube attendance has been manually confirmed.`
    );
  };

  const handleManualVerify = () => {
    finalizeOnboarding(user.id);
    toast.success(`${user.name} has been confirmed and now has full access.`);
  };

  const handleRevisionCallPassed = () => {
    finalizeOnboarding(user.id);
    toast.success(`${user.name} passed the revision call and is now verified.`);
  };

  const renderOnboardingActions = () => {
    switch (user.onboardingStatus) {
      case OnboardingStatus.PENDING_APPLICATION_REVIEW:
        return (
          <div className="flex space-x-2">
            <Button onClick={handleApprove} variant="default">
              Approve Application
            </Button>
            <Button onClick={handleDeny} variant="destructive">
              Deny Application
            </Button>
          </div>
        );

      case OnboardingStatus.PENDING_ONBOARDING_CALL:
        return (
          <Button onClick={handleOnboardingCallPassed} variant="default">
            Onboarding Call Passed
          </Button>
        );

      case OnboardingStatus.AWAITING_FIRST_CUBE:
        return (
          <Button onClick={handleConfirmFirstCube} variant="default">
            Confirm First Cube Attendance
          </Button>
        );

      case OnboardingStatus.AWAITING_REVISION_CALL:
        return (
          <div className="flex space-x-2">
            <Button onClick={handleRevisionCallPassed} variant="default">
              Revision Call Passed
            </Button>
            <Button onClick={handleManualVerify} variant="secondary">
              Manual Verify
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (
    user.onboardingStatus === OnboardingStatus.CONFIRMED ||
    user.onboardingStatus === OnboardingStatus.COMPLETED
  ) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold">Onboarding Actions</h3>
      {renderOnboardingActions()}
    </div>
  );
};

export default OnboardingActions;
