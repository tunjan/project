import { Megaphone, Plus } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { can, Permission } from '@/config';
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
  const [filter, setFilter] = useState('all');

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

      if (highLevelRole) {
        if (filter === 'all') return true;
        if (filter === 'global') return a.scope === AnnouncementScope.GLOBAL;
        if (filter === 'regional')
          return a.scope === AnnouncementScope.REGIONAL;
        if (filter === 'chapter') return a.scope === AnnouncementScope.CHAPTER;
        return true;
      }

      switch (a.scope) {
        case AnnouncementScope.GLOBAL:
          return filter === 'all' || filter === 'global';
        case AnnouncementScope.REGIONAL:
          return (
            (filter === 'all' || filter === 'regional') &&
            (a.country ? userCountries.includes(a.country) : false)
          );
        case AnnouncementScope.CHAPTER:
          return (
            (filter === 'all' || filter === 'chapter') &&
            (a.chapter ? currentUser.chapters?.includes(a.chapter) : false)
          );
        default:
          return false;
      }
    })
    .sort(
      (a: Announcement, b: Announcement) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Announcements
              </h1>
              <p className="mt-2 text-muted-foreground">
                Stay up to date with the latest news and updates.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="chapter">Chapter</SelectItem>
                </SelectContent>
              </Select>
              {can(currentUser, Permission.CREATE_ANNOUNCEMENT) && (
                <Button onClick={onCreate} className="flex items-center gap-2">
                  <Plus className="size-4" />
                  Create
                </Button>
              )}
            </div>
          </div>
          <Separator />
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
          <Card>
            <CardContent className="p-8 text-center">
              <Megaphone className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                No announcements yet.
              </h3>
              <p className="mt-2 text-muted-foreground">
                Check back later for updates.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
