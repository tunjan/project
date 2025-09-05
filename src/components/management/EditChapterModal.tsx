import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChaptersActions } from '@/store';
import { type Chapter } from '@/types';

interface EditChapterModalProps {
  chapter: Chapter;
  onClose: () => void;
  isOpen: boolean;
}

const EditChapterModal: React.FC<EditChapterModalProps> = ({
  chapter,
  onClose,
  isOpen,
}) => {
  const { updateChapter } = useChaptersActions();
  const [country, setCountry] = useState(chapter.country);
  const [lat, setLat] = useState(String(chapter.lat));
  const [lng, setLng] = useState(String(chapter.lng));
  const [instagram, setInstagram] = useState(chapter.instagram || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateChapter(chapter.name, {
      country,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      instagram: instagram || undefined,
    });
    toast.success(`${chapter.name} chapter updated.`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {chapter.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram Handle</Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                step="any"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                step="any"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 pt-4">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChapterModal;
