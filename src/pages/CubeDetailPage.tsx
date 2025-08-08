import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CubeDetail from '@/components/CubeDetail';
import { useEventById, useAppActions } from '@/store/appStore';
import { useCurrentUser } from '@/store/auth.store';
import { type CubeEvent, type TourDuty } from '@/types';

const CubeDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { rsvp, cancelRsvp } = useAppActions();

  const event = useEventById(eventId!);

  if (!event) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Event Not Found</h1>
        <p className="mt-2 text-neutral-600">
          The event you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate('/cubes')}
          className="mt-4 bg-primary px-4 py-2 font-bold text-white"
        >
          Back to All Cubes
        </button>
      </div>
    );
  }

  const handleRsvp = (id: string, duties?: TourDuty[]) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const isGuest = !currentUser.chapters.includes(event.city);
    rsvp(id, currentUser, isGuest, duties);
  };

  const handleCancelRsvp = () => {
    if (!currentUser) return;
    cancelRsvp(event.id, currentUser);
  };

  const handleManageEvent = (eventToManage: CubeEvent) => {
    navigate(`/manage/event/${eventToManage.id}`);
  };

  return (
    <CubeDetail
      event={event}
      onBack={() => navigate('/cubes')}
      onRsvp={handleRsvp}
      onCancelRsvp={handleCancelRsvp}
      onManageEvent={handleManageEvent}
    />
  );
};

export default CubeDetailPage;
