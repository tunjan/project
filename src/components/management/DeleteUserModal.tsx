import React from 'react';

import Modal from '@/components/ui/Modal';
import { TrashIcon } from '@/icons';
import { type User } from '@/types';

interface DeleteUserModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
  isOpen: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  user,
  onClose,
  onConfirm,
  isOpen,
}) => {
  return (
    <Modal title="Delete User" onClose={onClose} isOpen={isOpen}>
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center bg-primary">
          <TrashIcon className="size-6 text-white" />
        </div>
        <p className="mt-4 text-sm text-danger">
          Are you sure you want to delete{' '}
          <span className="font-bold">{user.name}</span>? This action is
          permanent and cannot be undone. All associated data will be removed.
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
          className="btn-danger w-full px-4 py-2 font-bold transition-colors duration-300"
        >
          Confirm Deletion
        </button>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
