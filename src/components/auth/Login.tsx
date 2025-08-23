import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { type User } from '@/types';
import { hasOrganizerRole } from '@/utils/auth';
import Tag from '@/components/ui/Tag';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-md border-2 border-black bg-white p-8">
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
              className="flex w-full items-center space-x-4 border-2 border-black p-3 transition-colors duration-200 hover:bg-neutral-100"
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
                  <Tag variant="primary" size="sm">
                    ORGANIZER
                  </Tag>
                )}
                {user.onboardingStatus === 'Awaiting Verification' && (
                  <Tag variant="warning" size="sm">
                    PENDING VERIFICATION
                  </Tag>
                )}
              </div>
            </button>
          ))}
        </div>
        {/* NEW: Added a link to the sign-up page */}
        <p className="mt-8 text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
