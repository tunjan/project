import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { hasOrganizerRole } from '@/utils/auth';
import { useNavItems } from '@/hooks/useNavItems';
import useSearch from '@/hooks/useSearch';
import {
  LoginIcon,
  UserAddIcon,
  MenuIcon,
  XIcon, // Add useEffect to the import list
  LogoutIcon,
  BellIcon,
  SearchIcon,
} from '@/icons';
import NotificationPopover from './NotificationPopover';
import SearchResults from './SearchResults';
import { useCurrentUser, useAuthActions } from '@/store/auth.store';
import {
  useNotificationsForUser,
  useUnreadNotificationCount,
  useNotificationsActions,
} from '@/store';
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
      `text-md relative flex h-full items-center p-2 font-bold transition-colors duration-200 ${
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

// Navigation items now managed by useNavItems hook

const Header: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { logout } = useAuthActions();
  const navItems = useNavItems();
  const { markNotificationAsRead, markAllNotificationsAsRead } =
    useNotificationsActions();

  const notifications = useNotificationsForUser(currentUser?.id);
  const unreadCount = useUnreadNotificationCount(currentUser?.id);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { users, chapters, events, loading } = useSearch(searchQuery);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

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
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const renderNavLinks = (isMobile = false) => {
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
    <header className="sticky top-0 z-20 border-b-2 border-black bg-white lg:hidden">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tighter text-black"
            onClick={closeMenus}
          >
            AV<span className="text-primary">.</span>
          </Link>

          <div className="flex items-center space-x-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => setIsSearchOpen((p) => !p)}
                  className={`relative border-2 p-2 transition-colors ${
                    isSearchOpen
                      ? 'border-black bg-neutral-100'
                      : 'border-transparent hover:border-black focus:border-black'
                  }`}
                >
                  <SearchIcon className="h-6 w-6" />
                </button>
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
                  className="flex items-center space-x-2 border-2 border-transparent p-1 hover:border-black focus:border-black"
                  onClick={closeMenus}
                >
                  <img
                    src={currentUser.profilePictureUrl}
                    alt="User profile"
                    className="h-10 w-10 border-2 border-black object-cover"
                  />
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
                >
                  <LogoutIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>

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

      {isSearchOpen && (
        <div className="border-b-2 border-black bg-white p-4" ref={searchRef}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search users, chapters, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-none border-2 border-black bg-white py-2 pl-10 pr-4 text-sm font-bold text-black placeholder-neutral-400 focus:border-primary focus:outline-none"
            />
            {searchQuery && (
              <SearchResults
                users={users}
                chapters={chapters}
                events={events}
                loading={loading}
                onClose={closeMenus}
              />
            )}
          </div>
        </div>
      )}

      {isMobileMenuOpen && currentUser && (
        <div className="shadow-brutal absolute left-0 top-16 w-full border-b-2 border-black bg-white lg:hidden">
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
