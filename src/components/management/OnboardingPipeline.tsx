import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card
      onClick={() => onNavigate(user)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(user);
        }
      }}
      role="button"
      tabIndex={0}
      className="cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center space-x-3">
            <Avatar className="size-10 shrink-0">
              <AvatarImage
                src={user.profilePictureUrl}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xs">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user.chapters?.join(', ') || 'No chapters'}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {user.onboardingStatus ===
                  OnboardingStatus.PENDING_ONBOARDING_CALL &&
                  user.onboardingProgress?.revisionCallScheduledAt && (
                    <Badge variant="secondary">Call Scheduled</Badge>
                  )}
                {user.onboardingStatus ===
                  OnboardingStatus.AWAITING_FIRST_CUBE &&
                  upcomingRsvp && <Badge variant="default">RSVP'd</Badge>}
                {user.onboardingStatus ===
                  OnboardingStatus.AWAITING_REVISION_CALL &&
                  user.onboardingProgress?.revisionCallScheduledAt && (
                    <Badge variant="secondary">Call Scheduled</Badge>
                  )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
  <Card className="flex flex-col">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
        {title}{' '}
        <span className="font-normal text-muted-foreground">
          ({users.length})
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-1 p-2">
      <div className="max-h-[60vh] min-h-[40vh] space-y-2 overflow-y-auto">
        {users.length > 0 ? (
          users.map((user) => (
            <OnboardingCard key={user.id} user={user} onNavigate={onNavigate} />
          ))
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <p className="text-sm text-muted-foreground">Empty</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
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
