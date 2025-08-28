import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { TrashIcon } from '@/icons';
import { type User } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DeactivateAccountModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeactivateAccountModal: React.FC<DeactivateAccountModalProps> = ({
  user,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Modal title="Deactivate Account" onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center bg-primary">
          <TrashIcon className="h-6 w-6 text-white" />
        </div>
        <p className="mt-4 text-danger">
          Are you sure you want to permanently delete your account,{' '}
          <span className="font-bold">{user.name}</span>? This action is
          irreversible. All of your data, including stats, badges, and outreach
          logs, will be permanently removed from the system.
        </p>
      </div>

      <div className="mt-6 flex items-center space-x-4">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="btn-outline w-full px-4 py-2 font-bold transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={isDeleting}
          className="btn-danger flex w-full items-center justify-center px-4 py-2 font-bold text-white transition-colors duration-300"
        >
          {isDeleting ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            'Yes, Delete My Account'
          )}
        </button>
      </div>
    </Modal>
  );
};

export default DeactivateAccountModal;
