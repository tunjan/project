import { Loader2, Trash } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type User } from '@/types';

interface DeactivateAccountModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isOpen: boolean;
}

const DeactivateAccountModal: React.FC<DeactivateAccountModalProps> = ({
  user,
  onClose,
  onConfirm,
  isOpen,
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All your data will be permanently
            removed.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive">
            <Trash className="size-6 text-destructive-foreground" />
          </div>
          <p className="mt-4 text-destructive">
            Are you sure you want to permanently delete your account,{' '}
            <span className="font-bold">{user.name}</span>? This action is
            irreversible. All of your data, including stats, badges, and
            outreach logs, will be permanently removed from the system.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose} disabled={isDeleting} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            variant="destructive"
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              'Yes, Delete My Account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateAccountModal;
