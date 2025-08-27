import React from 'react';
import Modal from '@/components/ui/Modal';
import { TrashIcon } from '@/icons';
import { type User } from '@/types';

interface DeactivateAccountModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}

const DeactivateAccountModal: React.FC<DeactivateAccountModalProps> = ({
  user,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal title="Deactivate Account" onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center bg-primary">
          <TrashIcon className="h-6 w-6 text-white" />
        </div>
        <p className="mt-4 text-red">
          Are you sure you want to permanently delete your account,{' '}
          <span className="font-bold">{user.name}</span>? This action is
          irreversible. All of your data, including stats, badges, and outreach
          logs, will be permanently removed from the system.
        </p>
      </div>

      <div className="mt-6 flex items-center space-x-4">
        <button
          onClick={onClose}
          className="btn-outline w-full px-4 py-2 font-bold transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
        >
          Yes, Delete My Account
        </button>
      </div>
    </Modal>
  );
};

export default DeactivateAccountModal;
