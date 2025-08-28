import React, { useState } from 'react';
import { type User, type Chapter } from '@/types';
import Modal from '@/components/ui/Modal';

interface EditChaptersModalProps {
  user: User;
  allChapters: Chapter[];
  onClose: () => void;
  onSave: (chapters: string[]) => void;
}

const EditChaptersModal: React.FC<EditChaptersModalProps> = ({
  user,
  allChapters,
  onClose,
  onSave,
}) => {
  const [selectedChapters, setSelectedChapters] = useState<string[]>(
    user.chapters || []
  );

  const handleCheckboxChange = (chapterName: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterName)
        ? prev.filter((c) => c !== chapterName)
        : [...prev, chapterName]
    );
  };

  const handleSubmit = () => {
    onSave(selectedChapters);
  };

  return (
    <Modal
      title="Edit Chapter Memberships"
      onClose={onClose}
      description={`Select the chapters ${user.name} is a member of.`}
    >
      <div className="my-6">
        <div className="max-h-64 space-y-2 overflow-y-auto border border-black p-4">
          {allChapters
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((chapter) => (
              <label
                key={chapter.name}
                className="flex cursor-pointer items-center space-x-3 p-2 hover:bg-white"
              >
                <input
                  type="checkbox"
                  checked={selectedChapters.includes(chapter.name)}
                  onChange={() => handleCheckboxChange(chapter.name)}
                  className="h-5 w-5 accent-primary"
                />
                <span className="font-bold text-black">{chapter.name}</span>
                <span className="text-sm text-neutral-500">
                  ({chapter.country})
                </span>
              </label>
            ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onClose}
          className="w-full bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-black"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default EditChaptersModal;
