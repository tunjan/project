import { Calendar, Check, Hash, Mail, UserCircle, X } from 'lucide-react';
import React, { useState } from 'react';

import { TextAreaField } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCurrentUser, useUsersActions } from '@/store';
import { OnboardingStatus, User } from '@/types';

// A small component to display applicant details in a structured way.
const ApplicantDetail: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
}> = ({ icon, label, value }) => {
  // Special handling for Instagram handles to make them clickable
  const renderValue = () => {
    if (label === 'Instagram' && value && value.startsWith('@')) {
      return (
        <a
          href={`https://instagram.com/${value.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-hover hover:underline"
        >
          {value}
        </a>
      );
    }
    return (
      <span className="font-semibold text-foreground">
        {value || 'Not provided'}
      </span>
    );
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase text-muted-foreground">
          {label}
        </p>
        {renderValue()}
      </div>
    </div>
  );
};

// A component for displaying the Q&A section.
const AnswerBlock: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm">{question}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </CardContent>
  </Card>
);

interface ReviewApplicantModalProps {
  applicants: User[];
  onClose: () => void;
  isOpen: boolean;
}

const ReviewApplicantModal: React.FC<ReviewApplicantModalProps> = ({
  applicants,
  onClose,
  isOpen,
}) => {
  const { updateUserStatus, addOrganizerNote } = useUsersActions();
  const currentUser = useCurrentUser();
  const [remainingApplicants, setRemainingApplicants] = useState(applicants);
  const [note, setNote] = useState('');

  if (remainingApplicants.length === 0) {
    return null;
  }

  const currentApplicant = remainingApplicants[0];

  if (!currentApplicant) {
    return null;
  }

  const handleAction = (
    status: OnboardingStatus.PENDING_ONBOARDING_CALL | OnboardingStatus.DENIED
  ) => {
    if (currentUser) {
      updateUserStatus(currentApplicant.id, status, currentUser);

      if (note.trim()) {
        addOrganizerNote(currentApplicant.id, note, currentUser);
      }
    }
    handleNext();
  };

  const handleNext = () => {
    setRemainingApplicants((prev) => {
      const next = prev.slice(1);
      // Close the modal when there are no more applicants to review
      if (next.length === 0) {
        onClose();
      }
      return next;
    });
    setNote('');
  };

  const modalTitle = `Review Applicants (${applicants.length - remainingApplicants.length + 1} of ${
    applicants.length
  })`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            Review the applicant's information and make a decision
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Applicant Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <img
                  src={currentApplicant.profilePictureUrl}
                  alt={currentApplicant.name}
                  className="size-24 shrink-0 rounded-lg border object-cover"
                />
                <div className="grid w-full grid-cols-1 gap-4">
                  <ApplicantDetail
                    icon={<UserCircle className="size-5" />}
                    label="Name"
                    value={currentApplicant.name}
                  />
                  <ApplicantDetail
                    icon={<Calendar className="size-5" />}
                    label="Applying to"
                    value={`${currentApplicant.chapters?.join(', ')} Chapter`}
                  />
                  <ApplicantDetail
                    icon={<Mail className="size-5" />}
                    label="Email"
                    value={currentApplicant.email}
                  />
                  <ApplicantDetail
                    icon={<Hash className="size-5" />}
                    label="Instagram"
                    value={currentApplicant.instagram}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Answers */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-foreground">
              Application Answers
            </h3>
            {currentApplicant.onboardingAnswers ? (
              <div className="space-y-4">
                <AnswerBlock
                  question="Why did you go vegan?"
                  answer={currentApplicant.onboardingAnswers.veganReason}
                />
                <AnswerBlock
                  question="Are you aligned with our abolitionist values?"
                  answer={
                    currentApplicant.onboardingAnswers.abolitionistAlignment
                      ? 'Yes'
                      : 'No / Unsure'
                  }
                />
                <AnswerBlock
                  question="How can you best contribute to your local chapter?"
                  answer={currentApplicant.onboardingAnswers.customAnswer}
                />
              </div>
            ) : (
              <Card className="border-warning bg-warning/10">
                <CardContent className="p-4">
                  <p className="font-bold text-warning-foreground">
                    ⚠️ No Onboarding Answers
                  </p>
                  <p className="text-sm text-warning-foreground">
                    This applicant doesn't have answers recorded. This may
                    indicate an issue with the signup process.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Organizer Note */}
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-foreground">
              Add Note (Optional)
            </h3>
            <TextAreaField
              label="Visible only to other organizers"
              id="organizer-note"
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
              placeholder="e.g., 'Strong application, seems dedicated...'"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleAction(OnboardingStatus.DENIED)}
            variant="destructive"
            className="w-full"
          >
            <X className="mr-2 size-5" />
            Reject
          </Button>
          <Button
            onClick={() =>
              handleAction(OnboardingStatus.PENDING_ONBOARDING_CALL)
            }
            variant="default"
            className="w-full"
          >
            <Check className="mr-2 size-5" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewApplicantModal;
