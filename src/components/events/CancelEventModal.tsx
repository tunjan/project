import React, { useState } from 'react';
import { toast } from 'sonner';

import { TextAreaField } from '@/components/ui';
import { Modal } from '@/components/ui';
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
    <Modal
      title="Cancel Event"
      onClose={onClose}
      description={`You are about to cancel "${event.location}". This cannot be undone.`}
    >
      <div className="my-6">
        <TextAreaField
          label="Reason for Cancellation (required, will be sent to participants)"
          id="cancellation-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          required
        />
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onClose}
          className="w-full bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-black"
        >
          Go Back
        </button>
        <button
          onClick={handleConfirm}
          className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
        >
          Confirm Cancellation
        </button>
      </div>
    </Modal>
  );
};

export default CancelEventModal;
