import React, { useState } from 'react';
import { User, OnboardingStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import { useUsersActions, useCurrentUser } from '@/store';
import {
  CheckIcon,
  XIcon,
  HashtagIcon,
  MailIcon,
  CalendarIcon,
  UserCircleIcon,
} from '@/icons';
import { TextAreaField } from '@/components/ui/Form';

// A small component to display applicant details in a structured way.
const ApplicantDetail: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 flex-shrink-0 text-neutral-500">{icon}</div>
    <div>
      <p className="text-xs font-bold uppercase text-neutral-500">{label}</p>
      <p className="font-semibold text-black">{value || 'Not provided'}</p>
    </div>
  </div>
);

// A component for displaying the Q&A section in brutalist style.
const AnswerBlock: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => (
  <div>
    <p className="mb-1 text-sm font-bold text-black">{question}</p>
    <div className="border-2 border-black bg-white p-3">
      <p className="text-sm text-neutral-700">{answer}</p>
    </div>
  </div>
);

interface ReviewApplicantModalProps {
  applicants: User[];
  onClose: () => void;
}

const ReviewApplicantModal: React.FC<ReviewApplicantModalProps> = ({
  applicants,
  onClose,
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
    setRemainingApplicants(prev => prev.slice(1));
    setNote('');
    if (remainingApplicants.length <= 1) onClose();
  };

  const modalTitle = `Review Applicants (${applicants.length - remainingApplicants.length + 1} of ${
    applicants.length
  })`;

  return (
    <Modal title={modalTitle} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Applicant Header */}
        <div className="flex flex-col items-center gap-6 border-b-2 border-black pb-6 sm:flex-row">
          <img
            src={currentApplicant.profilePictureUrl}
            alt={currentApplicant.name}
            className="h-24 w-24 flex-shrink-0 border-2 border-black object-cover"
          />
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <ApplicantDetail
              icon={<UserCircleIcon className="h-5 w-5" />}
              label="Name"
              value={currentApplicant.name}
            />
            <ApplicantDetail
              icon={<CalendarIcon className="h-5 w-5" />}
              label="Applying to"
              value={`${currentApplicant.chapters?.join(', ')} Chapter`}
            />
            <ApplicantDetail
              icon={<MailIcon className="h-5 w-5" />}
              label="Email"
              value={currentApplicant.email}
            />
            <ApplicantDetail
              icon={<HashtagIcon className="h-5 w-5" />}
              label="Instagram"
              value={currentApplicant.instagram}
            />
          </div>
        </div>

        {/* Onboarding Answers */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-black">
            Application Answers
          </h3>
          {currentApplicant.onboardingAnswers ? (
            <div className="space-y-4 border-2 border-black bg-neutral-100 p-4">
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
            <div className="border-2 border-warning bg-warning/10 p-4">
              <p className="font-bold text-yellow-700">
                ⚠️ No Onboarding Answers
              </p>
              <p className="text-sm text-yellow-700">
                This applicant doesn't have answers recorded. This may indicate
                an issue with the signup process.
              </p>
            </div>
          )}
        </div>

        {/* Organizer Note */}
        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-black">
            Add Note (Optional)
          </h3>
          <TextAreaField
            label="Visible only to other organizers"
            id="organizer-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., 'Strong application, seems dedicated...'"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 border-t-2 border-black pt-6">
          <button
            onClick={() => handleAction(OnboardingStatus.DENIED)}
            className="flex w-full items-center justify-center gap-2 border-2 border-black bg-danger py-3 font-bold text-white shadow-brutal transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg"
          >
            <XIcon className="h-5 w-5" />
            Reject
          </button>
          <button
            onClick={() =>
              handleAction(OnboardingStatus.PENDING_ONBOARDING_CALL)
            }
            className="flex w-full items-center justify-center gap-2 border-2 border-black bg-success py-3 font-bold text-white shadow-brutal transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg"
          >
            <CheckIcon className="h-5 w-5" />
            Approve
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewApplicantModal;
