import { LogIn, LogOut, Menu, Search, UserPlus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useNavItems } from '@/hooks/useNavItems';
import { useAuthActions, useCurrentUser } from '@/store/auth.store';
import { useSearchActions } from '@/store/search.store';

import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
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

const Header: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const navItems = useNavItems();
  const { open: openSearch } = useSearchActions();
  const { logout } = useAuthActions();

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

  const handleLogout = () => {
    closeMenus();
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 rounded-lg border-b-2 bg-background lg:hidden">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tighter text-foreground"
            onClick={closeMenus}
          >
            AV<span className="text-primary">.</span>
          </Link>

          <div className="flex items-center space-x-2">
            {currentUser ? (
              <>
                <Button
                  onClick={openSearch}
                  variant="ghost"
                  size="icon"
                  aria-label="Open search"
                >
                  <Search className="size-6" />
                </Button>
                <ThemeToggle size="sm" />
                <NotificationBell />
                <UserMenu variant="compact" onLinkClick={closeMenus} />
                <Button
                  onClick={() => setMenuOpen((v) => !v)}
                  variant="ghost"
                  size="icon"
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                >
                  {isMenuOpen ? (
                    <X className="size-6" />
                  ) : (
                    <Menu className="size-6" />
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">
                    <LogIn className="mr-2 size-4" />
                    Log In
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">
                    <UserPlus className="mr-2 size-4" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="absolute left-0 top-16 w-full rounded-lg border-b-2 bg-background shadow-lg"
        >
          <nav className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => (
              <NavLinkStyled key={item.to} to={item.to} onClick={closeMenus}>
                {item.label}
              </NavLinkStyled>
            ))}
            {currentUser && (
              <div className="mt-2 border-t-2 border-border pt-2">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-center"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
