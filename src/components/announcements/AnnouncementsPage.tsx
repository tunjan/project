import React from "react";
import {
  type View,
  type Announcement,
  Role,
  AnnouncementScope,
  Chapter,
} from "@/types";
import { PlusIcon, MegaphoneIcon } from "@/icons";
import AnnouncementCard from "./AnnouncementCard";
import { useCurrentUser } from "@/store/auth.store";
import { useAnnouncements, useChapters } from "@/store/data.store";
import { hasOrganizerRole } from "@/utils/auth";

interface AnnouncementsPageProps {
  onNavigate: (view: View) => void;
}

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  onNavigate,
}) => {
  const currentUser = useCurrentUser();
  const allAnnouncements = useAnnouncements();
  const chapters = useChapters();

  if (!currentUser) return null;

  const userCountries = [
    ...new Set(
      currentUser.chapters
        .map(
          (chName: string) =>
            chapters.find((c: Chapter) => c.name === chName)?.country
        )
        .filter((r): r is string => !!r)
    ),
  ];

  if (
    currentUser.role === Role.REGIONAL_ORGANISER &&
    currentUser.managedCountry &&
    !userCountries.includes(currentUser.managedCountry)
  ) {
    userCountries.push(currentUser.managedCountry);
  }

  const filteredAnnouncements = allAnnouncements
    .filter((a: Announcement) => {
      const highLevelRole = [Role.GLOBAL_ADMIN, Role.GODMODE].includes(
        currentUser.role
      );

      if (highLevelRole) return true;

      switch (a.scope) {
        case AnnouncementScope.GLOBAL:
          return true;
        case AnnouncementScope.REGIONAL:
          return a.country ? userCountries.includes(a.country) : false;
        case AnnouncementScope.CHAPTER:
          return a.chapter ? currentUser.chapters.includes(a.chapter) : false;
        default:
          return false;
      }
    })
    .sort(
      (a: Announcement, b: Announcement) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 md:mb-12 text-center flex flex-col items-center">
        <div className="w-full flex justify-center items-center relative">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
            Announcements
          </h1>
          {hasOrganizerRole(currentUser) && (
            <button
              onClick={() => onNavigate("createAnnouncement")}
              className="absolute right-0 flex items-center bg-primary text-white font-bold py-2 px-4 hover:bg-primary-hover transition-colors duration-300"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Announcement
            </button>
          )}
        </div>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-neutral-600">
          Stay up to date with the latest news and updates from your
          organization.
        </p>
      </div>

      {filteredAnnouncements.length > 0 ? (
        <div className="space-y-6">
          {filteredAnnouncements.map((announcement: Announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </div>
      ) : (
        <div className="border border-black p-8 text-center bg-white">
          <MegaphoneIcon className="w-12 h-12 mx-auto text-neutral-300" />
          <h3 className="text-xl font-bold text-black mt-4">
            No announcements yet.
          </h3>
          <p className="mt-2 text-neutral-500">Check back later for updates.</p>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
