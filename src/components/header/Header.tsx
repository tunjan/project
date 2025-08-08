import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { hasOrganizerRole } from '@/utils/auth';
import {
  LoginIcon,
  UserAddIcon,
  MenuIcon,
  XIcon,
  LogoutIcon,
  BellIcon,
} from '@/icons';
import NotificationPopover from './NotificationPopover';
import { useCurrentUser, useAuthActions } from '@/store/auth.store';
import {
  useNotificationsForUser,
  useUnreadNotificationCount,
  useAppActions,
} from '@/store/appStore';
import { type Notification, OnboardingStatus } from '@/types';

const NavLinkStyled: React.FC<{
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `relative flex h-full items-center px-4 text-sm font-bold transition-colors duration-200 ${
        isActive
          ? 'text-black'
          : 'text-neutral-500 hover:text-black focus:text-black'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {children}
        {isActive && (
          <div className="absolute bottom-0 left-0 h-1 w-full bg-primary"></div>
        )}
      </>
    )}
  </NavLink>
);

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    requiresAuth: true,
    requiresConfirmed: true,
  },
  { to: '/cubes', label: 'Cubes', requiresAuth: true, requiresConfirmed: true },
  {
    to: '/chapters',
    label: 'Chapters',
    requiresAuth: true,
    requiresConfirmed: true,
  },
  {
    to: '/leaderboard',
    label: 'Leaderboard',
    requiresAuth: true,
    requiresConfirmed: true,
  },
  { to: '/announcements', label: 'Announcements', requiresAuth: true },
  { to: '/resources', label: 'Resources', requiresAuth: true },
  {
    to: '/outreach',
    label: 'Outreach',
    requiresAuth: true,
    requiresConfirmed: true,
  },
  { to: '/manage', label: 'Management', requiresOrganizer: true },
  { to: '/analytics', label: 'Analytics', requiresOrganizer: true },
  {
    to: '/onboarding-status',
    label: 'My Application',
    requiresAuth: true,
    requiresPending: true,
  },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { logout } = useAuthActions();
  const { markNotificationAsRead, markAllNotificationsAsRead } =
    useAppActions();

  const notifications = useNotificationsForUser(currentUser?.id);
  const unreadCount = useUnreadNotificationCount(currentUser?.id);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationRef]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
    setIsNotificationsOpen(false);
    setIsMobileMenuOpen(false);
    navigate(notification.linkTo);
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  const renderNavLinks = (isMobile = false) => {
    if (!currentUser) return null;
    const isConfirmed =
      currentUser.onboardingStatus === OnboardingStatus.CONFIRMED;

    return navItems
      .filter((item) => {
        if (!item.requiresAuth) return true;
        if (item.requiresOrganizer) return hasOrganizerRole(currentUser);
        if (item.requiresConfirmed) return isConfirmed;
        if (item.requiresPending) return !isConfirmed;
        return true;
      })
      .map((item) => (
        <NavLinkStyled
          key={item.to}
          to={item.to}
          onClick={isMobile ? closeMenus : undefined}
        >
          {item.label}
        </NavLinkStyled>
      ));
  };

  return (
    <header className="sticky top-0 z-20 border-b-2 border-black bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tighter text-black"
            onClick={closeMenus}
          >
            AV<span className="text-primary">.</span>
          </Link>

          {currentUser && (
            <nav className="hidden h-full items-center lg:flex">
              {renderNavLinks()}
            </nav>
          )}

          <div className="flex items-center space-x-2">
            {currentUser ? (
              <>
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationsOpen((p) => !p)}
                    className={`relative border-2 p-2 transition-colors ${
                      isNotificationsOpen
                        ? 'border-black bg-neutral-100'
                        : 'border-transparent hover:border-black focus:border-black'
                    }`}
                  >
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <div className="absolute right-1.5 top-1.5 h-2.5 w-2.5 border-2 border-white bg-primary"></div>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <NotificationPopover
                      notifications={notifications}
                      onNotificationClick={handleNotificationClick}
                      onMarkAllRead={() =>
                        markAllNotificationsAsRead(currentUser.id)
                      }
                      onClose={() => setIsNotificationsOpen(false)}
                    />
                  )}
                </div>

                <Link
                  to={
                    currentUser.onboardingStatus === OnboardingStatus.CONFIRMED
                      ? '/dashboard'
                      : '/onboarding-status'
                  }
                  className="hidden items-center space-x-2 border-2 border-transparent p-1 hover:border-black focus:border-black sm:flex"
                  onClick={closeMenus}
                >
                  <img
                    src={currentUser.profilePictureUrl}
                    alt="User profile"
                    className="h-10 w-10 border-2 border-black object-cover"
                  />
                </Link>

                <div className="hidden sm:block">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>

                <div className="lg:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen((p) => !p)}
                    className="-mr-2 p-2"
                  >
                    {isMobileMenuOpen ? (
                      <XIcon className="h-6 w-6" />
                    ) : (
                      <MenuIcon className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
                >
                  <LoginIcon className="h-4 w-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center space-x-2 border-2 border-primary bg-primary px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                >
                  <UserAddIcon className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && currentUser && (
        <div className="absolute left-0 top-16 w-full border-b-2 border-black bg-white shadow-lg lg:hidden">
          <nav className="space-y-1 px-2 pb-3 pt-2">
            {renderNavLinks(true)}
            <div className="my-2 border-t border-neutral-200 pt-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm font-semibold text-neutral-500 hover:text-neutral-900"
              >
                <LogoutIcon className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
