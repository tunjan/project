import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User, Role, OnboardingStatus, BadgeTemplate } from '@/types';
import { useCurrentUser } from '@/store/auth.store';
import { useChapters, useAppActions } from '@/store/appStore';
import {
  getAssignableRoles,
  ROLE_HIERARCHY,
  canVerifyUser,
} from '@/utils/auth';
import { getUserRoleDisplay } from '@/utils/user';
import StatsGrid from '@/components/dashboard/StatsGrid';
import BadgeList from '@/components/dashboard/BadgeList';
import DiscountTierProgress from '@/components/dashboard/DiscountTierProgress';
import PromoteToOrganiserModal from './PromoteToOrganiserModal';
import EditChaptersModal from './EditChaptersModal';
import DeleteUserModal from './DeleteUserModal';
import OrganizerNotes from './OrganizerNotes';
import AwardBadgeModal from './AwardBadgeModal';
import {
  ChevronLeftIcon,
  PencilIcon,
  ShieldCheckIcon,
  TrophyIcon,
} from '@/icons';
import { toast } from 'sonner';

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
    setChapterOrganiser,
    deleteUser,
    updateUserChapters,
    updateUserStatus,
    confirmUserIdentity,
    awardBadge,
  } = useAppActions();

  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const [isPromoteModalOpen, setPromoteModalOpen] = useState(false);
  const [isEditChaptersModalOpen, setEditChaptersModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAwardBadgeModalOpen, setAwardBadgeModalOpen] = useState(false);

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
    if (
      window.confirm(
        `Are you sure you want to manually verify ${user.name}? This will grant them full activist permissions.`
      )
    ) {
      confirmUserIdentity(user.id);
      toast.success(
        `${user.name} has been manually verified and now has full access.`
      );
    }
  };

  const assignableRoles = currentUser ? getAssignableRoles(currentUser) : [];

  const handleSaveRole = () => {
    if (selectedRole === user.role) return;
    if (
      selectedRole === Role.CHAPTER_ORGANISER &&
      ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[Role.CHAPTER_ORGANISER]
    ) {
      setPromoteModalOpen(true);
    } else {
      updateUserRole(user.id, selectedRole);
      toast.success(`${user.name}'s role has been updated to ${selectedRole}.`);
    }
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
    ? canVerifyUser(currentUser, user)
    : false;
  const canAwardBadges =
    !!currentUser &&
    ROLE_HIERARCHY[currentUser.role] >=
      ROLE_HIERARCHY[Role.CHAPTER_ORGANISER] &&
    currentUser.id !== user.id;

  if (!currentUser) return null;

  return (
    <>
      {isPromoteModalOpen && (
        <PromoteToOrganiserModal
          userToManage={user}
          onClose={() => setPromoteModalOpen(false)}
          onConfirm={handleConfirmOrganiserUpdate}
        />
      )}
      {isEditChaptersModalOpen && (
        <EditChaptersModal
          user={user}
          allChapters={allChapters}
          onClose={() => setEditChaptersModalOpen(false)}
          onSave={handleConfirmChapterUpdate}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteUserModal
          user={user}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {isAwardBadgeModalOpen && (
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

        <div className="mb-8 flex flex-col items-center space-y-4 border-2 border-black bg-white p-6 sm:flex-row sm:space-x-8 sm:space-y-0 md:p-8">
          <img
            src={user.profilePictureUrl}
            alt={user.name}
            className="h-24 w-24 border-2 border-black object-cover md:h-32 md:w-32"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-black md:text-4xl">
              {user.name}
            </h1>
            <p className="text-lg text-neutral-600">
              {getUserRoleDisplay(user)}
            </p>
          </div>
        </div>

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
                  className="w-full bg-black px-4 py-2 font-bold text-white hover:bg-neutral-800"
                >
                  Deny
                </button>
                <button
                  onClick={handleApprove}
                  className="w-full bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover"
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
              <section>
                <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                  Manage User
                </h2>
                <div className="space-y-4 border-2 border-black bg-white p-6">
                  <div className="flex items-center">
                    <PencilIcon className="mr-3 h-5 w-5 text-black" />
                    <h3 className="text-lg font-bold text-black">
                      Assign Role
                    </h3>
                  </div>
                  <select
                    id="role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Role)}
                    className="block w-full rounded-none border-2 border-black bg-white p-2 text-black"
                  >
                    <option value={user.role} disabled>
                      {user.role} (Current)
                    </option>
                    {assignableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveRole}
                    disabled={selectedRole === user.role}
                    className="w-full bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save Role
                  </button>

                  {canEditChapters && (
                    <button
                      onClick={() => setEditChaptersModalOpen(true)}
                      className="mt-2 w-full border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                    >
                      Edit Chapter Memberships
                    </button>
                  )}
                  {canAwardBadges && (
                    <button
                      onClick={() => setAwardBadgeModalOpen(true)}
                      className="mt-2 flex w-full items-center justify-center border-2 border-yellow-500 bg-yellow-400 px-4 py-2 font-bold text-black hover:bg-yellow-500"
                    >
                      <TrophyIcon className="mr-2 h-5 w-5" />
                      Award Recognition
                    </button>
                  )}
                </div>
              </section>
            )}
            <section>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Danger Zone
              </h2>
              <div className="space-y-4 border-2 border-primary bg-white p-6">
                {user.onboardingStatus ===
                  OnboardingStatus.AWAITING_VERIFICATION &&
                  canManuallyVerify && (
                    <div className="border-b border-primary pb-4">
                      <h3 className="text-lg font-bold text-black">
                        Manual Verification
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600">
                        Force-verify this user and grant them full access.
                      </p>
                      <button
                        onClick={handleManualVerify}
                        className="mt-2 flex w-full items-center justify-center bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-600"
                      >
                        <ShieldCheckIcon className="mr-2 h-5 w-5" />
                        Manually Verify User
                      </button>
                    </div>
                  )}
                <div>
                  <h3 className="text-lg font-bold text-black">Delete User</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    This action is permanent and cannot be undone.
                  </p>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={!canDeleteUser}
                    className="mt-4 w-full bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberProfile;
