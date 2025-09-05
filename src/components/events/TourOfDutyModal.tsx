import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type CubeEvent, type TourDuty, TourDutyRole } from '@/types';

interface TourOfDutyModalProps {
  event: CubeEvent;
  existingDuties: TourDuty[];
  onClose: () => void;
  onConfirm: (duties: TourDuty[]) => void;
}

const getDatesBetween = (start: Date, end: Date): Date[] => {
  const dates = [];
  const currentDate = new Date(new Date(start).toISOString().split('T')[0]);
  const lastDate = new Date(new Date(end).toISOString().split('T')[0]);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const TourOfDutyModal: React.FC<TourOfDutyModalProps> = ({
  event,
  existingDuties,
  onClose,
  onConfirm,
}) => {
  const [duties, setDuties] = useState<TourDuty[]>(existingDuties);
  const eventDays = getDatesBetween(event.startDate, event.endDate!);

  const availableRoles = Object.values(TourDutyRole);

  const handleDutyChange = (date: string, role: TourDutyRole) => {
    setDuties((prev) => {
      const existing = prev.find((d) => d.date === date && d.role === role);
      if (existing) {
        return prev.filter((d) => d.date !== date || d.role !== role);
      } else {
        return [...prev, { date, role }];
      }
    });
  };

  const handleConfirmClick = () => {
    if (duties.length === 0) {
      toast.error('Please select at least one duty to sign up.');
      return;
    }
    onConfirm(duties);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Sign Up for Duties</DialogTitle>
          <DialogDescription>
            Select your availability for "{event.location}"
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          {eventDays.map((day) => {
            const dateString = new Date(day).toISOString().split('T')[0];
            return (
              <div
                key={dateString}
                className="border border-border bg-background p-4"
              >
                <h4 className="font-bold text-foreground">
                  {new Date(day).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableRoles.map((role) => (
                    <label
                      key={role}
                      className="flex cursor-pointer items-center space-x-2 border border-border p-2 text-sm transition-colors has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={duties.some(
                          (d) => d.date === dateString && d.role === role
                        )}
                        onChange={() => handleDutyChange(dateString, role)}
                      />
                      <span className="font-semibold">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmClick} size="lg" className="w-full">
            Confirm My Duties
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TourOfDutyModal;
