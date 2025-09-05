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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type AccommodationRequest, type CubeEvent, type User } from '@/types';

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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Stay with {host.name}</DialogTitle>
          <DialogDescription>For the {event.location} event.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Arrival Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Departure Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message to {host.name}</Label>
            <Textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Introduce yourself, mention your travel plans, etc."
            />
          </div>
          <DialogFooter className="flex space-x-4 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full">
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestAccommodationModal;
