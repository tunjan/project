import React from "react";
import { useNavigate } from "react-router-dom";
import CreateAnnouncementFormComponent from "@/components/announcements/CreateAnnouncementForm";
import { useCurrentUser } from "@/store/auth.store";
import { useDataActions } from "@/store/data.store";
import { type AnnouncementScope } from "@/types";

const CreateAnnouncementPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { createAnnouncement } = useDataActions();

  const handleCreate = (data: {
    title: string;
    content: string;
    scope: AnnouncementScope;
    target?: string;
  }) => {
    if (currentUser) {
      createAnnouncement(data, currentUser);
      alert("Announcement created successfully!");
      navigate("/announcements");
    }
  };

  const handleCancel = () => {
    navigate("/announcements");
  };

  return (
    <CreateAnnouncementFormComponent
      onCreate={handleCreate}
      onCancel={handleCancel}
    />
  );
};

export default CreateAnnouncementPage;
