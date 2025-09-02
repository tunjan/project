import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import { useNavItems } from '@/hooks/useNavItems';
import { useCurrentUser } from '@/store/auth.store';

import ThemeToggle from '../ui/ThemeToggle/ThemeToggle';
import NotificationBell from './NotificationBell';
import SidebarSearch from './SidebarSearch';
import UserMenu from './UserMenu';

const NavLinkStyled: React.FC<{
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `text-md rounded-nonenone relative flex h-12 items-center px-4 font-bold transition-colors duration-200 ${
        isActive
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'text-gray-500 hover:bg-white hover:text-black focus:text-black dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:text-white'
      }`
    }
  >
    {children}
  </NavLink>
);

const Sidebar: React.FC = () => {
  const currentUser = useCurrentUser();
  const navItems = useNavItems();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="hidden dark:border-white dark:bg-black lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r-2 lg:border-black lg:bg-white">
      <div className="flex grow flex-col overflow-y-auto pb-4 pt-5">
        {/* Logo */}
        <div className="mb-8 flex shrink-0 items-center justify-center px-4">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tighter text-black dark:text-white"
          >
            AV<span className="text-primary">.</span>
          </Link>
        </div>

        {/* Global Search */}
        <div className="mb-4 px-4">
          <SidebarSearch />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <NavLinkStyled key={item.to} to={item.to}>
              {item.label}
            </NavLinkStyled>
          ))}
        </nav>

        {/* Bottom section with notifications, theme toggle, and user */}
        <div className="shrink-0 space-y-4 px-4">
          <div className="flex w-full items-center justify-center">
            <NotificationBell />
          </div>
          <div className="flex w-full items-center justify-center">
            <ThemeToggle size="md" />
          </div>
          <UserMenu variant="expanded" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
