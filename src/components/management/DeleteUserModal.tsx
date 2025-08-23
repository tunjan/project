import React from 'react';
import { type User } from '@/types';
import { TrashIcon } from '@/icons';
import Modal from '@/components/ui/Modal';

interface DeleteUserModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  user,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal title="Delete User" onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center bg-primary">
          <TrashIcon className="h-6 w-6 text-white" />
        </div>
        <p className="mt-4 text-sm text-neutral-600">
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
          className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
        >
          Confirm Deletion
        </button>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
