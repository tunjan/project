import {
  Building2,
  ChevronLeft,
  Clock,
  Instagram,
  MessageCircle,
  Plus,
  Users,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import MemberCard from '@/components/chapters/MemberCard';
import PastEventsModal from '@/components/chapters/PastEventsModal';
import StatCard from '@/components/chapters/StatCard';
import InventoryDisplay from '@/components/charts/InventoryDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  useChapterByName,
  useChapterJoinRequests,
  useChaptersActions,
  useEvents,
  useOutreachLogs,
  useUsers,
} from '@/store';
import { useAnnouncementsState as useAnnouncements } from '@/store/announcements.store';
import { useCurrentUser } from '@/store/auth.store';
import { AnnouncementScope, Role, type User } from '@/types';
import { getChapterStats } from '@/utils';

const ChapterDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { chapterName } = useParams<{ chapterName: string }>();

  const currentUser = useCurrentUser();
  const { requestToJoinChapter } = useChaptersActions();
  const chapterJoinRequests = useChapterJoinRequests();

  const allChapters = useChapterByName(chapterName);
  const allUsers = useUsers();
  const allEvents = useEvents();
  const allAnnouncements = useAnnouncements();
  const allOutreachLogs = useOutreachLogs();
  const [isPastEventsModalOpen, setIsPastEventsModalOpen] = useState(false);

  const chapter = useMemo(() => {
    if (!chapterName || !allChapters.length) return undefined;
    return allChapters.find(
      (c) => c.name.toLowerCase() === chapterName.toLowerCase()
    );
  }, [allChapters, chapterName]);

  const isMember = useMemo(() => {
    if (!currentUser || !chapter) return false;
    return currentUser.chapters?.includes(chapter.name) || false;
  }, [currentUser, chapter]);

  const hasPendingRequest = useMemo(() => {
    if (!currentUser || !chapter) return false;
    return chapterJoinRequests.some(
      (req) =>
        req.user.id === currentUser.id &&
        req.chapterName === chapter.name &&
        req.status === 'Pending'
    );
  }, [currentUser, chapter, chapterJoinRequests]);

  const {
    stats,
    chapterOrganisers,
    regularMembers,
    chapterAnnouncements,
    pastChapterEvents,
  } = useMemo(() => {
    if (!chapter)
      return {
        stats: null,
        chapterOrganisers: [],
        regularMembers: [],
        chapterAnnouncements: [],
        pastChapterEvents: [],
      };

    const calculatedStats = getChapterStats(
      allUsers,
      allEvents,
      [chapter],
      allOutreachLogs
    )[0];
    const members = allUsers.filter(
      (u) =>
        u.chapters?.includes(chapter.name) && u.onboardingStatus === 'Confirmed'
    );
    const organisers = members.filter(
      (u) =>
        u.role === Role.CHAPTER_ORGANISER &&
        u.organiserOf?.includes(chapter.name)
    );
    const regular = members.filter(
      (u) => !organisers.some((org) => org.id === u.id)
    );
    const announcements = allAnnouncements
      .filter(
        (a) =>
          a.scope === AnnouncementScope.CHAPTER && a.chapter === chapter.name
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    const pastEvents = allEvents
      .filter(
        (event) => event.city === chapter.name && event.startDate < new Date()
      )
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

    return {
      stats: calculatedStats,
      chapterOrganisers: organisers,
      regularMembers: regular,
      chapterAnnouncements: announcements,
      pastChapterEvents: pastEvents,
    };
  }, [chapter, allUsers, allEvents, allAnnouncements, allOutreachLogs]);

  const handleMemberClick = useCallback(
    (member: User) => {
      navigate(`/members/${member.id}`);
    },
    [navigate]
  );

  const handleRequestJoin = () => {
    if (currentUser && chapter) {
      requestToJoinChapter(chapter.name, currentUser);
      toast.info('Request Sent', {
        description: `Your request to join ${chapter.name} has been sent to the chapter organizers.`,
      });
    }
  };

  if (!chapter || !stats) {
    return <div className="py-16 text-center">Chapter not found.</div>;
  }

  return (
    <>
      <PastEventsModal
        isOpen={isPastEventsModalOpen}
        chapterName={chapter.name}
        events={pastChapterEvents}
        onClose={() => setIsPastEventsModalOpen(false)}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row">
            <Button
              onClick={() => navigate('/chapters')}
              variant="ghost"
              className="inline-flex items-center"
            >
              <ChevronLeft className="mr-1 size-5" />
              Back to all chapters
            </Button>

            <div className="flex items-center space-x-4">
              {currentUser && !isMember && (
                <Button
                  onClick={handleRequestJoin}
                  disabled={hasPendingRequest}
                  className="inline-flex items-center"
                >
                  <Plus className="mr-2 size-4" />
                  {hasPendingRequest ? 'Request Pending' : 'Request to Join'}
                </Button>
              )}
            </div>
          </div>

          <div className="my-8">
            <p className="text-base font-semibold uppercase tracking-wide text-primary">
              {chapter.country}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {chapter.name} Chapter
            </h1>

            {chapter.instagram && (
              <a
                href={`https://instagram.com/${chapter.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center text-sm font-semibold text-muted-foreground transition hover:text-primary"
              >
                <Instagram className="mr-2 size-5" />
                {chapter.instagram}
              </a>
            )}
          </div>
          <Separator className="mb-8" />

          <section className="mb-12">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Chapter Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={<Users className="size-6" />}
                title="Members"
                value={stats.memberCount}
              />
              <button
                type="button"
                aria-label="View past events"
                className="transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => setIsPastEventsModalOpen(true)}
              >
                <StatCard
                  icon={<Building2 className="size-6" />}
                  title="Events Held"
                  value={stats.eventsHeld}
                />
              </button>
              <StatCard
                icon={<Clock className="size-6" />}
                title="Total Hours"
                value={Math.round(stats.totalHours).toLocaleString()}
              />
              <StatCard
                icon={<MessageCircle className="size-6" />}
                title="Total Conversations"
                value={stats.totalConversations.toLocaleString()}
              />
            </div>
          </section>

          <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Organisers
                </h2>
                <Card>
                  <CardContent className="p-4">
                    {chapterOrganisers.length > 0 ? (
                      <div className="space-y-2 divide-y divide-border">
                        {chapterOrganisers.map((m) => (
                          <MemberCard
                            key={m.id}
                            member={m}
                            onMemberClick={handleMemberClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="p-2 text-sm text-muted-foreground">
                        No organisers assigned.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Members
                </h2>
                <Card>
                  <CardContent className="max-h-96 overflow-y-auto p-4">
                    {regularMembers.length > 0 ? (
                      <div className="space-y-2 divide-y divide-border">
                        {regularMembers.map((m) => (
                          <MemberCard
                            key={m.id}
                            member={m}
                            onMemberClick={handleMemberClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="p-2 text-sm text-muted-foreground">
                        No members yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Chapter Announcements
              </h2>
              {chapterAnnouncements.length > 0 ? (
                <div className="space-y-6">
                  {chapterAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-foreground">
                      No chapter-specific announcements.
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Check the main announcements page for global and regional
                      news.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Chapter Inventory */}
              <div className="mt-8">
                <InventoryDisplay
                  chapterName={chapter.name}
                  showTitle={true}
                  compact={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterDetailPage;
