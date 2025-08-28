import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser, useAuthActions } from '@/store/auth.store';
import { useUsersActions } from '@/store';
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
  const { updateProfile } = useUsersActions();

  if (!currentUser) return null;

  const handleLogout = () => {
    onLinkClick?.();
    logout();
    navigate('/login');
  };

  const handleAvatarChange = (newImageUrl: string) => {
    updateProfile(currentUser.id, { profilePictureUrl: newImageUrl });
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
            editable={true}
            onImageChange={handleAvatarChange}
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
        <div className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="whitespace-nowrap rounded-none bg-black px-2 py-1 text-xs text-white">
            Click avatar to upload
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black"></div>
        </div>
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
