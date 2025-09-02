import React from 'react';

interface StatProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  variant?: 'simple' | 'detailed';
  className?: string;
}

/**
 * A reusable Stat component for displaying statistics
 * Supports both simple (value + label) and detailed (icon + value + label) layouts
 */
export const Stat: React.FC<StatProps> = ({
  icon,
  label,
  value,
  variant = 'simple',
  className = '',
}) => {
  if (variant === 'detailed') {
    // Detailed layout with icon (used in ChapterCard)
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-neutral-500">{icon}</div>
        <div>
          <p className="font-mono text-lg font-bold">{value}</p>
          <p className="text-xs font-semibold uppercase text-neutral-500">
            {label}
          </p>
        </div>
      </div>
    );
  }

  // Simple layout without icon (used in ChapterList)
  return (
    <div className={`text-center ${className}`}>
      <p className="font-mono text-xl font-bold">{value}</p>
      <p className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </p>
    </div>
  );
};

export default Stat;
