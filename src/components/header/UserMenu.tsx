import { LogOut } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthActions, useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';

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
        className="block p-1 transition-colors hover:opacity-80"
        aria-label="View your profile"
      >
        <Avatar className="size-10">
          <AvatarImage
            src={currentUser.profilePictureUrl}
            alt="User profile"
            className="object-cover"
          />
          <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
    );
  }

  // Expanded Variant for Sidebar
  return (
    <div className="shrink-0 space-y-4">
      <div className="group relative">
        <Link
          to={profileLink}
          onClick={onLinkClick}
          className="flex items-center space-x-3 rounded-md p-3 transition-colors hover:bg-accent"
        >
          <Avatar className="size-10">
            <AvatarImage
              src={currentUser.profilePictureUrl}
              alt="User profile"
              className="object-cover"
            />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </Link>
      </div>
      <Button
        onClick={handleLogout}
        variant="outline"
        className="flex w-full items-center justify-center space-x-2"
      >
        <LogOut className="size-4" />
        <span>Logout</span>
      </Button>
    </div>
  );
};

export default UserMenu;
