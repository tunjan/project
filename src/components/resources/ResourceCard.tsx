import { BookOpen, ExternalLink } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Resource } from '@/types';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <Card className="flex h-full flex-col transition-transform hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary">
            <BookOpen className="size-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-lg leading-tight">
            {resource.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="h-20 overflow-hidden text-sm text-muted-foreground">
          {resource.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{resource.type}</Badge>
          <Badge variant="outline">{resource.skillLevel}</Badge>
          <Badge variant="outline">{resource.language}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            View Resource
            <ExternalLink className="ml-2 size-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;
