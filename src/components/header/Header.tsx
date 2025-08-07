import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { hasOrganizerRole } from "@/utils/auth";
import {
  LoginIcon,
  UserAddIcon,
  MenuIcon,
  XIcon,
  LogoutIcon,
  BellIcon,
} from "@/icons";
import NotificationPopover from "./NotificationPopover";
import { useCurrentUser, useAuthActions } from "@/store/auth.store";
import {
  useNotificationsForUser,
  useUnreadNotificationCount,
  useNotificationActions,
} from "@/store/notification.store";
import { type Notification } from "@/types";

const NavLinkStyled: React.FC<{
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center space-x-2 px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
        isActive
          ? "text-black border-b-2 border-[#d81313]"
          : "text-neutral-500 hover:text-black border-b-2 border-transparent"
      }`
    }
  >
    {children}
  </NavLink>
);

const Header: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { logout } = useAuthActions();

  const notifications = currentUser
    ? useNotificationsForUser(currentUser.id)
    : [];
  const unreadCount = currentUser
    ? useUnreadNotificationCount(currentUser.id)
    : 0;
  const { markAsRead, markAllAsRead } = useNotificationActions();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsNotificationsOpen(false);
    setIsMobileMenuOpen(false);
    navigate(notification.linkTo);
  };

  return (
    <header className="bg-white sticky top-0 z-20 border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-black tracking-tighter"
          >
            AV
          </Link>

          {currentUser && (
            <nav className="hidden lg:flex items-center space-x-1">
              <NavLinkStyled to="/dashboard">Dashboard</NavLinkStyled>
              <NavLinkStyled to="/cubes">Cubes</NavLinkStyled>
              <NavLinkStyled to="/chapters">Chapters</NavLinkStyled>
              <NavLinkStyled to="/announcements">Announcements</NavLinkStyled>
              <NavLinkStyled to="/resources">Resources</NavLinkStyled>
              {hasOrganizerRole(currentUser) && (
                <>
                  <NavLinkStyled to="/manage">Management</NavLinkStyled>
                  <NavLinkStyled to="/analytics">Analytics</NavLinkStyled>
                </>
              )}
            </nav>
          )}

          <div className="flex items-center space-x-2">
            {currentUser ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen((p) => !p)}
                    className="relative p-2 hover:bg-neutral-100"
                  >
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d81313] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d81313]"></span>
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <NotificationPopover
                      notifications={notifications}
                      onNotificationClick={handleNotificationClick}
                      onMarkAllRead={() => markAllAsRead(currentUser.id)}
                      onClose={() => setIsNotificationsOpen(false)}
                    />
                  )}
                </div>

                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center space-x-2 p-1 -m-1 hover:bg-neutral-100"
                >
                  <img
                    src={currentUser.profilePictureUrl}
                    alt="User profile"
                    className="h-10 w-10 object-cover border border-neutral-300"
                  />
                </Link>

                <div className="hidden sm:block">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold border border-black bg-white text-black hover:bg-neutral-100"
                  >
                    <LogoutIcon className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>

                <div className="lg:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen((p) => !p)}
                    className="p-2 -mr-2"
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
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold border border-black bg-white text-black hover:bg-neutral-100"
                >
                  <LoginIcon className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold border border-black bg-[#d81313] text-white hover:bg-[#b81010]"
                >
                  <UserAddIcon className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && currentUser && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-t border-black">
          <nav className="pt-2 pb-3 space-y-1 px-2">
            <NavLinkStyled
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </NavLinkStyled>
            <NavLinkStyled
              to="/cubes"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cubes
            </NavLinkStyled>
            <NavLinkStyled
              to="/chapters"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Chapters
            </NavLinkStyled>
            {hasOrganizerRole(currentUser) && (
              <NavLinkStyled
                to="/manage"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Management
              </NavLinkStyled>
            )}
            <div className="border-t border-neutral-200 my-2 pt-2">
              <button
                onClick={handleLogout}
                className="flex w-full text-left items-center space-x-2 px-3 py-2 text-sm font-semibold text-neutral-500 hover:text-black"
              >
                <LogoutIcon className="w-4 h-4" />
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
