import React from 'react';

import Avatar from '@/components/ui/Avatar';
import { User } from '@/types';

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
          className="size-24 shrink-0 border-2 border-black object-cover"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-black">{user.name}</h1>
          <p className="text-lg text-neutral-600">{user.email}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-neutral-500">
              <span className="font-semibold">Chapters:</span>{' '}
              {user.chapters?.join(', ') || 'None'}
            </p>
            {user.organiserOf && user.organiserOf.length > 0 && (
              <p className="text-sm text-primary">
                <span className="font-semibold">Organizing:</span>{' '}
                {user.organiserOf.join(', ')}
              </p>
            )}
            {user.instagram && (
              <p className="text-sm text-neutral-500">
                <span className="font-semibold">Instagram:</span>{' '}
                <a
                  href={`https://instagram.com/${user.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover hover:underline"
                >
                  {user.instagram}
                </a>
              </p>
            )}
            {user.joinDate && (
              <p className="text-sm text-neutral-500">
                <span className="font-semibold">Member since:</span>{' '}
                {new Date(user.joinDate).toLocaleDateString()}
              </p>
            )}
            {user.lastLogin && (
              <p className="text-sm text-neutral-500">
                <span className="font-semibold">Last login:</span>{' '}
                {new Date(user.lastLogin).toLocaleDateString()}
              </p>
            )}
          </div>
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
