import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="py-16 text-center">
      <h1 className="text-4xl font-bold text-foreground">404 - Not Found</h1>
      <p className="mt-4 text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Go to Homepage</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
