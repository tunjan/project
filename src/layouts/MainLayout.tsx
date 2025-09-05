import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

import Header from '@/components/header/Header';
import Sidebar from '@/components/header/Sidebar';
import CommandPalette from '@/components/search/CommandPalette';
import { useTheme } from '@/hooks/useTheme';
import { useUsersActions } from '@/store';
import { useSearchActions } from '@/store/search.store';

const MainLayout: React.FC = () => {
  const { init } = useUsersActions();
  const { open } = useSearchActions();
  const { theme = 'light' } = useTheme();

  // Initialize store when layout mounts
  useEffect(() => {
    init();
  }, [init]);

  // Add global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Sidebar />
      <Header />
      {/* 
        The Toaster is placed here. 
        'richColors' enables different styles for success/error/warning.
        'position' sets the default location on the screen.
      */}
      <Toaster
        position="bottom-right"
        theme={theme as 'light' | 'dark' | 'system'}
      />
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
