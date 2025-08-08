import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="py-16 text-center">
      <h1 className="text-4xl font-bold text-black">404 - Not Found</h1>
      <p className="mt-4 text-neutral-600">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
