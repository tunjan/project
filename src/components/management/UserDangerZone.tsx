import React from 'react';
import { type User, OnboardingStatus } from '@/types';
import { ShieldCheckIcon } from '@/icons';

interface UserDangerZoneProps {
  user: User;
  canManuallyVerify: boolean;
  canDeleteUser: boolean;
  onManualVerify: () => void;
  onOpenDeleteModal: () => void;
}

const UserDangerZone: React.FC<UserDangerZoneProps> = ({
  user,
  canManuallyVerify,
  canDeleteUser,
  onManualVerify,
  onOpenDeleteModal,
}) => {
  return (
    <section>
      <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
        Danger Zone
      </h2>
      <div className="space-y-4 border-2 border-primary bg-white p-6">
        {user.onboardingStatus !== OnboardingStatus.CONFIRMED &&
          canManuallyVerify && (
            <div className="border-b border-primary pb-4">
              <h3 className="text-lg font-bold text-black">
                Bypass Onboarding Process
              </h3>
              <p className="mt-1 text-sm text-red">
                Skip all onboarding steps and immediately grant full activist permissions. Use only for trusted individuals.
              </p>
              <button
                onClick={onManualVerify}
                className="btn-warning mt-2 flex w-full items-center justify-center"
              >
                <ShieldCheckIcon className="mr-2 h-5 w-5" />
                Bypass Onboarding & Verify
              </button>
            </div>
          )}
        <div>
          <h3 className="text-lg font-bold text-black">Delete User</h3>
          <p className="mt-1 text-sm text-red">
            This action is permanent and cannot be undone.
          </p>
          <button
            onClick={onOpenDeleteModal}
            disabled={!canDeleteUser}
            className="btn-danger mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete User
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserDangerZone;
