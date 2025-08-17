import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { hasOrganizerRole } from '@/utils/auth';
import { LogoutIcon, BellIcon } from '@/icons';
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
      `text-md relative flex h-12 items-center rounded-none px-4 font-bold transition-colors duration-200 ${
        isActive
          ? 'border-2 border-black bg-neutral-100 text-black'
          : 'text-neutral-500 hover:bg-neutral-50 hover:text-black focus:text-black'
      }`
    }
  >
    {children}
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
  {
    to: '/manage',
    label: 'Management',
    requiresAuth: true,
    requiresOrganizer: true,
  },
  {
    to: '/analytics',
    label: 'Analytics',
    requiresAuth: true,
    requiresOrganizer: true,
  },
  {
    to: '/onboarding-status',
    label: 'My Application',
    requiresAuth: true,
    requiresPending: true,
  },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { logout } = useAuthActions();
  const { markNotificationAsRead, markAllNotificationsAsRead } =
    useAppActions();

  const notifications = useNotificationsForUser(currentUser?.id);
  const unreadCount = useUnreadNotificationCount(currentUser?.id);

  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
    navigate('/login');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
    setIsNotificationsOpen(false);
    navigate(notification.linkTo);
  };

  const renderNavLinks = () => {
    if (!currentUser) return null;
    const isConfirmed =
      currentUser.onboardingStatus === OnboardingStatus.CONFIRMED;

    return navItems
      .filter((item) => {
        if (!item.requiresAuth) {
          return true;
        }

        // Management/Analytics tabs require a confirmed organizer
        if (item.requiresOrganizer) {
          return hasOrganizerRole(currentUser) && isConfirmed;
        }
        if (item.requiresConfirmed) {
          return isConfirmed;
        }
        if (item.requiresPending) {
          return !isConfirmed;
        }

        // Default for items that only require authentication
        return true;
      })
      .map((item) => (
        <NavLinkStyled key={item.to} to={item.to}>
          {item.label}
        </NavLinkStyled>
      ));
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r-2 lg:border-black lg:bg-white">
      <div className="flex flex-grow flex-col overflow-y-auto pb-4 pt-5">
        {/* Logo */}
        <div className="mb-8 flex flex-shrink-0 items-center justify-center px-4">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tighter text-black"
          >
            AV<span className="text-primary">.</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4">{renderNavLinks()}</nav>

        {/* Bottom section with notifications and user */}
        <div className="flex-shrink-0 space-y-4 px-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationsOpen((p) => !p)}
              className={`relative flex w-full items-center justify-center rounded-none border-2 p-3 transition-colors ${
                isNotificationsOpen
                  ? 'border-black bg-neutral-100'
                  : 'border-transparent hover:border-black focus:border-black'
              }`}
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-none border-2 border-white bg-primary"></div>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-80">
                <NotificationPopover
                  notifications={notifications}
                  onNotificationClick={handleNotificationClick}
                  onMarkAllRead={() =>
                    markAllNotificationsAsRead(currentUser.id)
                  }
                  onClose={() => setIsNotificationsOpen(false)}
                />
              </div>
            )}
          </div>

          {/* User profile */}
          <Link
            to={
              currentUser.onboardingStatus === OnboardingStatus.CONFIRMED
                ? '/dashboard'
                : '/onboarding-status'
            }
            className="flex items-center space-x-3 rounded-none border-2 border-transparent p-3 transition-colors hover:border-black focus:border-black"
          >
            <img
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

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center space-x-2 rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
          >
            <LogoutIcon className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
