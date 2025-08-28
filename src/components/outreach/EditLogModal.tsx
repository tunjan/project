import React, { useState } from 'react';
import { type OutreachLog, OutreachOutcome } from '@/types';
import Modal from '@/components/ui/Modal';
import { SelectField, TextAreaField } from '@/components/ui/Form';

interface EditLogModalProps {
  log: OutreachLog;
  onClose: () => void;
  onSave: (logId: string, updates: Partial<OutreachLog>) => void;
}

const EditLogModal: React.FC<EditLogModalProps> = ({
  log,
  onClose,
  onSave,
}) => {
  const [outcome, setOutcome] = useState(log.outcome);
  const [notes, setNotes] = useState(log.notes || '');

  const handleSave = () => {
    onSave(log.id, { outcome, notes });
    onClose();
  };

  return (
    <Modal title="Edit Log Entry" onClose={onClose} size="md">
      <div className="space-y-4">
        <SelectField
          label="Outcome"
          id="edit-outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as OutreachOutcome)}
        >
          {Object.values(OutreachOutcome).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </SelectField>
        <TextAreaField
          label="Notes"
          id="edit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add notes about this conversation..."
        />
        <div className="flex gap-4 pt-4">
          <button onClick={handleSave} className="btn-primary flex-1">
            Save Changes
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditLogModal;
