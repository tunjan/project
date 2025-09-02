import React from 'react';

import { ExclamationTriangleIcon, TrashIcon } from '@/icons';
import { User } from '@/types';

interface UserDangerZoneProps {
  user: User;
  canManuallyVerify: boolean;
  canDeleteUser: boolean;
  onManualVerify?: () => void;
  onOpenDeleteModal: () => void;
}

const UserDangerZone: React.FC<UserDangerZoneProps> = ({
  canManuallyVerify,
  canDeleteUser,
  onManualVerify,
  onOpenDeleteModal,
}) => {
  return (
    <section>
      <h2 className="mb-4 border-b-2 border-danger pb-2 text-2xl font-bold text-black">
        Danger Zone
      </h2>
      <div className="">
        {/* Manual Verification */}
        {canManuallyVerify && onManualVerify && (
          <div className="border-warning bg-warning/10 p-4 md:border-2">
            <h3 className="text-warning-700 mb-2 flex items-center gap-2 text-lg font-bold">
              <ExclamationTriangleIcon className="size-5" />
              Manual Verification Override
            </h3>
            <p className="text-warning-700 mb-3 text-sm">
              This bypasses the entire onboarding process and immediately grants
              full activist permissions. Only use for trusted individuals who
              don't need standard verification steps.
            </p>
            <button
              onClick={onManualVerify}
              className="w-full bg-warning px-3 py-2 text-sm font-bold text-white hover:bg-warning/80"
            >
              Bypass & Verify User
            </button>
          </div>
        )}

        {/* Delete User */}
        {canDeleteUser && (
          <div className="border-danger bg-danger/10 p-4 md:border-2">
            <h3 className="text-danger-700 mb-2 flex items-center gap-2 text-lg font-bold">
              <TrashIcon className="size-5" />
              Delete User Account
            </h3>
            <p className="text-danger-700 mb-3 text-sm">
              This action permanently removes the user account and all
              associated data. This action cannot be undone.
            </p>
            <button
              onClick={onOpenDeleteModal}
              className="w-full bg-danger px-3 py-2 text-sm font-bold text-white hover:bg-danger/80"
            >
              Delete User Account
            </button>
          </div>
        )}

        {!canManuallyVerify && !canDeleteUser && (
          <p className="text-sm text-neutral-500">
            You don't have permission to perform dangerous actions on this user.
          </p>
        )}
      </div>
    </section>
  );
};

export default UserDangerZone;
