import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type CubeEvent } from '@/types';

interface CancelEventModalProps {
  event: CubeEvent;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const CancelEventModal: React.FC<CancelEventModalProps> = ({
  event,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim().length < 10) {
      toast.error('Please provide a reason (at least 10 characters).');
      return;
    }
    onConfirm(reason);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Event</DialogTitle>
          <DialogDescription>
            You are about to cancel "{event.location}". This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6">
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">
              Reason for Cancellation (required, will be sent to participants)
            </Label>
            <Textarea
              id="cancellation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>
        <DialogFooter className="flex space-x-4">
          <Button onClick={onClose} variant="outline" className="w-full">
            Go Back
          </Button>
          <Button
            onClick={handleConfirm}
            variant="destructive"
            className="w-full"
          >
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelEventModal;
