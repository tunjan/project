import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser, useAuthActions } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { LogoutIcon } from '@/icons';

interface UserMenuProps {
  variant: 'compact' | 'expanded';
  onLinkClick?: () => void; // For closing mobile menu
}

const UserMenu: React.FC<UserMenuProps> = ({ variant, onLinkClick }) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { logout } = useAuthActions();

  if (!currentUser) return null;

  const handleLogout = () => {
    onLinkClick?.();
    logout();
    navigate('/login');
  };

  const profileLink =
    currentUser.onboardingStatus === OnboardingStatus.CONFIRMED
      ? `/members/${currentUser.id}`
      : '/onboarding-status';

  if (variant === 'compact') {
    return (
      <Link
        to={profileLink}
        onClick={onLinkClick}
        className="block border-2 border-transparent p-1 transition-colors hover:border-black focus:border-black"
        aria-label="View your profile"
      >
        <Avatar
          src={currentUser.profilePictureUrl}
          alt="User profile"
          className="h-10 w-10 border-2 border-black object-cover"
        />
      </Link>
    );
  }

  // Expanded Variant for Sidebar
  return (
    <div className="flex-shrink-0 space-y-4">
      <div className="group relative">
        <Link
          to={profileLink}
          onClick={onLinkClick}
          className="flex items-center space-x-3 rounded-none border-2 border-transparent p-3 transition-colors hover:border-black focus:border-black"
        >
          <Avatar
            src={currentUser.profilePictureUrl}
            alt="User profile"
            className="h-10 w-10 rounded-none border-2 border-black object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-black">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {currentUser.email}
            </p>
          </div>
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center space-x-2 rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
      >
        <LogoutIcon className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default UserMenu;
