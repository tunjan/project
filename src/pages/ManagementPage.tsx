import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/store/auth.store";
import { useUsers, useChapters, useDataActions } from "@/store/data.store";
import OnboardingQueue from "@/components/management/OnboardingQueue";
import MemberDirectory from "@/components/management/MemberDirectory";
import ChapterManagement from "@/components/management/ChapterManagement";
import SecurityDashboard from "@/components/management/SecurityDashboard";
import {
  ClipboardListIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
} from "@/icons";
import { type User, Role, OnboardingStatus } from "@/types";
import { ROLE_HIERARCHY } from "@/utils/auth";

type ManagementView = "onboarding" | "members" | "chapters" | "security";

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
      isActive
        ? "border-primary text-black"
        : "border-transparent text-neutral-500 hover:text-black"
    }`}
  >
    {children}
  </button>
);

const ManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const chapters = useChapters();
  const { updateUserStatus, createChapter } = useDataActions();
  const [view, setView] = useState<ManagementView>("onboarding");

  if (!currentUser) return null;

  const handleSelectUser = (user: User) =>
    navigate(`/manage/member/${user.id}`);

  const currentUserLevel = ROLE_HIERARCHY[currentUser.role];
  const pendingUsers = useMemo(
    () =>
      allUsers.filter((u) => u.onboardingStatus === OnboardingStatus.PENDING),
    [allUsers]
  );
  const visibleMembers = useMemo(
    () =>
      allUsers.filter(
        (user) =>
          (user.onboardingStatus === OnboardingStatus.CONFIRMED ||
            user.onboardingStatus === OnboardingStatus.AWAITING_VERIFICATION) &&
          user.id !== currentUser.id
      ),
    [allUsers, currentUser.id]
  );
  const canManageChapters =
    currentUserLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER];
  const canViewSecurity =
    currentUserLevel >= ROLE_HIERARCHY[Role.CHAPTER_ORGANISER];

  const handleApprove = (userId: string) => {
    updateUserStatus(
      userId,
      OnboardingStatus.AWAITING_VERIFICATION,
      currentUser
    );
  };

  const handleDeny = (userId: string) => {
    updateUserStatus(userId, OnboardingStatus.DENIED, currentUser);
  };

  return (
    <div className="py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
        Management
      </h1>
      <div className="border-b border-black flex items-center my-8 overflow-x-auto">
        <TabButton
          onClick={() => setView("onboarding")}
          isActive={view === "onboarding"}
        >
          <ClipboardListIcon className="w-5 h-5" />
          <span>Onboarding Queue</span>
          {pendingUsers.length > 0 && (
            <span className="ml-1 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingUsers.length}
            </span>
          )}
        </TabButton>
        <TabButton
          onClick={() => setView("members")}
          isActive={view === "members"}
        >
          <UserGroupIcon className="w-5 h-5" />
          <span>Member Directory</span>
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
        {canViewSecurity && (
          <TabButton
            onClick={() => setView("security")}
            isActive={view === "security"}
          >
            <ShieldCheckIcon className="w-5 h-5" />
            <span>Security</span>
          </TabButton>
        )}
      </div>
      <div>
        {view === "onboarding" && (
          <OnboardingQueue
            pendingUsers={pendingUsers}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        )}
        {view === "members" && (
          <MemberDirectory
            members={visibleMembers}
            onSelectUser={handleSelectUser}
            filterableChapters={chapters}
          />
        )}
        {view === "chapters" && canManageChapters && (
          <ChapterManagement
            chapters={chapters}
            currentUser={currentUser}
            onCreateChapter={createChapter}
          />
        )}
        {view === "security" && canViewSecurity && (
          <SecurityDashboard organizer={currentUser} />
        )}
      </div>
    </div>
  );
};

export default ManagementPage;
