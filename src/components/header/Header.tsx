import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import { useNavItems } from '@/hooks/useNavItems';
import useSearch from '@/hooks/useSearch';
import { LoginIcon, UserAddIcon, MenuIcon, XIcon, SearchIcon } from '@/icons';
import SearchResults from './SearchResults';
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

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const { users, chapters, events, loading } = useSearch(searchQuery);

  // Close search popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchRef]);

  // Lock body scroll for mobile menu
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const closeMenus = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
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
                  onClick={() => setSearchOpen((v) => !v)}
                  className={`relative border-2 p-2 transition-colors ${
                    isSearchOpen
                      ? 'border-black bg-white'
                      : 'border-transparent hover:border-black focus:border-black'
                  }`}
                  aria-label="Open search"
                >
                  <SearchIcon className="h-6 w-6" />
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
                    <XIcon className="h-6 w-6" />
                  ) : (
                    <MenuIcon className="h-6 w-6" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-outline btn-sm">
                  <LoginIcon className="h-4 w-4" />
                  <span>Log In</span>
                </Link>
                <Link to="/signup" className="btn-primary btn-sm">
                  <UserAddIcon className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div
          className="border-b-2 border-black bg-white p-4"
          ref={searchRef}
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-neutral-500" />
            </div>
            <input
              type="text"
              placeholder="Search users, chapters, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-none border-2 border-black bg-white py-2 pl-10 pr-4 text-sm font-bold text-black placeholder:font-normal focus:border-primary focus:outline-none"
              autoFocus
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
