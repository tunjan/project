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
  const { theme } = useTheme();

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
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Sidebar />
      <Header />
      {/* 
        The Toaster is placed here. 
        'richColors' enables different styles for success/error/warning.
        'position' sets the default location on the screen.
      */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? 'black' : 'white',
            border: theme === 'dark' ? '2px solid white' : '2px solid black',
            boxShadow:
              theme === 'dark'
                ? '4px 4px 0px 0px rgba(255,255,255,1)'
                : '4px 4px 0px 0px rgba(0,0,0,1)',
            borderRadius: '0px',
            color: theme === 'dark' ? 'white' : 'black',
            fontFamily: 'Libre Franklin, sans-serif',
            fontWeight: '600',
          },
        }}
        theme={theme}
      />
      <CommandPalette />
      <main className="flex-1 sm:px-6 lg:ml-64">
        <Outlet />
      </main>
      <footer className="bg-black py-6 dark:bg-white lg:ml-64">
        <div className="mx-auto text-center text-sm text-white dark:text-black">
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
