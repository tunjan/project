import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <div className="h-full border-black bg-white p-4 md:border-2">
    <div className="flex items-center">
      <div className="text-primary">{icon}</div>
      <p className="text-grey-600 ml-3 truncate text-sm font-semibold uppercase tracking-wider">
        {title}
      </p>
    </div>
    <p className="mt-2 text-4xl font-extrabold text-black">{value}</p>
  </div>
);

export default StatCard;
