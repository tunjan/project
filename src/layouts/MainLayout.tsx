import React, { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

import Header from '@/components/header/Header';
import { AppSidebar } from '@/components/AppSidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import CommandPalette from '@/components/search/CommandPalette';
import { useSearchActions } from '@/store/search.store';

const MainLayout: React.FC = () => {
  const { open } = useSearchActions();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Header />
        </header>

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

        <main className="flex flex-1 flex-col">
          <div className="flex-1 py-8 md:px-4">
            <Outlet />
          </div>
          <footer className="bg-primary py-6">
            <div className="mx-auto text-center text-sm text-primary-foreground">
              <p>
                &copy; {new Date().getFullYear()} Anonymous for the Voiceless
                hub. Powered by respect for animals.
              </p>
            </div>
          </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
