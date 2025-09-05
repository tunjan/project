import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="size-12">
              <AvatarImage
                src={user.profilePictureUrl}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{chapterText}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user.onboardingAnswers && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
              >
                {isExpanded ? 'Hide' : 'Review'} Answers
              </Button>
            )}
            <Button onClick={onDeny} variant="destructive" size="sm">
              Deny
            </Button>
            <Button onClick={onApprove} variant="default" size="sm">
              Approve
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && user.onboardingAnswers && (
        <CardContent className="space-y-3 border-t">
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Why did you go vegan?
            </p>
            <p className="text-sm text-foreground">
              {user.onboardingAnswers.veganReason}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Are you aligned with our abolitionist values?
            </p>
            <p className="text-sm text-foreground">
              {user.onboardingAnswers.abolitionistAlignment ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Chapter Question: How can you contribute?
            </p>
            <p className="text-sm text-foreground">
              {user.onboardingAnswers.customAnswer}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const OnboardingQueue: React.FC<OnboardingQueueProps> = ({
  applicants,
  onApprove,
  onDeny,
}) => {
  if (applicants.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-bold text-foreground">
            The queue is empty.
          </h3>
          <p className="mt-2 text-muted-foreground">
            There are no new applicants to review at this time.
          </p>
        </CardContent>
      </Card>
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
