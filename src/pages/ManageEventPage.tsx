import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManageEventForm from '@/components/events/ManageEventForm';
import { useEventById, useEventsActions } from '@/store';
import { type EventReport } from '@/types';
import { toast } from 'sonner';

const ManageEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = useEventById(eventId!);
  const { logEventReport } = useEventsActions();

  if (!event) {
    return <div className="py-16 text-center">Event not found.</div>;
  }

  const handleLogReport = (id: string, report: EventReport) => {
    logEventReport(id, report);
    toast.success('Event report logged successfully!');
    navigate(`/cubes/${id}`);
  };

  return (
    <ManageEventForm
      event={event}
      onLogReport={handleLogReport}
      onCancel={() => navigate(`/cubes/${event.id}`)}
    />
  );
};

export default ManageEventPage;
