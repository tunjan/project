import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User, OnboardingStatus, BadgeTemplate } from '@/types';
import { useCurrentUser, useChapters } from '@/store';
import { useUsersActions } from '@/store/users.store';
import { useAwardsActions } from '@/store/awards.store';
import { can, Permission } from '@/config/permissions';
import StatsGrid from '@/components/dashboard/StatsGrid';
import BadgeList from '@/components/dashboard/BadgeList';
import DiscountTierProgress from '@/components/dashboard/DiscountTierProgress';
import PromoteToOrganiserModal from './PromoteToOrganiserModal';
import EditChaptersModal from './EditChaptersModal';
import DeleteUserModal from './DeleteUserModal';
import OrganizerNotes from './OrganizerNotes';
import AwardBadgeModal from './AwardBadgeModal';
// --- NEW COMPONENT IMPORTS ---
import MemberProfileHeader from './MemberProfileHeader';
import UserManagementPanel from './UserManagementPanel';
import UserDangerZone from './UserDangerZone';
import {
  ChevronLeftIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from '@/icons';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface MemberProfileProps {
  user: User;
  onBack: () => void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ user, onBack }) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allChapters = useChapters();
  const {
    updateUserRole,
    updateUserChapters,
    deleteUser,
    updateUserStatus,
    finalizeOnboarding,
    setChapterOrganiser,
    confirmFirstCubeAttended,
  } = useUsersActions();
  const { awardBadge } = useAwardsActions();

  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [editChaptersModalOpen, setEditChaptersModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [awardBadgeModalOpen, setAwardBadgeModalOpen] = useState(false);
  const [manualVerifyModalOpen, setManualVerifyModalOpen] = useState(false);

  const handleApprove = () => {
    if (!currentUser) return;
    updateUserStatus(
      user.id,
      OnboardingStatus.PENDING_ONBOARDING_CALL,
      currentUser
    );
    toast.success(`${user.name} approved. Next: schedule onboarding call.`);
    navigate('/manage');
  };

  const handleDeny = () => {
    if (!currentUser) return;
    updateUserStatus(user.id, OnboardingStatus.DENIED, currentUser);
    toast.error(`${user.name} has been denied.`);
    navigate('/manage');
  };

  const handleOnboardingCallPassed = () => {
    if (!currentUser) return;
    updateUserStatus(
      user.id,
      OnboardingStatus.AWAITING_FIRST_CUBE,
      currentUser
    );
    toast.success(
      `${user.name} passed the onboarding call. Next: attend first Cube.`
    );
  };

  const handleConfirmFirstCube = () => {
    confirmFirstCubeAttended(user.id);
    toast.success(
      `${user.name}'s first cube attendance has been manually confirmed.`
    );
  };

  const handleManualVerify = () => {
    finalizeOnboarding(user.id);
    toast.success(`${user.name} has been confirmed and now has full access.`);
  };

  const handleRevisionCallPassed = () => {
    finalizeOnboarding(user.id);
    toast.success(`${user.name} passed the revision call and is now verified.`);
  };

  const handleConfirmOrganiserUpdate = (chaptersToOrganise: string[]) => {
    setChapterOrganiser(user.id, chaptersToOrganise);
    setPromoteModalOpen(false);
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
    toast.success(`Recognition "${badge.name}" sent to ${user.name}.`);
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

    // Show a toast for feedback
    toast.success('Email client opened with pre-filled message');
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

        {user.onboardingStatus ===
          OnboardingStatus.PENDING_APPLICATION_REVIEW &&
          user.onboardingAnswers && (
            <section className="border-warning mb-8 border-2 bg-white p-6">
              <h2 className="mb-4 text-2xl font-bold text-black">
                Applicant Review
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase text-neutral-500">
                    Why did you go vegan?
                  </p>
                  <p className="text-sm text-black">
                    {user.onboardingAnswers.veganReason}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-neutral-500">
                    Are you aligned with our abolitionist values?
                  </p>
                  <p className="text-sm text-black">
                    {user.onboardingAnswers.abolitionistAlignment
                      ? 'Yes'
                      : 'No / Unsure'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-neutral-500">
                    How can you contribute?
                  </p>
                  <p className="text-sm text-black">
                    {user.onboardingAnswers.customAnswer}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex space-x-4 border-t border-neutral-200 pt-4">
                <button
                  onClick={handleDeny}
                  className="w-full bg-black px-4 py-3 font-bold text-white hover:bg-black"
                >
                  Deny
                </button>
                <button
                  onClick={handleApprove}
                  className="w-full bg-primary px-4 py-3 font-bold text-white hover:bg-primary-hover"
                >
                  Approve Application
                </button>
              </div>
            </section>
          )}

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

        {/* Onboarding Call Actions */}
        {user.onboardingStatus === OnboardingStatus.PENDING_ONBOARDING_CALL &&
          canManageRole && (
            <section className="mb-8 border-2 border-primary bg-white p-6">
              <h2 className="mb-4 text-2xl font-bold text-black">
                Onboarding Call
              </h2>
              <p className="mb-4 text-sm text-black">
                Mark the outcome of the applicant's onboarding call. Passing
                them will move them to the "Awaiting First Cube" stage.
              </p>
              <div className="flex space-x-4 border-t border-neutral-200 pt-4">
                <button
                  onClick={handleDeny}
                  className="w-full bg-black px-4 py-3 font-bold text-white hover:bg-black"
                >
                  Deny Application
                </button>
                <button
                  onClick={handleOnboardingCallPassed}
                  className="w-full bg-primary px-4 py-3 font-bold text-white hover:bg-primary-hover"
                >
                  Mark Call as Passed
                </button>
              </div>
            </section>
          )}

        {/* Revision Call Actions */}
        {user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL &&
          canManageRole && (
            <section className="mb-8 border-2 border-primary bg-white p-6">
              <h2 className="mb-4 text-2xl font-bold text-black">
                Revision Call
              </h2>
              <p className="mb-4 text-sm text-black">
                This is the final step. Passing them will fully confirm their
                account and grant activist permissions.
              </p>
              <div className="flex space-x-4 border-t border-neutral-200 pt-4">
                <button
                  onClick={handleDeny}
                  className="w-full bg-black px-4 py-3 font-bold text-white hover:bg-black"
                >
                  Deny Application
                </button>
                <button
                  onClick={handleRevisionCallPassed}
                  className="w-full bg-primary px-4 py-3 font-bold text-white hover:bg-primary-hover"
                >
                  Mark Revision Call Passed & Confirm
                </button>
              </div>
            </section>
          )}

        {/* First Cube Confirmation Actions */}
        {user.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE &&
          canManageRole && (
            <section className="mb-8 border-2 border-primary bg-white p-6">
              <h2 className="mb-4 text-2xl font-bold text-black">
                First Cube Attendance
              </h2>
              <p className="mb-4 text-sm text-black">
                This user needs to attend their first Cube. If the automated
                system fails after you log an event report, you can manually
                confirm their attendance here.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleConfirmFirstCube}
                  className="w-full bg-primary px-4 py-3 font-bold text-white hover:bg-primary-hover"
                >
                  Manually Confirm First Cube Attended
                </button>
              </div>
            </section>
          )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Activity Statistics
              </h2>
              <StatsGrid stats={user.stats} />
            </section>
            <section>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Recognitions
              </h2>
              <BadgeList badges={user.badges} />
            </section>
            <OrganizerNotes user={user} />
          </div>
          <div className="space-y-8 lg:col-span-1">
            <section>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Reward Tier
              </h2>
              <DiscountTierProgress user={user} />
            </section>
            {canManageRole && (
              <UserManagementPanel
                user={user}
                currentUser={currentUser}
                canEditChapters={canEditChapters}
                canAwardBadges={canAwardBadges}
                onUpdateRole={updateUserRole}
                onSetChapterOrganiser={setChapterOrganiser}
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
              onManualVerify={() => setManualVerifyModalOpen(true)}
              onOpenDeleteModal={() => setDeleteModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Manual Verification Confirmation Modal */}
      <ConfirmationModal
        isOpen={manualVerifyModalOpen}
        onClose={() => setManualVerifyModalOpen(false)}
        onConfirm={handleManualVerify}
        title="Bypass Onboarding & Verify User"
        message={`Are you sure you want to bypass the entire onboarding process for ${user.name}? This is an administrative override that should only be used for trusted individuals who don't need standard verification steps. This action cannot be undone and will immediately grant them full activist permissions.`}
        confirmText="Bypass & Verify"
        variant="warning"
      />
    </>
  );
};

export default MemberProfile;
