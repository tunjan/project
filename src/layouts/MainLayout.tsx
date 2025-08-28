import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/header/Header';
import Sidebar from '@/components/header/Sidebar';
import { Toaster } from 'sonner';
import { useUsersActions } from '@/store';
import CommandPalette from '@/components/search/CommandPalette';
import { useSearchActions } from '@/store/search.store';

const MainLayout: React.FC = () => {
  const { init } = useUsersActions();
  const { open } = useSearchActions();

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
    <div className="flex min-h-screen flex-col bg-white">
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
            background: 'white',
            border: '2px solid black',
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
            borderRadius: '0px',
            color: 'black',
            fontFamily: 'Libre Franklin, sans-serif',
            fontWeight: '600',
          },
        }}
        theme="light"
      />
      <CommandPalette />
      <main className="max-w-7xl flex-1 px-4 sm:px-6 lg:ml-64 lg:px-8">
        <Outlet />
      </main>
      <footer className="bg-black py-6 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-white sm:px-6 lg:px-8">
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
