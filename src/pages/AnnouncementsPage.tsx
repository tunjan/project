import React, { useState } from 'react';
import { toast } from 'sonner';

import AnnouncementsPageComponent from '@/components/announcements/AnnouncementsPage';
import CreateAnnouncementForm from '@/components/announcements/CreateAnnouncementForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAnnouncementsActions } from '@/store/announcements.store';
import { useCurrentUser } from '@/store/auth.store';
import { type AnnouncementScope } from '@/types';

const AnnouncementsPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const { createAnnouncement } = useAnnouncementsActions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateAnnouncement = (data: {
    title: string;
    content: string;
    scope: AnnouncementScope;
    target?: string;
    ctaLink?: string;
    ctaText?: string;
  }) => {
    if (currentUser) {
      createAnnouncement(data, currentUser);
      toast.success('Announcement created successfully!');
      setIsCreateModalOpen(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <AnnouncementsPageComponent onCreate={handleCreate} />

      {/* Create Announcement Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Your message will be visible to the audience defined by the
              selected scope.
            </DialogDescription>
          </DialogHeader>
          <CreateAnnouncementForm
            onCreate={handleCreateAnnouncement}
            onCancel={handleCancelCreate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnouncementsPage;
