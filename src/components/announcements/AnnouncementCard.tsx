import React from "react";
import { type Announcement, AnnouncementScope } from "@/types";

interface AnnouncementCardProps {
  announcement: Announcement;
}

const ScopeBadge: React.FC<{ scope: AnnouncementScope; target?: string }> = ({
  scope,
  target,
}) => {
  let bgColor = "bg-black";
  let textColor = "text-white";
  let text = scope.toUpperCase();

  switch (scope) {
    case AnnouncementScope.GLOBAL:
      bgColor = "bg-[#d81313]";
      break;
    case AnnouncementScope.REGIONAL:
      bgColor = "bg-black";
      text = target ? `${target.toUpperCase()} REGION` : text;
      break;
    case AnnouncementScope.CHAPTER:
      bgColor = "bg-neutral-200";
      textColor = "text-black";
      text = target ? `${target.toUpperCase()} CHAPTER` : text;
      break;
  }

  return (
    <span
      className={`px-2.5 py-1 text-xs font-bold tracking-wider ${bgColor} ${textColor}`}
    >
      {text}
    </span>
  );
};

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
}) => {
  const formattedDate = announcement.createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white border border-black overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <ScopeBadge
            scope={announcement.scope}
            target={announcement.country || announcement.chapter}
          />
          <p className="text-sm text-neutral-500">{formattedDate}</p>
        </div>

        <h3 className="text-2xl font-bold text-black">{announcement.title}</h3>
        <p className="mt-3 text-neutral-700 whitespace-pre-wrap">
          {announcement.content}
        </p>

        <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center">
          <img
            className="h-10 w-10 object-cover"
            src={announcement.author.profilePictureUrl}
            alt={announcement.author.name}
          />
          <div className="ml-3">
            <p className="text-sm font-semibold text-black">
              {announcement.author.name}
            </p>
            <p className="text-xs text-neutral-500">
              {announcement.author.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
