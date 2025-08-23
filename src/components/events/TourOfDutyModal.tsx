import React, { useState } from 'react';
import { type CubeEvent, type TourDuty, EventRole } from '@/types';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

interface TourOfDutyModalProps {
  event: CubeEvent;
  existingDuties: TourDuty[];
  onClose: () => void;
  onConfirm: (duties: TourDuty[]) => void;
}

const getDatesBetween = (start: Date, end: Date): Date[] => {
  const dates = [];
  let currentDate = new Date(new Date(start).toISOString().split('T')[0]);
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

  const availableRoles = [
    EventRole.OUTREACH,
    EventRole.EQUIPMENT,
    EventRole.TRANSPORT,
  ];

  const handleDutyChange = (date: string, role: EventRole) => {
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
    <Modal
      title="Sign Up for Duties"
      description={`Select your availability for "${event.location}"`}
      onClose={onClose}
    >
      <div className="my-6 max-h-[60vh] space-y-4 overflow-y-auto pr-2">
        {eventDays.map((day) => {
          const dateString = new Date(day).toISOString().split('T')[0];
          return (
            <div
              key={dateString}
              className="border-2 border-black bg-white p-4"
            >
              <h4 className="font-bold">
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
                    className="flex cursor-pointer items-center space-x-2 border-2 border-black p-2 text-sm transition-colors has-[:checked]:bg-primary has-[:checked]:text-white"
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
        <button
          onClick={onClose}
          className="w-full bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmClick}
          className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
        >
          Confirm My Duties
        </button>
      </div>
    </Modal>
  );
};

export default TourOfDutyModal;
