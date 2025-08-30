import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import CreateEventForm from '@/components/events/CreateEventForm';
import { useEventsActions } from '@/store';
import { useCurrentUser } from '@/store/auth.store';

const CreateCubePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { createEvent } = useEventsActions();

  const handleCreateEvent = (eventData: {
    name: string;
    city: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    scope: 'Chapter' | 'Regional' | 'Global';
    targetRegion?: string;
  }) => {
    if (!currentUser) {
      toast.error('You must be logged in to create an event.');
      return;
    }
    createEvent(eventData, currentUser);
    toast.success('Event created successfully!');
    navigate('/cubes');
  };

  return (
    <CreateEventForm
      onCreateEvent={handleCreateEvent}
      onCancel={() => navigate('/cubes')}
    />
  );
};

export default CreateCubePage;
