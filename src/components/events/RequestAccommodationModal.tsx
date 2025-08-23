import React, { useState } from 'react';
import { type User, type CubeEvent, type AccommodationRequest } from '@/types';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import { InputField, TextAreaField } from '@/components/ui/Form';

interface RequestAccommodationModalProps {
  host: User;
  event: CubeEvent;
  onClose: () => void;
  onCreateRequest: (
    data: Omit<
      AccommodationRequest,
      'id' | 'requester' | 'host' | 'event' | 'status'
    >
  ) => void;
}

const RequestAccommodationModal: React.FC<RequestAccommodationModalProps> = ({
  host,
  event,
  onClose,
  onCreateRequest,
}) => {
  // Set default dates to be more logical - arrival day before event, departure day after
  const eventStartDate = new Date(event.startDate);
  const arrivalDate = new Date(eventStartDate);
  arrivalDate.setDate(eventStartDate.getDate() - 1);
  const departureDate = new Date(eventStartDate);
  departureDate.setDate(eventStartDate.getDate() + 1);

  const [startDate, setStartDate] = useState(
    arrivalDate.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    departureDate.toISOString().split('T')[0]
  );
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !message) {
      toast.error('Please fill out all fields.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be before start date.');
      return;
    }
    onCreateRequest({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      message,
      createdAt: new Date(),
    });
  };

  return (
    <Modal
      title={`Request Stay with ${host.name}`}
      onClose={onClose}
      description={`For the ${event.location} event.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Arrival Date"
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <InputField
            label="Departure Date"
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <TextAreaField
          label={`Message to ${host.name}`}
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Introduce yourself, mention your travel plans, etc."
        />
        <div className="flex items-center space-x-4 pt-2">
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
            Send Request
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestAccommodationModal;
