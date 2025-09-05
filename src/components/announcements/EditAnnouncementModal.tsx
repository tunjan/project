import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>

          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <h3 className="text-lg font-bold text-foreground">
              Optional: Call to Action
            </h3>
            <div className="space-y-2">
              <Label htmlFor="edit-ctaLink">CTA Link</Label>
              <Input
                id="edit-ctaLink"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="https://example.com/more-info"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ctaText">CTA Button Text</Label>
              <Input
                id="edit-ctaText"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Learn More"
              />
            </div>
          </div>

          <DialogFooter className="flex space-x-4 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAnnouncementModal;
