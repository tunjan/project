import React, { useState } from 'react';
import { User, OnboardingStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import { useUsersActions, useCurrentUser } from '@/store';

interface ReviewApplicantModalProps {
  applicants: User[];
  onClose: () => void;
}

const ReviewApplicantModal: React.FC<ReviewApplicantModalProps> = ({ applicants, onClose }) => {
  const { updateUserStatus } = useUsersActions();
  const currentUser = useCurrentUser();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (applicants.length === 0) {
    return null; // Or a message indicating no applicants
  }

  const currentApplicant = applicants[currentIndex];

  if (!currentApplicant) {
    return null;
  }

  const handleApprove = () => {
    if (currentUser) {
      updateUserStatus(currentApplicant.id, OnboardingStatus.PENDING_ONBOARDING_CALL, currentUser);
    }
    handleNext();
  };

  const handleReject = () => {
    if (currentUser) {
      updateUserStatus(currentApplicant.id, OnboardingStatus.DENIED, currentUser);
    }
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < applicants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // Close modal when all applicants are reviewed
    }
  };

  return (
    <Modal 
      title="Review New Applicants" 
      onClose={onClose}
      size='md'
    >
      <div className="p-4">
        <div className="text-center">
          <img src={currentApplicant.profilePictureUrl} alt={currentApplicant.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
          <h3 className="text-xl font-bold">{currentApplicant.name}</h3>
          <p className="text-grey-600">{currentApplicant.chapters?.join(', ')}</p>
        </div>

        <div className="mt-6 bg-gray-50 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-bold mb-2">Application Details</h4>
            <p><strong>Email:</strong> {currentApplicant.email}</p>
            <p><strong>Join Date:</strong> {currentApplicant.joinDate ? new Date(currentApplicant.joinDate).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div className="mt-6 flex justify-between space-x-4">
          <button onClick={handleReject} className="btn-danger w-full">Reject</button>
          <button onClick={handleApprove} className="btn-primary w-full">Approve</button>
        </div>

        <div className="mt-4 text-center text-sm text-grey-500">
          <p>Showing applicant {currentIndex + 1} of {applicants.length}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewApplicantModal;
