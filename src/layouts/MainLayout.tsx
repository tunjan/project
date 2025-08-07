import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/header/Header";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="bg-black mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-white/70">
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
