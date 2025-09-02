import React, { useState } from 'react';
import { toast } from 'sonner';

import { InputField, TextAreaField } from '@/components/ui';
import { Modal } from '@/components/ui';
import { useAnnouncementsActions } from '@/store/announcements.store';
import { type Announcement } from '@/types';

interface EditAnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
  isOpen: boolean;
}

const EditAnnouncementModal: React.FC<EditAnnouncementModalProps> = ({
  announcement,
  onClose,
  isOpen,
}) => {
  const { updateAnnouncement } = useAnnouncementsActions();
  const [title, setTitle] = useState(announcement.title);
  const [content, setContent] = useState(announcement.content);
  const [ctaLink, setCtaLink] = useState(announcement.ctaLink || '');
  const [ctaText, setCtaText] = useState(announcement.ctaText || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnnouncement(announcement.id, { title, content, ctaLink, ctaText });
    toast.success('Announcement updated successfully.');
    onClose();
  };

  return (
    <Modal title="Edit Announcement" onClose={onClose} isOpen={isOpen}>
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

        <div className="mt-4 space-y-4 border-t-2 border-black pt-4">
          <h3 className="text-lg font-bold text-black">
            Optional: Call to Action
          </h3>
          <InputField
            label="CTA Link"
            id="edit-ctaLink"
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            placeholder="https://example.com/more-info"
          />
          <InputField
            label="CTA Button Text"
            id="edit-ctaText"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="Learn More"
          />
        </div>
        <div className="flex items-center space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-black"
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
