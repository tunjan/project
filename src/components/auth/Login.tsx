import React from 'react';
import { type User } from '@/types';
import { hasOrganizerRole } from '@/utils/auth';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-md border border-black bg-white p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-black">Log In As</h1>
          <p className="mt-2 text-neutral-600">
            Select a user profile to simulate logging in.
          </p>
        </div>
        <div className="space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className="flex w-full items-center space-x-4 border border-black p-3 transition-colors duration-200 hover:bg-neutral-100"
            >
              <img
                src={user.profilePictureUrl}
                alt={user.name}
                className="h-12 w-12 object-cover"
              />
              <div className="flex-grow truncate text-left">
                <p className="font-bold text-black">{user.name}</p>
                <p className="text-sm text-neutral-500">{user.role}</p>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end space-y-1">
                {hasOrganizerRole(user) && (
                  <span className="bg-primary px-2 py-1 text-xs font-bold text-white">
                    ORGANIZER
                  </span>
                )}
                {user.onboardingStatus === 'Awaiting Verification' && (
                  <span className="whitespace-normal bg-yellow-400 px-2 py-1 text-right text-xs font-bold text-black">
                    PENDING VERIFICATION
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
