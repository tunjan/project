import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder that matches the expected structure
    return (
      <Button
        variant="outline"
        size="icon"
        className={className}
        aria-label="Toggle theme"
        disabled
      >
        <Monitor
          className={`h-${size === 'sm' ? '4' : size === 'md' ? '5' : '6'} w-${size === 'sm' ? '4' : size === 'md' ? '5' : '6'}`}
        />
        {showLabel && <span className="ml-2 text-sm font-bold">System</span>}
      </Button>
    );
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className={iconSizes[size]} />;
      case 'dark':
        return <Moon className={iconSizes[size]} />;
      default:
        return <Monitor className={iconSizes[size]} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={className}
          aria-label="Toggle theme"
        >
          {getIcon()}
          {showLabel && (
            <span className="ml-2 text-sm font-bold">
              {theme === 'light'
                ? 'Light'
                : theme === 'dark'
                  ? 'Dark'
                  : 'System'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
