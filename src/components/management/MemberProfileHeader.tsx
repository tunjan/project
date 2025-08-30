import React from 'react';
import { User } from '@/types';
import Avatar from '@/components/ui/Avatar';

interface MemberProfileHeaderProps {
  user: User;
}

const MemberProfileHeader: React.FC<MemberProfileHeaderProps> = ({ user }) => {
  return (
    <div className="mb-8 border-2 border-black bg-white p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <Avatar
          src={user.profilePictureUrl}
          alt={user.name}
          className="h-24 w-24 flex-shrink-0 border-2 border-black object-cover"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-black">{user.name}</h1>
          <p className="text-lg text-neutral-600">{user.email}</p>
          <p className="text-sm text-neutral-500">
            {user.chapters?.join(', ')} Chapter
          </p>
          {user.instagram && (
            <p className="text-sm text-neutral-500">
              Instagram: @{user.instagram}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:items-end">
          <div className="text-right">
            <p className="text-sm font-bold text-neutral-500">Role</p>
            <p className="text-lg font-bold text-black">{user.role}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-neutral-500">Status</p>
            <p className="text-lg font-bold text-black">
              {user.onboardingStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileHeader;
