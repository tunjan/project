import React from "react";
import { type User } from "@/types";
import { hasOrganizerRole } from "@/utils/auth";

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  return (
    <div className="py-8 md:py-16">
      <div className="max-w-md mx-auto bg-white border border-black p-8">
        <div className="text-center mb-8">
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
              className="w-full flex items-center space-x-4 p-3 border border-black hover:bg-neutral-100 transition-colors duration-200"
            >
              <img
                src={user.profilePictureUrl}
                alt={user.name}
                className="w-12 h-12 object-cover"
              />
              <div className="text-left flex-grow">
                <p className="font-bold text-black">{user.name}</p>
                <p className="text-sm text-neutral-500">{user.role}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end space-y-1">
                {hasOrganizerRole(user) && (
                  <span className="text-xs font-bold bg-primary text-white px-2 py-1">
                    ORGANIZER
                  </span>
                )}
                {user.onboardingStatus === "Awaiting Verification" && (
                  <span className="text-xs font-bold bg-yellow-400 text-black px-2 py-1">
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
