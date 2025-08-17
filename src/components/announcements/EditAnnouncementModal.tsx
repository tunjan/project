import React, { useState } from 'react';
import { type Announcement } from '@/types';
import { useAnnouncementsActions } from '@/store/announcements.store';
import { InputField, TextAreaField } from '@/components/ui/Form';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

interface EditAnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
}

const EditAnnouncementModal: React.FC<EditAnnouncementModalProps> = ({
  announcement,
  onClose,
}) => {
  const { updateAnnouncement } = useAnnouncementsActions();
  const [title, setTitle] = useState(announcement.title);
  const [content, setContent] = useState(announcement.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnnouncement(announcement.id, { title, content });
    toast.success('Announcement updated successfully.');
    onClose();
  };

  return (
    <Modal title="Edit Announcement" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Title"
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextAreaField
          label="Content"
          id="edit-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
        />
        <div className="flex items-center space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAnnouncementModal;
