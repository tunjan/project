import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { type Chapter, type User } from '@/types';

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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chapter Memberships</DialogTitle>
          <DialogDescription>
            Select the chapters {user.name} is a member of.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6">
          <div className="max-h-64 space-y-3 overflow-y-auto rounded border border-border p-4">
            {allChapters
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((chapter) => (
                <div key={chapter.name} className="flex items-center space-x-3">
                  <Checkbox
                    id={chapter.name}
                    checked={selectedChapters.includes(chapter.name)}
                    onCheckedChange={() => handleCheckboxChange(chapter.name)}
                  />
                  <Label
                    htmlFor={chapter.name}
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <span className="font-bold text-foreground">
                      {chapter.name}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      ({chapter.country})
                    </span>
                  </Label>
                </div>
              ))}
          </div>
        </div>

        <DialogFooter className="flex space-x-4">
          <Button onClick={onClose} variant="outline" className="w-full">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="w-full">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditChaptersModal;
