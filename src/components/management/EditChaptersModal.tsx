import React, { useState } from "react";
import { type User, type Chapter } from "@/types";

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
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border-4 border-black p-8 relative w-full max-w-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-black">
            Edit Chapter Memberships
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Select the chapters <span className="font-bold">{user.name}</span>{" "}
            is a member of.
          </p>
        </div>

        <div className="my-6">
          <div className="space-y-2 border border-black p-4 max-h-64 overflow-y-auto">
            {allChapters
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((chapter) => (
                <label
                  key={chapter.name}
                  className="flex items-center space-x-3 p-2 hover:bg-neutral-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedChapters.includes(chapter.name)}
                    onChange={() => handleCheckboxChange(chapter.name)}
                    className="h-5 w-5 accent-[#d81313]"
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
            className="w-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="w-full bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditChaptersModal;
