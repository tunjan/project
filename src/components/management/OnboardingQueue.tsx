import React, { useState } from 'react';

import { Avatar } from '@/components/ui';
import { type User } from '@/types';

interface OnboardingQueueProps {
  applicants: User[];
  onApprove: (userId: string) => void;
  onDeny: (userId: string) => void;
}

const ApplicantCard: React.FC<{
  user: User;
  onApprove: () => void;
  onDeny: () => void;
}> = ({ user, onApprove, onDeny }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const chapterText =
    user.chapters && user.chapters.length > 0
      ? `${user.chapters.join(', ')} Chapter`
      : 'No chapter';

  return (
    <div className="border-black bg-white md:border-2">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Avatar
            src={user.profilePictureUrl}
            alt={user.name}
            className="size-12 object-cover"
          />
          <div>
            <p className="font-bold text-black">{user.name}</p>
            <p className="text-sm text-neutral-500">{chapterText}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {user.onboardingAnswers && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-sm font-semibold text-black hover:bg-white"
            >
              {isExpanded ? 'Hide' : 'Review'} Answers
            </button>
          )}
          <button
            onClick={onDeny}
            className="bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Deny
          </button>
          <button
            onClick={onApprove}
            className="bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Approve
          </button>
        </div>
      </div>
      {isExpanded && user.onboardingAnswers && (
        <div className="space-y-3 border-t-2 border-black bg-white p-4">
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
              {user.onboardingAnswers.abolitionistAlignment ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-neutral-500">
              Chapter Question: How can you contribute?
            </p>
            <p className="text-sm text-black">
              {user.onboardingAnswers.customAnswer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const OnboardingQueue: React.FC<OnboardingQueueProps> = ({
  applicants,
  onApprove,
  onDeny,
}) => {
  if (applicants.length === 0) {
    return (
      <div className="border-black bg-white p-8 text-center md:border-2">
        <h3 className="text-xl font-bold text-black">The queue is empty.</h3>
        <p className="mt-2 text-neutral-500">
          There are no new applicants to review at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applicants.map((user) => (
        <ApplicantCard
          key={user.id}
          user={user}
          onApprove={() => onApprove(user.id)}
          onDeny={() => onDeny(user.id)}
        />
      ))}
    </div>
  );
};

export default OnboardingQueue;
