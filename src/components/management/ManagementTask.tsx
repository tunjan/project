import React from 'react';

interface ManagementTaskProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  description: string;
  onClick: () => void;
  priority: 'high' | 'medium' | 'low';
}

const ManagementTask: React.FC<ManagementTaskProps> = ({
  icon,
  title,
  count,
  description,
  onClick,
  priority,
}) => {
  const priorityStyles = {
    high: 'border-l-4 border-red bg-white',
    medium: 'border-l-4 border-gray-500 bg-white',
    low: 'border-l-4 border-black bg-white',
  };

  return (
    <button
      className={`card-brutal card-padding border-2 border-black py-4 ${priorityStyles[priority]} w-full cursor-pointer text-left hover:shadow-brutal-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${title}: ${description}`}
    >
      <div className="flex justify-between">
        <div className="flex items-center gap-4 px-4">
          <div className="text-2xl text-primary" aria-hidden="true">
            {icon}
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-bold text-black dark:text-white">
                {title}
              </h3>
              <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-white">
                {count}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ManagementTask;
