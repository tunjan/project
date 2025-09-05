import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from '@/components/ui';
import { Checkbox } from '@/components/ui/checkbox';
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            Select which chapter(s) {userToManage.name} will organize.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6">
          {promotableChapters.length > 0 ? (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-4">
              {promotableChapters.map((chapter) => (
                <div key={chapter.name} className="flex items-center space-x-3">
                  <Checkbox
                    id={`chapter-${chapter.name}`}
                    checked={selectedChapters.includes(chapter.name)}
                    onCheckedChange={() => handleCheckboxChange(chapter.name)}
                  />
                  <Label
                    htmlFor={`chapter-${chapter.name}`}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-medium">{chapter.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({chapter.country})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border bg-muted p-4 text-center">
              <p className="font-semibold">No promotable chapters found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentUser?.role === Role.REGIONAL_ORGANISER
                  ? `This user is not a member of any chapters within your managed region (${currentUser.managedCountry}).`
                  : 'This user is not a member of any chapters.'}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              promotableChapters.length === 0 || selectedChapters.length === 0
            }
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteToOrganiserModal;
