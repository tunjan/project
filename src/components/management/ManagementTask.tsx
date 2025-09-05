import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
    high: 'border-l-4 border-destructive',
    medium: 'border-l-4 border-yellow-500',
    low: 'border-l-4 border-muted-foreground',
  };

  return (
    <Card
      className={`cursor-pointer transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:shadow-md ${priorityStyles[priority]}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${title}: ${description}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="text-2xl text-primary" aria-hidden="true">
            {icon}
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Badge variant="default">{count}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagementTask;
