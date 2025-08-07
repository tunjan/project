import React, { useState, useMemo } from "react";
import { type User, Role, type Chapter, OnboardingStatus } from "../../types";
import OnboardingQueue from "./OnboardingQueue";
import MemberDirectory from "./MemberDirectory";
import SecurityDashboard from "./SecurityDashboard";
import ChapterManagement from "./ChapterManagement";
import {
  ClipboardListIcon,
  UserGroupIcon,
  ShieldExclamationIcon,
  BuildingOfficeIcon,
} from "../icons";
import { ROLE_HIERARCHY } from "../../utils/auth";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";

interface ManagementDashboardProps {
  onSelectUser: (user: User) => void;
}

type ManagementView = "members" | "onboarding" | "security" | "chapters";

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
      isActive
        ? "border-[#d81313] text-black"
        : "border-transparent text-neutral-500 hover:text-black"
    }`}
  >
    {children}
  </button>
);

const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  onSelectUser,
}) => {
  const { currentUser } = useAuth();
  const {
    users: allUsers,
    chapters,
    createChapter,
    updateUserStatus,
  } = useData();

  const [view, setView] = useState<ManagementView>("onboarding");

  if (!currentUser) return null;

  const currentUserLevel = ROLE_HIERARCHY[currentUser.role];
  const isGlobalAdmin = currentUserLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN];
  const isRegionalOrganiser = currentUser.role === Role.REGIONAL_ORGANISER;
  const isChapterOrganiser = currentUser.role === Role.CHAPTER_ORGANISER;

  const pendingUsers = useMemo(
    () =>
      allUsers.filter((u) => {
        if (u.onboardingStatus !== "Pending") return false;

        // Global admins can see everyone.
        if (isGlobalAdmin) return true;

        // Regional organisers see pending users from chapters within their managed country.
        if (isRegionalOrganiser && currentUser.managedCountry) {
          const countryChapters = chapters
            .filter((c) => c.country === currentUser.managedCountry)
            .map((c) => c.name);
          return u.chapters.some((applicantChapter) =>
            countryChapters.includes(applicantChapter)
          );
        }

        // Chapter organizers see pending users for the chapters they manage.
        if (isChapterOrganiser) {
          const managedChapters = currentUser.organiserOf || [];
          return u.chapters.some((applicantChapter) =>
            managedChapters.includes(applicantChapter)
          );
        }

        return false;
      }),
    [
      allUsers,
      currentUser,
      chapters,
      isGlobalAdmin,
      isRegionalOrganiser,
      isChapterOrganiser,
    ]
  );

  const visibleMembers = useMemo(
    () =>
      allUsers.filter((user) => {
        if (
          user.onboardingStatus !== "Confirmed" &&
          user.onboardingStatus !== "Awaiting Verification"
        )
          return false;

        if (user.id === currentUser.id) return false;

        // Global admins see everyone.
        if (isGlobalAdmin) return true;

        // Regional organisers see members from chapters within their managed country.
        if (isRegionalOrganiser && currentUser.managedCountry) {
          const countryChapters = chapters
            .filter((c) => c.country === currentUser.managedCountry)
            .map((c) => c.name);
          return user.chapters.some((memberChapter) =>
            countryChapters.includes(memberChapter)
          );
        }

        // A chapter organizer sees members who are in the chapters they manage.
        if (isChapterOrganiser) {
          const managedChapters = currentUser.organiserOf || [];
          return user.chapters.some((memberChapter) =>
            managedChapters.includes(memberChapter)
          );
        }

        return false;
      }),
    [
      allUsers,
      currentUser,
      chapters,
      isGlobalAdmin,
      isRegionalOrganiser,
      isChapterOrganiser,
    ]
  );

  const filterableChapters = useMemo(() => {
    if (currentUserLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) {
      return chapters;
    }
    if (currentUser.role === Role.CHAPTER_ORGANISER) {
      const managedChapterNames = currentUser.organiserOf || [];
      return chapters.filter((c) => managedChapterNames.includes(c.name));
    }
    return [];
  }, [currentUser, chapters, currentUserLevel]);

  const canManageChapters =
    currentUserLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER];

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
          Management
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-600">
          Oversee chapter operations, review new applicants, and manage members.
        </p>
      </div>

      <div className="border-b border-black flex items-center mb-8">
        <TabButton
          onClick={() => setView("members")}
          isActive={view === "members"}
        >
          <UserGroupIcon className="w-5 h-5" />
          <span>Member Directory</span>
        </TabButton>
        <TabButton
          onClick={() => setView("onboarding")}
          isActive={view === "onboarding"}
        >
          <ClipboardListIcon className="w-5 h-5" />
          <span>Onboarding Queue</span>
          {pendingUsers.length > 0 && (
            <span className="ml-1 bg-[#d81313] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingUsers.length}
            </span>
          )}
        </TabButton>
        <TabButton
          onClick={() => setView("security")}
          isActive={view === "security"}
        >
          <ShieldExclamationIcon className="w-5 h-5" />
          <span>Security</span>
        </TabButton>
        {canManageChapters && (
          <TabButton
            onClick={() => setView("chapters")}
            isActive={view === "chapters"}
          >
            <BuildingOfficeIcon className="w-5 h-5" />
            <span>Chapters</span>
          </TabButton>
        )}
      </div>

      <div>
        {view === "members" && (
          <MemberDirectory
            members={visibleMembers}
            onSelectUser={onSelectUser}
            filterableChapters={filterableChapters}
          />
        )}

        {view === "onboarding" && (
          <OnboardingQueue
            pendingUsers={pendingUsers}
            onApprove={(userId) =>
              updateUserStatus(userId, "Awaiting Verification")
            }
            onDeny={(userId) => updateUserStatus(userId, "Denied")}
          />
        )}
        {view === "security" && <SecurityDashboard organizer={currentUser} />}
        {view === "chapters" && canManageChapters && (
          <ChapterManagement
            chapters={chapters}
            currentUser={currentUser}
            onCreateChapter={createChapter}
          />
        )}
      </div>
    </div>
  );
};

export default ManagementDashboard;
