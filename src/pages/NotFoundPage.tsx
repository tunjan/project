import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-black">404 - Not Found</h1>
      <p className="text-neutral-600 mt-4">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block bg-primary text-white font-bold py-2 px-4 hover:bg-primary-hover"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
