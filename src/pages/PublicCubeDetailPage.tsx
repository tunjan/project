import { useNavigate, useParams } from 'react-router-dom';

import CubeDetail from '@/components/CubeDetail';
import { Button } from '@/components/ui/button';
import { useEventById } from '@/store';

const PublicCubeDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = useEventById(eventId!);

  const noop = () => {};

  if (!event) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Event Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The event you are looking for does not exist.
        </p>
        <Button onClick={() => navigate('/chapters')} className="mt-4">
          Back to Chapters
        </Button>
      </div>
    );
  }

  return (
    <CubeDetail
      event={event}
      onBack={() => navigate(-1)}
      onRsvp={() => noop()}
      onCancelRsvp={() => noop()}
      onManageEvent={() => navigate('/cubes')}
      readOnlyPublic
    />
  );
};

export default PublicCubeDetailPage;
