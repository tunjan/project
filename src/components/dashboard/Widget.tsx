import React from 'react';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Widget: React.FC<WidgetProps> = ({ title, children, className }) => {
  return (
    <div className={`card-brutal flex h-full flex-col ${className}`}>
      <h2 className="h-card-brutal border-b-2 border-black px-4 py-2 font-bold">
        {title}
      </h2>
      <div className="flex-grow overflow-auto p-4">{children}</div>
    </div>
  );
};

export default Widget;
