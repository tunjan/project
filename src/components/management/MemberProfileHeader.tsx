import React from 'react';
import { type User } from '@/types';
import { getUserRoleDisplay } from '@/utils/user';

interface MemberProfileHeaderProps {
  user: User;
}

const MemberProfileHeader: React.FC<MemberProfileHeaderProps> = ({ user }) => {
  return (
    <div className="mb-8 flex flex-col items-center space-y-4 border-2 border-black bg-white p-6 sm:flex-row sm:space-x-8 sm:space-y-0 md:p-8">
      <img
        src={user.profilePictureUrl}
        alt={user.name}
        className="h-24 w-24 border-2 border-black object-cover md:h-32 md:w-32"
      />
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-black md:text-4xl">
          {user.name}
        </h1>
        <p className="text-lg text-red">{getUserRoleDisplay(user)}</p>
      </div>
    </div>
  );
};

export default MemberProfileHeader;
