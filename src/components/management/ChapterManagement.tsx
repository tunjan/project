import React from "react";
import { type Chapter, type User } from "@/types";
import CreateChapterForm from "./CreateChapterForm";

interface ChapterManagementProps {
  chapters: Chapter[];
  currentUser: User;
  onCreateChapter: (chapterData: Chapter) => void;
}

const ChapterManagement: React.FC<ChapterManagementProps> = ({
  chapters,
  currentUser,
  onCreateChapter,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-black mb-4">
          Existing Chapters ({chapters.length})
        </h2>
        <div className="bg-white border border-black max-h-96 overflow-y-auto">
          <ul className="divide-y divide-black">
            {chapters
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((chapter) => (
                <li
                  key={chapter.name}
                  className="p-3 flex justify-between items-center"
                >
                  <span className="font-bold">{chapter.name}</span>
                  <span className="text-sm text-neutral-500">
                    {chapter.country}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-black mb-4">
          Create New Chapter
        </h2>
        <CreateChapterForm
          currentUser={currentUser}
          onCreateChapter={onCreateChapter}
          chapters={chapters}
        />
      </div>
    </div>
  );
};

export default ChapterManagement;
