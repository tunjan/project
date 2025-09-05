import { Trash } from 'lucide-react';
import React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                <Trash className="size-6" />
              </div>
              <p className="mt-4 text-sm">
                Are you sure you want to delete{' '}
                <span className="font-bold">{user.name}</span>? This action is
                permanent and cannot be undone. All associated data will be
                removed.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Confirm Deletion
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserModal;
