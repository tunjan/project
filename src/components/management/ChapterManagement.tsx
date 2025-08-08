import React, { useState, useMemo } from 'react';
import { type Chapter, type User, Role } from '@/types';
import CreateChapterForm from './CreateChapterForm';
import { PencilIcon, TrashIcon } from '@/icons';
import { useAppActions, useUsers } from '@/store/appStore';
import EditChapterModal from './EditChapterModal';

interface ChapterManagementProps {
  chapters: Chapter[];
  currentUser: User;
}

const ChapterManagement: React.FC<ChapterManagementProps> = ({
  chapters,
  currentUser,
}) => {
  const { createChapter, deleteChapter } = useAppActions();
  const allUsers = useUsers();
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  const handleDelete = (chapterName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the ${chapterName} chapter? This cannot be undone.`
      )
    ) {
      deleteChapter(chapterName);
    }
  };

  const chapterOrganizersMap = useMemo(() => {
    const map = new Map<string, User[]>();
    const organizers = allUsers.filter(
      (u) => u.role === Role.CHAPTER_ORGANISER && u.organiserOf
    );
    for (const org of organizers) {
      for (const chapterName of org.organiserOf!) {
        if (!map.has(chapterName)) {
          map.set(chapterName, []);
        }
        map.get(chapterName)!.push(org);
      }
    }
    return map;
  }, [allUsers]);

  return (
    <>
      {editingChapter && (
        <EditChapterModal
          chapter={editingChapter}
          onClose={() => setEditingChapter(null)}
        />
      )}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xl font-bold text-black">
            Existing Chapters ({chapters.length})
          </h3>
          <div className="max-h-[70vh] overflow-y-auto border border-black bg-white">
            <ul className="divide-y divide-black">
              {chapters
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((chapter) => {
                  const organizers =
                    chapterOrganizersMap.get(chapter.name) || [];
                  return (
                    <li key={chapter.name} className="p-4 hover:bg-neutral-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold">{chapter.name}</span>
                          <span className="ml-2 text-sm text-neutral-500">
                            ({chapter.country})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingChapter(chapter)}
                            className="p-1 text-neutral-500 hover:text-black"
                            aria-label="Edit Chapter"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(chapter.name)}
                            className="p-1 text-neutral-500 hover:text-red-600"
                            aria-label="Delete Chapter"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 pl-2">
                        <p className="text-xs font-bold uppercase text-neutral-500">
                          Organizers ({organizers.length})
                        </p>
                        {organizers.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {organizers.map((org) => (
                              <div
                                key={org.id}
                                className="flex items-center space-x-2 rounded-none bg-neutral-100 p-1 pr-2"
                              >
                                <img
                                  src={org.profilePictureUrl}
                                  alt={org.name}
                                  className="h-5 w-5 object-cover"
                                />
                                <span className="text-xs font-semibold">
                                  {org.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-neutral-500">
                            No organizers assigned.
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-xl font-bold text-black">
            Create New Chapter
          </h3>
          <CreateChapterForm
            currentUser={currentUser}
            onCreateChapter={createChapter}
            chapters={chapters}
          />
        </div>
      </div>
    </>
  );
};

export default ChapterManagement;
