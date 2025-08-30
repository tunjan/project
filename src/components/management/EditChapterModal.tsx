import React, { useState } from 'react';
import { toast } from 'sonner';

import { InputField } from '@/components/ui/Form';
import Modal from '@/components/ui/Modal';
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
    <Modal title={`Edit ${chapter.name}`} onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Country"
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <InputField
          label="Instagram Handle"
          id="instagram"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          required={false}
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Latitude"
            id="lat"
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            step="any"
          />
          <InputField
            label="Longitude"
            id="lng"
            type="number"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            step="any"
          />
        </div>
        <div className="flex items-center space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-black px-4 py-2 font-bold text-white hover:bg-black"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditChapterModal;
