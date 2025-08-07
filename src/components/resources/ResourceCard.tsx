import React from "react";
import { type Resource } from "@/types";

interface ResourceCardProps {
  resource: Resource;
}

const MetaTag: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "bg-neutral-100 text-neutral-800",
}) => (
  <span
    className={`inline-block px-2 py-0.5 text-xs font-semibold ${className}`}
  >
    {text}
  </span>
);

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <div className="bg-white border border-black flex flex-col justify-between">
      <div className="p-5">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-shrink-0 bg-black p-2">
            <resource.icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-black leading-tight">
            {resource.title}
          </h3>
        </div>
        <p className="text-sm text-neutral-600 mb-4 h-20 overflow-hidden">
          {resource.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <MetaTag text={resource.type} />
          <MetaTag text={resource.skillLevel} />
          <MetaTag text={resource.language} />
        </div>
      </div>
      <div className="p-5 border-t border-black bg-neutral-50">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300"
        >
          View Resource
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
