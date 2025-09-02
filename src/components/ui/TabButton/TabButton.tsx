import React from 'react';

interface TabButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  count?: number;
  variant?: 'default' | 'management' | 'analytics';
  className?: string;
}

/**
 * A reusable TabButton component for tab navigation
 * Supports optional count badge and different styling variants
 */
export const TabButton: React.FC<TabButtonProps> = ({
  onClick,
  isActive,
  children,
  count,
  variant = 'default',
  className = '',
}) => {
  const getVariantClasses = () => {
    // Base styles shared by all variants
    const baseClasses = 'text-sm font-bold transition-colors duration-200';

    // Variant-specific overrides
    switch (variant) {
      case 'management':
        return `${baseClasses} flex flex-1 items-center justify-center gap-2 border-b-4 px-2 py-3 md:flex-none md:justify-start md:border-b-0 md:border-l-4 md:px-4 md:py-3 ${
          isActive
            ? 'border-primary md:bg-white md:text-black'
            : 'border-transparent hover:border-neutral-300 md:border-transparent md:hover:border-black md:hover:bg-white'
        }`;
      case 'analytics':
        return `${baseClasses} -mb-px w-full border-b-4 px-4 py-3 uppercase tracking-wider ${
          isActive
            ? 'border-primary'
            : 'border-transparent hover:border-neutral-300'
        }`;
      default:
        return `${baseClasses} flex items-center space-x-2 px-4 py-2 font-semibold ${
          isActive
            ? 'text-black'
            : 'border-transparent text-white hover:text-black'
        }`;
    }
  };

  return (
    <button onClick={onClick} className={`${getVariantClasses()} ${className}`}>
      <span>{children}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-1 bg-primary px-2 py-0.5 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
};

export default TabButton;
