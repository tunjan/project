import { Calendar, ChevronLeft, Clock, MessageCircle } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { can, Permission } from '@/config';
import { useChapters, useCurrentUser } from '@/store';
import { useAwardsActions } from '@/store/awards.store';
import { useUsersActions } from '@/store/users.store';
import { BadgeTemplate, OnboardingStatus, type User } from '@/types';

import ApplicationAnswers from './ApplicationAnswers';
import AwardBadgeModal from './AwardBadgeModal';
import DeleteUserModal from './DeleteUserModal';
import EditChaptersModal from './EditChaptersModal';
import EventParticipationHistory from './EventParticipationHistory';
import MemberProfileHeader from './MemberProfileHeader';
import OnboardingActions from './OnboardingActions';
import OnboardingProgressDetails from './OnboardingProgressDetails';
import OrganizerNotes from './OrganizerNotes';
import OutreachLogHistory from './OutreachLogHistory';
import PromoteToOrganiserModal from './PromoteToOrganiserModal';
import UserDangerZone from './UserDangerZone';
import UserManagementPanel from './UserManagementPanel';
import UserStats from './UserStats';

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
      const currentOrganiserOf = user.organiserOf || [];
      if (!currentOrganiserOf.includes(chapterName)) {
        setChapterOrganiser(userId, [...currentOrganiserOf, chapterName]);
      }
    } else {
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
    const subject = encodeURIComponent(
      `Message from ${currentUser?.name} - Chapter Update`
    );
    const body = encodeURIComponent(
      `Hi ${user.name},\n\nI hope you're doing well! I wanted to reach out to you as your chapter organizer.\n\n[Your message here]\n\nBest regards,\n${currentUser?.name}\n\nP.S. We'd love to see you at our upcoming events!`
    );
    const mailtoLink = `mailto:${user.email || ''}?subject=${subject}&body=${body}`;

    window.open(mailtoLink, '_blank');
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
          isOpen={deleteModalOpen}
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
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 text-sm font-semibold text-primary hover:text-black"
        >
          <ChevronLeft className="mr-1 size-5" /> Back to Member Directory
        </Button>

        <MemberProfileHeader user={user} />

        {/* Onboarding Actions */}
        {canManageRole && <OnboardingActions user={user} />}

        {/* Onboarding Call Scheduled Info */}
        {(user.onboardingStatus === OnboardingStatus.PENDING_ONBOARDING_CALL ||
          user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL) &&
          user.onboardingProgress?.onboardingCallScheduledAt && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Onboarding Call Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-neutral-500" />
                  <span className="font-semibold">
                    {new Date(
                      user.onboardingProgress.onboardingCallScheduledAt
                    ).toLocaleDateString(undefined, {
                      dateStyle: 'full',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-neutral-500" />
                  <span className="font-semibold">
                    {new Date(
                      user.onboardingProgress.onboardingCallScheduledAt
                    ).toLocaleTimeString(undefined, {
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 size-5 text-neutral-500" />
                  <div>
                    <p className="font-semibold">Provided Contact Info:</p>
                    <p className="border bg-muted p-2 font-mono text-sm">
                      {user.onboardingProgress.onboardingCallContactInfo ||
                        'Not provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Revision Call Scheduled Info */}
        {user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL &&
          user.onboardingProgress?.revisionCallScheduledAt && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Revision Call Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-neutral-500" />
                  <span className="font-semibold">
                    {new Date(
                      user.onboardingProgress.revisionCallScheduledAt
                    ).toLocaleDateString(undefined, {
                      dateStyle: 'full',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-neutral-500" />
                  <span className="font-semibold">
                    {new Date(
                      user.onboardingProgress.revisionCallScheduledAt
                    ).toLocaleTimeString(undefined, {
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 size-5 text-neutral-500" />
                  <div>
                    <p className="font-semibold">Provided Contact Info:</p>
                    <p className="border bg-muted p-2 font-mono text-sm">
                      {user.onboardingProgress.revisionCallContactInfo ||
                        'Not provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Application Answers - Show first for unapproved members */}
        {(user.onboardingStatus ===
          OnboardingStatus.PENDING_APPLICATION_REVIEW ||
          user.onboardingStatus === OnboardingStatus.DENIED) && (
          <div className="mb-8">
            <ApplicationAnswers user={user} />
          </div>
        )}

        {/* Comprehensive Member Data Grid */}
        <div className="space-y-8">
          {/* Enhanced User Stats */}
          <UserStats user={user} />

          {/* Onboarding Progress Details */}
          <OnboardingProgressDetails user={user} />

          {/* Event Participation History */}
          <EventParticipationHistory user={user} />

          {/* Outreach Log History */}
          <OutreachLogHistory user={user} />

          {/* Organizer Notes */}
          <OrganizerNotes user={user} />
        </div>

        {/* Management Actions Sidebar */}
        <div className="mt-8 grid grid-cols-1 gap-8">
          <div className="space-y-8">
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
