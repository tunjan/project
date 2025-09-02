import React from 'react';

import { can, Permission } from '@/config';
import { MegaphoneIcon, PlusIcon } from '@/icons';
import { useChapters } from '@/store';
import { useAnnouncementsState as useAnnouncements } from '@/store/announcements.store';
import { useCurrentUser } from '@/store/auth.store';
import {
  type Announcement,
  AnnouncementScope,
  type Chapter,
  Role,
} from '@/types';

import AnnouncementCard from './AnnouncementCard';

interface AnnouncementsPageProps {
  onCreate: () => void;
}

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onCreate }) => {
  const currentUser = useCurrentUser();
  const allAnnouncements = useAnnouncements();
  const chapters = useChapters();

  if (!currentUser) return null;

  const userCountries = [
    ...new Set(
      currentUser.chapters
        ?.map(
          (chName: string) =>
            chapters.find((c: Chapter) => c.name === chName)?.country
        )
        .filter((r): r is string => !!r) || []
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
          return a.chapter ? currentUser.chapters?.includes(a.chapter) : false;
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
      {/* Enhanced Header Section */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-2 bg-primary"></div>
            <h1 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              Announcements
            </h1>
            <div className="flex shrink-0 items-center gap-4">
              <MegaphoneIcon className="size-6 text-primary sm:size-12" />
            </div>
          </div>
          <p className="max-w-3xl px-4 text-base leading-relaxed text-neutral-600 sm:px-0 sm:text-xl">
            Stay up to date with the latest news, updates, and important
            information from your chapters and the global movement.
          </p>
        </div>
        {can(currentUser, Permission.CREATE_ANNOUNCEMENT) && (
          <button
            onClick={onCreate}
            className="flex w-full justify-center self-end bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover sm:w-fit"
          >
            <PlusIcon className="mr-2 size-5" />
            Create Announcement
          </button>
        )}
      </div>
      {filteredAnnouncements.length > 0 ? (
        <>
          {/* Mobile: Single column with dividers */}
          <div className="md:hidden">
            {filteredAnnouncements.map((announcement: Announcement, index) => (
              <div key={announcement.id}>
                <AnnouncementCard announcement={announcement} />
                {/* Add divider between cards, but not after the last one */}
                {index < filteredAnnouncements.length - 1 && (
                  <div className="border-b border-gray-300"></div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Original layout with spacing */}
          <div className="hidden space-y-6 md:block">
            {filteredAnnouncements.map((announcement: Announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="border-y border-neutral-200 px-0 py-4 text-center dark:border-gray-600 sm:border-black sm:bg-white sm:p-8 dark:sm:border-white dark:sm:bg-black sm:md:border-2">
          <MegaphoneIcon className="mx-auto size-12 text-neutral-500" />
          <h3 className="mt-4 text-xl font-bold text-black">
            No announcements yet.
          </h3>
          <p className="mt-2 text-neutral-600">Check back later for updates.</p>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
