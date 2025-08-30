import { useParams, useNavigate } from 'react-router-dom';
import CubeDetail from '@/components/CubeDetail';
import { useEventById } from '@/store';

const PublicCubeDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = useEventById(eventId!);

  const noop = () => {};

  if (!event) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Event Not Found</h1>
        <p className="text-grey-600 mt-2">
          The event you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate('/chapters')}
          className="mt-4 bg-primary px-4 py-2 font-bold text-white"
        >
          Back to Chapters
        </button>
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
