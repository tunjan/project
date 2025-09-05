import React, { useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { Label } from '@/components/ui/label';
import { type OutreachLog, OutreachOutcome } from '@/types';

interface EditLogModalProps {
  log: OutreachLog;
  onClose: () => void;
  onSave: (logId: string, updates: Partial<OutreachLog>) => void;
  isOpen: boolean;
}

const EditLogModal: React.FC<EditLogModalProps> = ({
  log,
  onClose,
  onSave,
  isOpen,
}) => {
  const [outcome, setOutcome] = useState(log.outcome);
  const [notes, setNotes] = useState(log.notes || '');

  const handleSave = () => {
    onSave(log.id, { outcome, notes });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Log Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-outcome">Outcome</Label>
            <Select
              value={outcome}
              onValueChange={(value: string) =>
                setOutcome(value as OutreachOutcome)
              }
            >
              <SelectTrigger id="edit-outcome">
                <SelectValue placeholder="Select an outcome" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OutreachOutcome).map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
              rows={4}
              placeholder="Add notes about this conversation..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button onClick={onClose} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLogModal;
