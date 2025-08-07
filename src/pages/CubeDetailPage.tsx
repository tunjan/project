import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import CubeDetail from "@/components/CubeDetail";
import { useEventById, useDataActions } from "@/store/data.store";
import { useCurrentUser } from "@/store/auth.store";
import { type CubeEvent } from "@/types";

const CubeDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { rsvp, cancelRsvp } = useDataActions();

  const event = useEventById(eventId!);

  if (!event) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">Event Not Found</h1>
        <p className="text-neutral-600 mt-2">
          The event you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/cubes")}
          className="mt-4 bg-[#d81313] text-white font-bold py-2 px-4"
        >
          Back to All Cubes
        </button>
      </div>
    );
  }

  const handleRsvp = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    rsvp(event.id, currentUser);
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
      onBack={() => navigate("/cubes")}
      onRsvp={handleRsvp}
      onCancelRsvp={handleCancelRsvp}
      onManageEvent={handleManageEvent}
    />
  );
};

export default CubeDetailPage;
