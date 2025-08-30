import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { useNavItems } from '@/hooks/useNavItems';
import { LoginIcon, MenuIcon, SearchIcon, UserAddIcon, XIcon } from '@/icons';
import { useCurrentUser } from '@/store/auth.store';
import { useSearchActions } from '@/store/search.store';

import NotificationBell from './NotificationBell';
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

const Header: React.FC = () => {
  const currentUser = useCurrentUser();
  const navItems = useNavItems();
  const { open: openSearch } = useSearchActions();

  const [isMenuOpen, setMenuOpen] = useState(false);

  // Lock body scroll for mobile menu
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const closeMenus = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b-2 border-black bg-white lg:hidden">
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
                  onClick={openSearch}
                  className="relative border-2 border-transparent p-2 transition-colors hover:border-black focus:border-black"
                  aria-label="Open search"
                >
                  <SearchIcon className="size-6" />
                </button>
                <NotificationBell />
                <UserMenu variant="compact" onLinkClick={closeMenus} />
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="-mr-2 p-2"
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                >
                  {isMenuOpen ? (
                    <XIcon className="size-6" />
                  ) : (
                    <MenuIcon className="size-6" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-outline btn-sm">
                  <LoginIcon className="size-4" />
                  <span>Log In</span>
                </Link>
                <Link to="/signup" className="btn-primary btn-sm">
                  <UserAddIcon className="size-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="absolute left-0 top-16 w-full border-b-2 border-black bg-white shadow-lg"
        >
          <nav className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => (
              <NavLinkStyled key={item.to} to={item.to} onClick={closeMenus}>
                {item.label}
              </NavLinkStyled>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
