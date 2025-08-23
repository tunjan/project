import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User, Role, OnboardingStatus, BadgeTemplate } from '@/types';
import { useCurrentUser, useChapters } from '@/store';
import { useUsersActions } from '@/store/users.store';
import { useAwardsActions } from '@/store/awards.store';
import { ROLE_HIERARCHY, canVerifyUser } from '@/utils/auth';
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
import { ChevronLeftIcon } from '@/icons';
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
    confirmUserIdentity,
    setChapterOrganiser,
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
      OnboardingStatus.AWAITING_VERIFICATION,
      currentUser
    );
    toast.success(`${user.name} approved. Next step: In-person verification.`);
    navigate('/manage');
  };

  const handleDeny = () => {
    if (!currentUser) return;
    updateUserStatus(user.id, OnboardingStatus.DENIED, currentUser);
    toast.error(`${user.name} has been denied.`);
    navigate('/manage');
  };

  const handleManualVerify = () => {
    confirmUserIdentity(user.id);
    toast.success(
      `${user.name} has been manually verified and now has full access.`
    );
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

  const canManageRole = useMemo(() => {
    if (!currentUser) return false;

    const currentUserLevel = ROLE_HIERARCHY[currentUser.role];
    const targetUserLevel = ROLE_HIERARCHY[user.role];

    if (currentUserLevel <= targetUserLevel) return false;

    if (currentUserLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN]) {
      return true;
    }

    if (
      currentUser.role === Role.REGIONAL_ORGANISER &&
      currentUser.managedCountry
    ) {
      const userInChapters = allChapters.filter((c) =>
        user.chapters.includes(c.name)
      );
      const userCountries = new Set(userInChapters.map((c) => c.country));
      return userCountries.has(currentUser.managedCountry);
    }

    if (currentUser.role === Role.CHAPTER_ORGANISER) {
      const managedChapters = new Set(currentUser.organiserOf || []);
      return user.chapters.some((chapter) => managedChapters.has(chapter));
    }

    return false;
  }, [currentUser, user, allChapters]);

  const canEditChapters =
    !!currentUser &&
    ROLE_HIERARCHY[currentUser.role] >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER];
  const canDeleteUser =
    !!currentUser &&
    ROLE_HIERARCHY[currentUser.role] > ROLE_HIERARCHY[user.role];
  const canManuallyVerify = currentUser
    ? canVerifyUser(currentUser, user) &&
      user.onboardingStatus === OnboardingStatus.AWAITING_VERIFICATION
    : false;
  const canAwardBadges =
    !!currentUser &&
    ROLE_HIERARCHY[currentUser.role] >=
      ROLE_HIERARCHY[Role.CHAPTER_ORGANISER] &&
    currentUser.id !== user.id;

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
            <section className="mb-8 border-2 border-yellow-500 bg-yellow-50 p-6">
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
              <div className="mt-6 flex space-x-4 border-t border-yellow-400 pt-4">
                <button
                  onClick={handleDeny}
                  className="w-full bg-black px-4 py-3 font-bold text-white hover:bg-neutral-800"
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
        title="Manual Verification"
        message={`Are you sure you want to manually verify ${user.name}? This will grant them full activist permissions.`}
        confirmText="Verify User"
        variant="warning"
      />
    </>
  );
};

export default MemberProfile;
