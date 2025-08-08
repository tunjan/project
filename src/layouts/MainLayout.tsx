import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/header/Header';
import { Toaster } from 'sonner';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      {/* 
        The Toaster is placed here. 
        'richColors' enables different styles for success/error/warning.
        'position' sets the default location on the screen.
      */}
      <Toaster richColors position="top-right" />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="mt-16 bg-neutral-900 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-neutral-400 sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} Vegan Action Hub. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
