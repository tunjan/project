import React from 'react';
import { type Resource } from '@/types';
import * as Icons from '@/icons'; // Import all icons

interface ResourceCardProps {
  resource: Resource;
}

const MetaTag: React.FC<{ text: string; className?: string }> = ({
  text,
  className = 'bg-neutral-100 text-neutral-800',
}) => (
  <span
    className={`inline-block px-2 py-0.5 text-xs font-semibold ${className}`}
  >
    {text}
  </span>
);

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const IconComponent =
    Icons[resource.icon as keyof typeof Icons] || Icons.BookOpenIcon; // Fallback to a default icon
  return (
    <div className="flex flex-col justify-between border border-black bg-white">
      <div className="p-5">
        <div className="mb-3 flex items-center space-x-3">
          <div className="flex-shrink-0 bg-black p-2">
            {/* Use the mapped component */}
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold leading-tight text-black">
            {resource.title}
          </h3>
        </div>
        <p className="mb-4 h-20 overflow-hidden text-sm text-neutral-600">
          {resource.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <MetaTag text={resource.type} />
          <MetaTag text={resource.skillLevel} />
          <MetaTag text={resource.language} />
        </div>
      </div>
      <div className="border-t border-black bg-neutral-50 p-5">
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
