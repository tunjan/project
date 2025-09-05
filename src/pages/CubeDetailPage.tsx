import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import CubeDetail from '@/components/CubeDetail';
import { Button } from '@/components/ui/button';
import { useEventById, useEventsActions } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { TourDuty } from '@/types';

const CubeDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { rsvp, cancelRsvp } = useEventsActions();

  // useEventById already returns a single event, not an array
  const event = useEventById(eventId!);

  if (!event) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Event Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The event you are looking for does not exist.
        </p>
        <Button onClick={() => navigate('/cubes')} className="mt-4">
          Back to All Cubes
        </Button>
      </div>
    );
  }

  const handleRsvp = (eventId: string, duties?: TourDuty[]) => {
    if (!currentUser) return;

    const isGuest = !currentUser.chapters?.includes(event.city);

    if (duties && duties.length > 0) {
      rsvp(eventId, currentUser, isGuest, duties);
      toast.success('Your duties have been registered!');
    } else {
      rsvp(eventId, currentUser, isGuest);
      toast.success("Successfully RSVP'd to the event!");
    }
  };

  const handleCancelRsvp = (eventId: string) => {
    if (!currentUser) return;
    cancelRsvp(eventId, currentUser);
    toast.success('RSVP cancelled successfully');
  };

  const handleManageEvent = (event: { id: string }) => {
    navigate(`/cubes/${event.id}/manage`);
  };

  return (
    <CubeDetail
      event={event}
      onBack={() => navigate('/cubes')}
      onRsvp={handleRsvp}
      onCancelRsvp={handleCancelRsvp}
      onManageEvent={handleManageEvent}
      readOnlyPublic={false}
    />
  );
};

export default CubeDetailPage;
