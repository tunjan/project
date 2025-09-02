import React from 'react';

import { useTheme } from '@/hooks/useTheme';
import { MoonIcon, SunIcon } from '@/icons';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={toggleTheme}
      className={` ${sizeClasses[size]} relative flex items-center justify-center border-2 border-black bg-white text-black transition-all duration-200 hover:bg-black hover:text-white hover:shadow-brutal focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black ${className} `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative">
        <SunIcon
          className={` ${iconSizes[size]} transition-all duration-300 ${theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'} `}
        />
        <MoonIcon
          className={` ${iconSizes[size]} absolute inset-0 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'} `}
        />
      </div>

      {showLabel && (
        <span className="ml-2 text-sm font-bold">
          {theme === 'light' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
