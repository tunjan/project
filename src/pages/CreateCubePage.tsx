import React from "react";
import { useNavigate } from "react-router-dom";
import CreateCubeForm from "@/components/events/CreateCubeForm";
import { useCurrentUser } from "@/store/auth.store";
import { useDataActions } from "@/store/data.store";
import { type CubeEvent } from "@/types";

const CreateCubePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { createEvent } = useDataActions();

  const handleCreateEvent = (
    eventData: Omit<
      CubeEvent,
      "id" | "organizer" | "participants" | "status" | "report"
    >
  ) => {
    if (!currentUser) {
      alert("You must be logged in to create an event.");
      return;
    }
    createEvent(eventData, currentUser);
    alert("Event created successfully!");
    navigate("/cubes");
  };

  return (
    <CreateCubeForm
      onCreateEvent={handleCreateEvent}
      onCancel={() => navigate("/cubes")}
    />
  );
};

export default CreateCubePage;
