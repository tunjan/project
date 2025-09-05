import React, { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

import Header from '@/components/header/Header';
import Sidebar from '@/components/header/Sidebar';
import CommandPalette from '@/components/search/CommandPalette';
import { useUsersActions } from '@/store';
import { useSearchActions } from '@/store/search.store';

const MainLayout: React.FC = () => {
  const { init } = useUsersActions();
  const { open } = useSearchActions();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize store when layout mounts - only run once
  useEffect(() => {
    init();
  }, []); // Empty dependency array since init should only run once

  // Add global keyboard shortcut for search
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
    },
    [open]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Sidebar />
      <Header />
      {/* 
        The Toaster is placed here. 
        'richColors' enables different styles for success/error/warning.
        'position' sets the default location on the screen.
        Only render with theme after mounting to prevent hydration issues
      */}
      {mounted && (
        <Toaster
          position="bottom-right"
          theme={theme as 'light' | 'dark' | 'system'}
        />
      )}
      <CommandPalette />
      <main className="flex-1 sm:px-6 lg:ml-64">
        <Outlet />
      </main>
      <footer className="bg-primary py-6 lg:ml-64">
        <div className="mx-auto text-center text-sm text-primary-foreground">
          <p>
            &copy; {new Date().getFullYear()} Anonymous for the Voiceless hub.
            Powered by respect for animals.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
