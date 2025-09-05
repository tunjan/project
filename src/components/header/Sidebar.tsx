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
      `relative flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:rounded-lg hover:border hover:bg-accent hover:text-accent-foreground'
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
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:rounded-lg lg:border-r-2 lg:bg-card">
      <div className="flex grow flex-col overflow-y-auto pb-4 pt-5">
        {/* Logo */}
        <div className="mb-8 flex shrink-0 items-center justify-center px-4">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tighter text-foreground"
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
          <div className="items-col flex justify-evenly py-4">
            <div className="flex w-full items-center justify-center">
              <NotificationBell />
            </div>
            <div className="flex w-full items-center justify-center">
              <ThemeToggle size="md" />
            </div>
          </div>

          <UserMenu variant="expanded" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
