import React from 'react';

import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <Card className="h-full">
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className="text-primary">{icon}</div>
        <p className="ml-3 truncate text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      </div>
      <p className="mt-2 text-4xl font-extrabold text-foreground">{value}</p>
    </CardContent>
  </Card>
);

export default StatCard;
