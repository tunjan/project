import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateAnnouncementFormComponent from '@/components/announcements/CreateAnnouncementForm';
import { useCurrentUser } from '@/store/auth.store';
import { type AnnouncementScope } from '@/types';
import { useAnnouncementsActions } from '@/store/announcements.store';
import { toast } from 'sonner';

const CreateAnnouncementPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { createAnnouncement } = useAnnouncementsActions();

  const handleCreate = (data: {
    title: string;
    content: string;
    scope: AnnouncementScope;
    target?: string;
  }) => {
    if (currentUser) {
      createAnnouncement(data, currentUser);
      toast.success('Announcement created successfully!');
      navigate('/announcements');
    }
  };

  const handleCancel = () => {
    navigate('/announcements');
  };

  return (
    <CreateAnnouncementFormComponent
      onCreate={handleCreate}
      onCancel={handleCancel}
    />
  );
};

export default CreateAnnouncementPage;
