import React from 'react';
import { type User, OnboardingStatus } from '@/types';

interface OnboardingCardProps {
  user: User;
  onNavigate: (user: User) => void;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({
  user,
  onNavigate,
}) => {
  return (
    <div
      onClick={() => onNavigate(user)}
      className="cursor-pointer border border-black bg-white p-3 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center space-x-3">
          <img
            src={user.profilePictureUrl}
            alt={user.name}
            className="h-10 w-10 flex-shrink-0 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-bold text-black">{user.name}</p>
            <p className="truncate text-sm text-neutral-500">
              {user.chapters.join(', ')}
            </p>
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
  <div className="flex flex-col border border-black bg-neutral-100">
    <h3 className="border-b-2 border-black bg-white p-3 text-sm font-extrabold uppercase tracking-wider text-black">
      {title}{' '}
      <span className="font-normal text-neutral-500">({users.length})</span>
    </h3>
    <div className="h-[60vh] space-y-2 overflow-y-auto p-2">
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
  const pendingVerification = users.filter(
    (u) => u.onboardingStatus === OnboardingStatus.AWAITING_VERIFICATION
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PipelineColumn
        title="Application Review"
        users={pendingReview}
        onNavigate={onNavigate}
      />
      <PipelineColumn
        title="Identity Verification"
        users={pendingVerification}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default OnboardingPipeline;
