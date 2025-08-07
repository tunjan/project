import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useChapterByName,
  useUsers,
  useEvents,
  useAnnouncements,
} from "@/store/data.store";
import { type User, AnnouncementScope, Role } from "@/types";
import { getChapterStats } from "@/utils/analytics";
import {
  UsersIcon,
  ClockIcon,
  TrendingUpIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  InstagramIcon,
} from "@/icons";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import PastEventsModal from "@/components/chapters/PastEventsModal";

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
}> = ({ icon, title, value }) => (
  <div className="bg-white p-4 h-full border border-black">
    <div className="flex items-center">
      <div className="text-primary">{icon}</div>
      <p className="ml-3 text-sm font-semibold uppercase tracking-wider text-neutral-600">
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
  <div
    className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-neutral-100"
    onClick={() => onMemberClick(member)}
  >
    <img
      src={member.profilePictureUrl}
      alt={member.name}
      className="w-10 h-10 object-cover"
    />
    <div>
      <p className="font-bold text-black">{member.name}</p>
      <p className="text-sm text-neutral-500">{member.role}</p>
    </div>
  </div>
);

const ChapterDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { chapterName } = useParams<{ chapterName: string }>();

  const chapter = useChapterByName(chapterName);
  const allUsers = useUsers();
  const allEvents = useEvents();
  const allAnnouncements = useAnnouncements();
  const [isPastEventsModalOpen, setIsPastEventsModalOpen] = useState(false);

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

    const calculatedStats = getChapterStats(allUsers, allEvents, [chapter])[0];
    const members = allUsers.filter(
      (u) =>
        u.chapters.includes(chapter.name) && u.onboardingStatus === "Confirmed"
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
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const pastEvents = allEvents
      .filter(
        (event) =>
          event.city === chapter.name && new Date(event.dateTime) < new Date()
      )
      .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

    return {
      stats: calculatedStats,
      chapterOrganisers: organisers,
      regularMembers: regular,
      chapterAnnouncements: announcements,
      pastChapterEvents: pastEvents,
    };
  }, [chapter, allUsers, allEvents, allAnnouncements]);

  if (!chapter || !stats) {
    return <div className="text-center py-16">Chapter not found.</div>;
  }

  const handleMemberClick = useCallback(
    (member: User) => {
      navigate(`/manage/member/${member.id}`);
    },
    [navigate]
  );

  return (
    <>
      {isPastEventsModalOpen && (
        <PastEventsModal
          chapterName={chapter.name}
          events={pastChapterEvents}
          onClose={() => setIsPastEventsModalOpen(false)}
        />
      )}
      <div className="py-8 md:py-12 animate-fade-in">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/chapters")}
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-black transition"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Back to all chapters
          </button>
          {chapter.instagram && (
            <a
              href={`https://instagram.com/${chapter.instagram.replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-semibold text-neutral-600 hover:text-black transition"
            >
              <InstagramIcon className="w-5 h-5 mr-2" />
              {chapter.instagram}
            </a>
          )}
        </div>

        <div className="bg-white mb-16 mt-8">
          <p className="text-base font-semibold text-primary uppercase tracking-wide">
            {chapter.country}
          </p>
          <h1 className="mt-1 text-4xl md:text-5xl font-extrabold text-black">
            {chapter.name} Chapter
          </h1>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black border-b-2 border-primary pb-2 mb-4">
            Chapter Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<UsersIcon className="w-6 h-6" />}
              title="Members"
              value={stats.memberCount}
            />
            <div
              className="cursor-pointer"
              onClick={() => setIsPastEventsModalOpen(true)}
            >
              <StatCard
                icon={<BuildingOfficeIcon className="w-6 h-6" />}
                title="Events Held"
                value={stats.eventsHeld}
              />
            </div>
            <StatCard
              icon={<ClockIcon className="w-6 h-6" />}
              title="Total Hours"
              value={Math.round(stats.totalHours).toLocaleString()}
            />
            <StatCard
              icon={<TrendingUpIcon className="w-6 h-6" />}
              title="Total Conversions"
              value={stats.totalConversions.toLocaleString()}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-black mb-4">Organisers</h2>
              <div className="bg-white border border-black p-4">
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
                  <p className="text-sm text-neutral-500 p-2">
                    No organisers assigned.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-black mb-4">Members</h2>
              <div className="bg-white border border-black p-4 max-h-96 overflow-y-auto">
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
                  <p className="text-sm text-neutral-500 p-2">
                    No members yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-black mb-4">
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
              <div className="border border-black p-8 text-center bg-white">
                <h3 className="text-lg font-bold text-black">
                  No chapter-specific announcements.
                </h3>
                <p className="mt-1 text-neutral-500">
                  Check the main announcements page for global and regional
                  news.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterDetailPage;
