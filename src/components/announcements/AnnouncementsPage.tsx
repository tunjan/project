import React from 'react';
import {
  type Announcement,
  Role,
  AnnouncementScope,
  type Chapter,
} from '@/types';
import { PlusIcon, MegaphoneIcon } from '@/icons';
import AnnouncementCard from './AnnouncementCard';
import { useCurrentUser } from '@/store/auth.store';
import { useChapters } from '@/store';
import { useAnnouncementsState as useAnnouncements } from '@/store/announcements.store';
import { can, Permission } from '@/config/permissions';

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
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:mb-12 md:flex-row">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
            Announcements
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-600">
            Stay up to date with the latest news and updates.
          </p>
        </div>
        {can(currentUser, Permission.CREATE_ANNOUNCEMENT) && (
          <button
            onClick={onCreate}
            className="flex flex-shrink-0 items-center bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Create Announcement
          </button>
        )}
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
        <div className="border-2 border-black bg-white p-8 text-center">
          <MegaphoneIcon className="mx-auto h-12 w-12 text-neutral-500" />
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
