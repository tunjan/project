import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ManageEventForm from "@/components/events/ManageEventForm";
import { useEventById, useDataActions } from "@/store/data.store";
import { type EventReport } from "@/types";

const ManageEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = useEventById(eventId!);
  const { logEventReport } = useDataActions();

  if (!event) {
    return <div className="text-center py-16">Event not found.</div>;
  }

  const handleLogReport = (id: string, report: EventReport) => {
    logEventReport(id, report);
    alert("Event report logged successfully!");
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
