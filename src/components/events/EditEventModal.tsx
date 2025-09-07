import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEventsActions } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type Chapter, type CubeEvent } from '@/types';

interface EditEventModalProps {
  event: CubeEvent;
  organizableChapters: Chapter[];
  onClose: () => void;
  isOpen: boolean;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  organizableChapters,
  onClose,
  isOpen,
}) => {
  const { updateEvent } = useEventsActions();
  const currentUser = useCurrentUser();

  const [city, setCity] = useState(event.city);
  const [location, setLocation] = useState(event.location);
  const [date, setDate] = useState<Date | undefined>(new Date(event.startDate));
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

    // Combine date and time into a single Date object
    const [hours, minutes] = time.split(':').map(Number);
    const newStartDate = new Date(date);
    newStartDate.setHours(hours, minutes, 0, 0);

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event Details</DialogTitle>
        </DialogHeader>
        <form
          id="edit-event-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {organizableChapters.map((chapter) => (
                  <SelectItem key={chapter.name} value={chapter.name}>
                    {chapter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Exact Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                date={date}
                onDateChange={setDate}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </form>
      </DialogContent>
      <DialogFooter>
        <Button type="button" onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button type="submit" form="edit-event-form">
          Save Changes
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditEventModal;
