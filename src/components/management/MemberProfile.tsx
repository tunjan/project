import React, { useState } from 'react';
import { type User, OnboardingStatus, BadgeTemplate } from '@/types';
import { useCurrentUser, useChapters } from '@/store';
import { useUsersActions } from '@/store/users.store';
import { useAwardsActions } from '@/store/awards.store';
import { can, Permission } from '@/config/permissions';
import PromoteToOrganiserModal from './PromoteToOrganiserModal';
import EditChaptersModal from './EditChaptersModal';
import DeleteUserModal from './DeleteUserModal';
import OrganizerNotes from './OrganizerNotes';
import AwardBadgeModal from './AwardBadgeModal';
import MemberProfileHeader from './MemberProfileHeader';
import UserManagementPanel from './UserManagementPanel';
import UserDangerZone from './UserDangerZone';
import OnboardingActions from './OnboardingActions';
import UserStats from './UserStats';
import {
  ChevronLeftIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from '@/icons';

interface MemberProfileProps {
  user: User;
  onBack: () => void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ user, onBack }) => {
  const currentUser = useCurrentUser();
  const allChapters = useChapters();
  const {
    updateUserRole,
    updateUserChapters,
    deleteUser,
    setChapterOrganiser,
  } = useUsersActions();
  const { awardBadge } = useAwardsActions();

  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [editChaptersModalOpen, setEditChaptersModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [awardBadgeModalOpen, setAwardBadgeModalOpen] = useState(false);

  const handleConfirmOrganiserUpdate = (chaptersToOrganise: string[]) => {
    setChapterOrganiser(user.id, chaptersToOrganise);
    setPromoteModalOpen(false);
  };

  const handleSetChapterOrganiser = (
    userId: string,
    chapterName: string,
    isOrganiser: boolean
  ) => {
    if (isOrganiser) {
      // Add chapter to organiserOf array
      const currentOrganiserOf = user.organiserOf || [];
      if (!currentOrganiserOf.includes(chapterName)) {
        setChapterOrganiser(userId, [...currentOrganiserOf, chapterName]);
      }
    } else {
      // Remove chapter from organiserOf array
      const currentOrganiserOf = user.organiserOf || [];
      setChapterOrganiser(
        userId,
        currentOrganiserOf.filter((ch) => ch !== chapterName)
      );
    }
  };

  const handleConfirmChapterUpdate = (newChapters: string[]) => {
    updateUserChapters(user.id, newChapters);
    setEditChaptersModalOpen(false);
  };

  const handleConfirmDelete = () => {
    deleteUser(user.id);
    setDeleteModalOpen(false);
    onBack();
  };

  const handleAwardBadge = (badge: BadgeTemplate) => {
    if (!currentUser) return;
    awardBadge(currentUser, user, badge);
    setAwardBadgeModalOpen(false);
  };

  const handleSendMessage = () => {
    // Create a pre-filled email for the organizer to send
    const subject = encodeURIComponent(
      `Message from ${currentUser?.name} - Chapter Update`
    );
    const body = encodeURIComponent(
      `Hi ${user.name},\n\nI hope you're doing well! I wanted to reach out to you as your chapter organizer.\n\n[Your message here]\n\nBest regards,\n${currentUser?.name}\n\nP.S. We'd love to see you at our upcoming events!`
    );
    const mailtoLink = `mailto:${user.email || ''}?subject=${subject}&body=${body}`;

    // Open the user's default email client
    window.open(mailtoLink, '_blank');

    // Email client opened
  };

  const canManageRole = can(currentUser, Permission.EDIT_USER_ROLES, {
    targetUser: user,
    allChapters,
  });

  const canEditChapters = can(currentUser, Permission.EDIT_USER_CHAPTERS, {
    targetUser: user,
  });

  const canDeleteUser = can(currentUser, Permission.DELETE_USER, {
    targetUser: user,
    allChapters,
  });

  const canManuallyVerify = can(currentUser, Permission.VERIFY_USER, {
    targetUser: user,
  });

  const canAwardBadges = can(currentUser, Permission.AWARD_BADGE, {
    targetUser: user,
  });

  if (!currentUser) return null;

  return (
    <>
      {promoteModalOpen && (
        <PromoteToOrganiserModal
          userToManage={user}
          onClose={() => setPromoteModalOpen(false)}
          onConfirm={handleConfirmOrganiserUpdate}
        />
      )}
      {editChaptersModalOpen && (
        <EditChaptersModal
          user={user}
          allChapters={allChapters}
          onClose={() => setEditChaptersModalOpen(false)}
          onSave={handleConfirmChapterUpdate}
        />
      )}
      {deleteModalOpen && (
        <DeleteUserModal
          user={user}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {awardBadgeModalOpen && (
        <AwardBadgeModal
          userToAward={user}
          onClose={() => setAwardBadgeModalOpen(false)}
          onConfirm={handleAwardBadge}
        />
      )}
      <div className="animate-fade-in py-8 md:py-12">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center text-sm font-semibold text-primary transition hover:text-black"
        >
          <ChevronLeftIcon className="mr-1 h-5 w-5" /> Back to Member Directory
        </button>

        <MemberProfileHeader user={user} />

        {/* Onboarding Actions */}
        {canManageRole && <OnboardingActions user={user} />}

        {/* Onboarding Call Scheduled Info */}
        {(user.onboardingStatus === OnboardingStatus.PENDING_ONBOARDING_CALL ||
          user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL) &&
          user.onboardingProgress?.onboardingCallScheduledAt && (
            <section className="mb-8 border-2 border-black bg-white p-6">
              <h2 className="mb-4 text-2xl font-bold text-black">
                Onboarding Call Scheduled
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-neutral-500" />
                  <span className="font-semibold">
                    {new Date(
                      user.onboardingProgress.onboardingCallScheduledAt
                    ).toLocaleDateString(undefined, {
                      dateStyle: 'full',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-neutral-500" />
                  <span className="font-semibold">
                    {new Date(
                      user.onboardingProgress.onboardingCallScheduledAt
                    ).toLocaleTimeString(undefined, {
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ChatBubbleLeftRightIcon className="mt-0.5 h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="font-semibold">Provided Contact Info:</p>
                    <p className="rounded-md border-2 border-black bg-neutral-100 p-2 font-mono text-sm">
                      {user.onboardingProgress.onboardingCallContactInfo ||
                        'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* Revision Call Scheduled Info */}
        {user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL &&
          user.onboardingProgress?.revisionCallScheduledAt && (
            <section className="mb-8 border-2 border-black bg-white p-6">
              <h2 className="mb-4 text-2xl font-bold text-black">
                Revision Call Scheduled
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-neutral-500" />
                  <span className="font-semibold">
                    {new Date(
                      user.onboardingProgress.revisionCallScheduledAt
                    ).toLocaleDateString(undefined, {
                      dateStyle: 'full',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-neutral-500" />
                  <span className="font-semibold">
                    {new Date(
                      user.onboardingProgress.revisionCallScheduledAt
                    ).toLocaleTimeString(undefined, {
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ChatBubbleLeftRightIcon className="mt-0.5 h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="font-semibold">Provided Contact Info:</p>
                    <p className="rounded-md border-2 border-black bg-neutral-100 p-2 font-mono text-sm">
                      {user.onboardingProgress.revisionCallContactInfo ||
                        'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <UserStats user={user} />
            <OrganizerNotes user={user} />
          </div>
          <div className="space-y-8 lg:col-span-1">
            {canManageRole && (
              <UserManagementPanel
                user={user}
                currentUser={currentUser}
                canEditChapters={canEditChapters}
                canAwardBadges={canAwardBadges}
                onUpdateRole={updateUserRole}
                onSetChapterOrganiser={handleSetChapterOrganiser}
                onOpenPromoteModal={() => setPromoteModalOpen(true)}
                onOpenEditChaptersModal={() => setEditChaptersModalOpen(true)}
                onOpenAwardBadgeModal={() => setAwardBadgeModalOpen(true)}
                onSendMessage={handleSendMessage}
              />
            )}
            <UserDangerZone
              user={user}
              canManuallyVerify={canManuallyVerify}
              canDeleteUser={canDeleteUser}
              onOpenDeleteModal={() => setDeleteModalOpen(true)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberProfile;
