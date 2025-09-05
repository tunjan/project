import '@testing-library/jest-dom';

import { vi } from 'vitest';

// Mock ResizeObserver for Headless UI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for components that might use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

vi.mock('lucide-react', async () => {
  const original = await vi.importActual('lucide-react');
  const customIcons = {
    Shield: ({ className }: { className?: string }) => (
      <svg
        data-testid="shield-icon"
        className={className || ''}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
    X: ({ className }: { className?: string }) => (
      <svg className={className} data-testid="x-icon">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    Camera: ({ className }: { className?: string }) => (
      <svg className={className} data-testid="camera-icon">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    UserPlus: ({ className }: { className?: string }) => (
      <svg className={className} data-testid="user-add-icon">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6m3-3h-6" />
      </svg>
    ),
    Home: ({ className }: { className?: string }) => (
      <svg className={className} data-testid="home-icon">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
    CheckCircle: ({ className }: { className?: string }) => (
      <svg className={className} data-testid="check-circle-icon">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
    Bell: ({ className }: { className?: string }) => (
      <svg className={className} data-testid="bell-icon">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    Sun: ({ className }: { className?: string }) => (
      <svg className={className} data-testid="sun-icon">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    Moon: ({ className }: { className?: string }) => (
      <svg className={className} data-testid="moon-icon">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  };

  return {
    ...original,
    ...customIcons,
  };
});
