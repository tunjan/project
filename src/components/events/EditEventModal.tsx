import React, { useState } from 'react';
import { type CubeEvent, type Chapter } from '@/types';
import { useEventsActions } from '@/store';
import Modal from '@/components/ui/Modal';
import { InputField, SelectField } from '@/components/ui/Form';
import { toast } from 'sonner';
import { useCurrentUser } from '@/store/auth.store';

interface EditEventModalProps {
  event: CubeEvent;
  organizableChapters: Chapter[];
  onClose: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  organizableChapters,
  onClose,
}) => {
  const { updateEvent } = useEventsActions();
  const currentUser = useCurrentUser();

  const [city, setCity] = useState(event.city);
  const [location, setLocation] = useState(event.location);
  const [date, setDate] = useState(
    new Date(event.startDate).toISOString().split('T')[0]
  );
  const [time, setTime] = useState(
    new Date(event.startDate).toTimeString().slice(0, 5)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('You must be logged in to edit an event.');
      return;
    }
    if (!date || !time || !city || !location) {
      toast.error('Please fill out all fields.');
      return;
    }
    const newStartDate = new Date(`${date}T${time}`);
    if (isNaN(newStartDate.getTime())) {
      toast.error('The selected date or time is invalid.');
      return;
    }

    updateEvent(
      event.id,
      { city, location, startDate: newStartDate },
      currentUser
    );
    toast.success('Event updated successfully! Participants will be notified.');
    onClose();
  };

  return (
    <Modal title="Edit Event Details" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectField
          label="City"
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {organizableChapters.map((chapter) => (
            <option key={chapter.name} value={chapter.name}>
              {chapter.name}
            </option>
          ))}
        </SelectField>

        <InputField
          label="Exact Location"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Date"
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <InputField
            label="Time"
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditEventModal;
