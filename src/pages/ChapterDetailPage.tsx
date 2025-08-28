import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useChapterByName,
  useUsers,
  useEvents,
  useChaptersActions,
  useChapterJoinRequests,
  useOutreachLogs,
} from '@/store';
import { useAnnouncementsState as useAnnouncements } from '@/store/announcements.store';
import { useCurrentUser } from '@/store/auth.store';
import {
  type User,
  AnnouncementScope,
  Role,
} from '@/types';
import { getChapterStats } from '@/utils/analytics';
import {
  UsersIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  InstagramIcon,
  PlusIcon,
} from '@/icons';
import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import PastEventsModal from '@/components/chapters/PastEventsModal';
import InventoryDisplay from '@/components/charts/InventoryDisplay';
import { toast } from 'sonner';

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
}> = ({ icon, title, value }) => (
  <div className="h-full border-2 border-black bg-white p-4">
    <div className="flex items-center">
      <div className="text-primary">{icon}</div>
      <p className="text-grey-600 ml-3 truncate text-sm font-semibold uppercase tracking-wider">
        {title}
      </p>
    </div>
    <p className="mt-2 text-4xl font-extrabold text-black">{value}</p>
  </div>
);

const MemberCard: React.FC<{
  member: User;
  onMemberClick: (member: User) => void;
}> = ({ member, onMemberClick }) => (
  <button
    type="button"
    onClick={() => onMemberClick(member)}
    className="flex w-full items-center space-x-3 p-2 text-left transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black"
  >
    <img
      src={member.profilePictureUrl}
      alt={member.name}
      className="h-10 w-10 object-cover"
    />
    <div>
      <p className="font-bold text-black">{member.name}</p>
      <p className="text-sm text-neutral-500">{member.role}</p>
    </div>
  </button>
);

const ChapterDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { chapterName } = useParams<{ chapterName: string }>();

  const currentUser = useCurrentUser();
  const { requestToJoinChapter } = useChaptersActions();
  const chapterJoinRequests = useChapterJoinRequests();

  const chapter = useChapterByName(chapterName);
  const allUsers = useUsers();
  const allEvents = useEvents();
  const allAnnouncements = useAnnouncements();
  const allOutreachLogs = useOutreachLogs();
  const [isPastEventsModalOpen, setIsPastEventsModalOpen] = useState(false);

  // Removed Stage 0: next upcoming public event link

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
      {isPastEventsModalOpen && (
        <PastEventsModal
          chapterName={chapter.name}
          events={pastChapterEvents}
          onClose={() => setIsPastEventsModalOpen(false)}
        />
      )}
      <div className="animate-fade-in py-8 md:py-12">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row">
          <button
            onClick={() => navigate('/chapters')}
            className="inline-flex items-center text-sm font-semibold text-primary transition hover:text-black"
          >
            <ChevronLeftIcon className="mr-1 h-5 w-5" />
            Back to all chapters
          </button>

          <div className="flex items-center space-x-4">
            {currentUser && !isMember && (
              <button
                onClick={handleRequestJoin}
                disabled={hasPendingRequest}
                className="disabled:bg-red inline-flex items-center bg-primary px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:text-white"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {hasPendingRequest ? 'Request Pending' : 'Request to Join'}
              </button>
            )}
          </div>
        </div>

        <div className="mb-8 mt-8">
          <p className="text-base font-semibold uppercase tracking-wide text-primary">
            {chapter.country}
          </p>
          <h1 className="mt-1 text-4xl font-extrabold text-black md:text-5xl">
            {chapter.name} Chapter
          </h1>

          {chapter.instagram && (
            <a
              href={`https://instagram.com/${chapter.instagram.replace(
                '@',
                ''
              )}`} // CORRECTED: Use backticks ``
              target="_blank"
              rel="noopener noreferrer"
              className="text-grey-600 mt-6 inline-flex items-center text-sm font-semibold transition hover:text-black"
            >
              <InstagramIcon className="mr-2 h-5 w-5" />
              {chapter.instagram}
            </a>
          )}
        </div>

        <section className="mb-12">
          <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
            Chapter Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              icon={<UsersIcon className="h-6 w-6" />}
              title="Members"
              value={stats.memberCount}
            />
            <button
              type="button"
              aria-label="View past events"
              className="transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black"
              onClick={() => setIsPastEventsModalOpen(true)}
            >
              <StatCard
                icon={<BuildingOfficeIcon className="h-6 w-6" />}
                title="Events Held"
                value={stats.eventsHeld}
              />
            </button>
            <StatCard
              icon={<ClockIcon className="h-6 w-6" />}
              title="Total Hours"
              value={Math.round(stats.totalHours).toLocaleString()}
            />
            <StatCard
              icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
              title="Total Conversations"
              value={stats.totalConversations.toLocaleString()}
            />
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div>
              <h2 className="mb-4 text-xl font-bold text-black">Organisers</h2>
              <div className="border-2 border-black bg-white p-4">
                {chapterOrganisers.length > 0 ? (
                  <div className="space-y-2 divide-y divide-neutral-200">
                    {chapterOrganisers.map((m) => (
                      <MemberCard
                        key={m.id}
                        member={m}
                        onMemberClick={handleMemberClick}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="p-2 text-sm text-neutral-500">
                    No organisers assigned.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="mb-4 text-xl font-bold text-black">Members</h2>
              <div className="max-h-96 overflow-y-auto border-2 border-black bg-white p-4">
                {regularMembers.length > 0 ? (
                  <div className="space-y-2 divide-y divide-neutral-200">
                    {regularMembers.map((m) => (
                      <MemberCard
                        key={m.id}
                        member={m}
                        onMemberClick={handleMemberClick}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="p-2 text-sm text-neutral-500">
                    No members yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-black">
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
              <div className="border-2 border-black bg-white p-8 text-center">
                <h3 className="text-lg font-bold text-black">
                  No chapter-specific announcements.
                </h3>
                <p className="mt-1 text-neutral-500">
                  Check the main announcements page for global and regional
                  news.
                </p>
              </div>
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
    </>
  );
};

export default ChapterDetailPage;
