import React from 'react';

import * as Icons from '@/icons'; // Import all icons
import { type Resource } from '@/types';

interface ResourceCardProps {
  resource: Resource;
}

const MetaTag: React.FC<{ text: string; className?: string }> = ({
  text,
  className = 'bg-white text-black',
}) => (
  <span
    className={`inline-block px-2 py-0.5 text-xs font-semibold ${className}`}
  >
    {text}
  </span>
);

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  // CRITICAL FIX: Add type safety for dynamic icon components
  const IconComponent = (() => {
    // Check if the icon exists in the Icons object
    if (resource.icon && resource.icon in Icons) {
      return Icons[resource.icon as keyof typeof Icons];
    }
    // Fallback to a default icon if the specified icon doesn't exist
    return Icons.BookOpenIcon;
  })();

  return (
    <div className="card-brutal-hover hover-raise flex flex-col justify-between border-2 border-black bg-white transition-transform">
      <div className="p-5">
        <div className="mb-3 flex items-center space-x-3">
          <div className="shrink-0 bg-black p-2">
            {/* Use the mapped component */}
            <IconComponent className="size-5 text-white" />
          </div>
          <h3 className="text-lg font-bold leading-tight text-black">
            {resource.title}
          </h3>
        </div>
        <p className="text-grey-500 mb-4 h-20 overflow-hidden text-sm">
          {resource.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <MetaTag text={resource.type} />
          <MetaTag text={resource.skillLevel} />
          <MetaTag text={resource.language} />
        </div>
      </div>
      <div className="border-t-2 border-black bg-white p-5">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-primary px-4 py-2 text-center font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
        >
          View Resource
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
