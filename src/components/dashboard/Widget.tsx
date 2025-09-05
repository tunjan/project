import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Widget: React.FC<WidgetProps> = ({ title, children, className }) => {
  return (
    <Card className={`flex h-full flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">{children}</CardContent>
    </Card>
  );
};

export default Widget;
