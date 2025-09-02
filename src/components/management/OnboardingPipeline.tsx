import React from 'react';

import { Avatar } from '@/components/ui';
import { Tag } from '@/components/ui';
import { useEvents } from '@/store';
import { EventStatus, OnboardingStatus, type User } from '@/types';

interface OnboardingCardProps {
  user: User;
  onNavigate: (user: User) => void;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({
  user,
  onNavigate,
}) => {
  const allEvents = useEvents();

  const upcomingRsvp = allEvents.find(
    (e) =>
      e.status === EventStatus.UPCOMING &&
      e.participants.some((p) => p.user.id === user.id)
  );

  return (
    <div
      onClick={() => onNavigate(user)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(user);
        }
      }}
      role="button"
      tabIndex={0}
      className="cursor-pointer border-black bg-white p-3 transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal md:border-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center space-x-3">
          <Avatar
            src={user.profilePictureUrl}
            alt={user.name}
            className="size-10 shrink-0 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-bold text-black">{user.name}</p>
            <p className="truncate text-sm text-neutral-500">
              {user.chapters?.join(', ') || 'No chapters'}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {user.onboardingStatus ===
                OnboardingStatus.PENDING_ONBOARDING_CALL &&
                user.onboardingProgress?.revisionCallScheduledAt && (
                  <Tag variant="info" size="sm">
                    Call Scheduled
                  </Tag>
                )}
              {user.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE &&
                upcomingRsvp && (
                  <Tag variant="success" size="sm">
                    RSVP'd
                  </Tag>
                )}
              {user.onboardingStatus ===
                OnboardingStatus.AWAITING_REVISION_CALL &&
                user.onboardingProgress?.revisionCallScheduledAt && (
                  <Tag variant="info" size="sm">
                    Call Scheduled
                  </Tag>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PipelineColumnProps {
  title: string;
  users: User[];
  onNavigate: (user: User) => void;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({
  title,
  users,
  onNavigate,
}) => (
  <div className="flex flex-col border-black bg-white md:border-2">
    <h3 className="border-b-2 border-black bg-white p-3 text-sm font-extrabold uppercase tracking-wider text-black">
      {title}{' '}
      <span className="font-normal text-neutral-500">({users.length})</span>
    </h3>
    <div className="max-h-[60vh] min-h-[40vh] space-y-2 overflow-y-auto p-2">
      {users.length > 0 ? (
        users.map((user) => (
          <OnboardingCard key={user.id} user={user} onNavigate={onNavigate} />
        ))
      ) : (
        <div className="flex h-full items-center justify-center p-4 text-center">
          <p className="text-sm text-neutral-500">Empty</p>
        </div>
      )}
    </div>
  </div>
);

interface OnboardingPipelineProps {
  users: User[];
  onNavigate: (user: User) => void;
}

const OnboardingPipeline: React.FC<OnboardingPipelineProps> = ({
  users,
  onNavigate,
}) => {
  const pendingReview = users.filter(
    (u) => u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW
  );
  const pendingCall = users.filter(
    (u) => u.onboardingStatus === OnboardingStatus.PENDING_ONBOARDING_CALL
  );
  const awaitingFirstCube = users.filter(
    (u) => u.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE
  );
  const awaitingMasterclass = users.filter(
    (u) => u.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS
  );
  const awaitingRevisionCall = users.filter(
    (u) => u.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL
  );
  const denied = users.filter(
    (u) => u.onboardingStatus === OnboardingStatus.DENIED
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
      <PipelineColumn
        title="Application Review"
        users={pendingReview}
        onNavigate={onNavigate}
      />
      <PipelineColumn
        title="Onboarding Call"
        users={pendingCall}
        onNavigate={onNavigate}
      />
      <PipelineColumn
        title="First Cube"
        users={awaitingFirstCube}
        onNavigate={onNavigate}
      />
      <PipelineColumn
        title="Masterclass"
        users={awaitingMasterclass}
        onNavigate={onNavigate}
      />
      <PipelineColumn
        title="Revision Call"
        users={awaitingRevisionCall}
        onNavigate={onNavigate}
      />
      <PipelineColumn title="Denied" users={denied} onNavigate={onNavigate} />
    </div>
  );
};

export default OnboardingPipeline;
