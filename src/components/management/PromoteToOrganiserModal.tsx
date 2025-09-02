import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Modal } from '@/components/ui';
import { useChapters } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { Role, type User } from '@/types';

interface PromoteToOrganiserModalProps {
  userToManage: User;
  onClose: () => void;
  onConfirm: (chapters: string[]) => void;
}

const PromoteToOrganiserModal: React.FC<PromoteToOrganiserModalProps> = ({
  userToManage,
  onClose,
  onConfirm,
}) => {
  const currentUser = useCurrentUser();
  const allChapters = useChapters();
  const isEditing = userToManage.role === Role.CHAPTER_ORGANISER;
  const [selectedChapters, setSelectedChapters] = useState<string[]>(
    isEditing ? userToManage.organiserOf || [] : []
  );

  const promotableChapters = useMemo(() => {
    if (!currentUser) return [];
    if (
      currentUser.role === Role.REGIONAL_ORGANISER &&
      currentUser.managedCountry
    ) {
      const countryChapters = allChapters.filter(
        (c) => c.country === currentUser.managedCountry
      );
      return countryChapters.filter((c) =>
        userToManage.chapters?.includes(c.name)
      );
    }
    if (
      currentUser.role === Role.GLOBAL_ADMIN ||
      currentUser.role === Role.GODMODE
    ) {
      return allChapters.filter((c) => userToManage.chapters?.includes(c.name));
    }
    return [];
  }, [currentUser, userToManage, allChapters]);

  const handleCheckboxChange = (chapterName: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterName)
        ? prev.filter((c) => c !== chapterName)
        : [...prev, chapterName]
    );
  };

  const handleSubmit = () => {
    if (selectedChapters.length === 0) {
      toast.error('An organiser must be assigned to at least one chapter.');
      return;
    }
    onConfirm(selectedChapters);
  };

  const modalTitle = isEditing
    ? 'Edit Organised Chapters'
    : 'Promote to Chapter Organiser';
  const buttonText = isEditing ? 'Save Changes' : 'Promote User';

  return (
    <Modal
      title={modalTitle}
      onClose={onClose}
      description={`Select which chapter(s) ${userToManage.name} will organize.`}
    >
      <div className="my-6">
        {promotableChapters.length > 0 ? (
          <div className="max-h-64 space-y-2 overflow-y-auto border border-black p-4">
            {promotableChapters.map((chapter) => (
              <label
                key={chapter.name}
                className="flex cursor-pointer items-center space-x-3 p-2 hover:bg-white"
              >
                <input
                  type="checkbox"
                  checked={selectedChapters.includes(chapter.name)}
                  onChange={() => handleCheckboxChange(chapter.name)}
                  className="size-5 accent-primary"
                />
                <span className="font-bold text-black">{chapter.name}</span>
                <span className="text-sm text-neutral-500">
                  ({chapter.country})
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="border border-black bg-white p-4 text-center">
            <p className="font-bold text-black">
              No promotable chapters found.
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {currentUser?.role === Role.REGIONAL_ORGANISER
                ? `This user is not a member of any chapters within your managed region (${currentUser.managedCountry}).`
                : 'This user is not a member of any chapters.'}
            </p>
          </div>
        )}
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
          disabled={
            promotableChapters.length === 0 || selectedChapters.length === 0
          }
          className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};

export default PromoteToOrganiserModal;
