import { ExternalLink } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { type Resource } from '@/types';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <div className="group h-full rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="mb-4">
          <h3 className="line-clamp-2 font-semibold leading-tight text-foreground">
            {resource.title}
          </h3>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {resource.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {resource.type}
            </div>
            <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              {resource.skillLevel}
            </div>
            <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
              {resource.language}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4">
          <Button asChild className="w-full" size="sm">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <span>View Resource</span>
              <ExternalLink className="size-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
