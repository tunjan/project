import { LogIn, Search, UserPlus } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { useCurrentUser } from '@/store/auth.store';
import { useSearchActions } from '@/store/search.store';

import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

const Header: React.FC = () => {
  const currentUser = useCurrentUser();
  const { open: openSearch } = useSearchActions();

  return (
    <div className="flex flex-1 items-center justify-between">
      {/* Search and tools on the right */}
      <div className="ml-auto flex items-center space-x-2">
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
            <UserMenu variant="compact" />
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
  );
};

export default Header;
