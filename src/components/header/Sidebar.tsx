import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useNavItems } from '@/hooks/useNavItems';
import NotificationBell from './NotificationBell';
import SidebarSearch from './SidebarSearch';
import UserMenu from './UserMenu';
import { useCurrentUser } from '@/store/auth.store';

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
          ? 'border-2 border-black bg-white text-black'
          : 'text-gray-500 hover:bg-white hover:text-black focus:text-black'
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

        {/* Global Search */}
        <div className="px-4 mb-4">
          <SidebarSearch />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4">
          {navItems.map((item) => (
            <NavLinkStyled key={item.to} to={item.to}>
              {item.label}
            </NavLinkStyled>
          ))}
        </nav>

        {/* Bottom section with notifications and user */}
        <div className="flex-shrink-0 space-y-4 px-4">
          <div className="flex w-full items-center justify-center">
            <NotificationBell />
          </div>
          <UserMenu variant="expanded" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
