import React, { useMemo, useState } from 'react';

import { ConfirmationModal } from '@/components/ui';
import { PencilIcon, TrashIcon } from '@/icons';
import { useChaptersActions, useUsers } from '@/store';
import { type Chapter, Role, type User } from '@/types';

import CreateChapterForm from './CreateChapterForm';
import EditChapterModal from './EditChapterModal';
import ManageOrganiserModal from './ManageOrganiserModal';

interface ChapterManagementProps {
  chapters: Chapter[];
  currentUser: User;
}

const ChapterManagement: React.FC<ChapterManagementProps> = ({
  chapters,
  currentUser,
}) => {
  const { createChapter, deleteChapter } = useChaptersActions();
  const allUsers = useUsers();
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);
  const [managingOrganiser, setManagingOrganiser] = useState<User | null>(null);

  const handleDelete = (chapterName: string) => {
    deleteChapter(chapterName);
  };

  const openDeleteModal = (chapterName: string) => {
    setChapterToDelete(chapterName);
    setDeleteModalOpen(true);
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
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (chapterToDelete) {
            handleDelete(chapterToDelete);
          }
        }}
        title="Delete Chapter"
        message={`Are you sure you want to delete the ${chapterToDelete} chapter? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {editingChapter && (
        <EditChapterModal
          chapter={editingChapter}
          onClose={() => setEditingChapter(null)}
          isOpen={!!editingChapter}
        />
      )}

      {managingOrganiser && (
        <ManageOrganiserModal
          organiser={managingOrganiser}
          onClose={() => setManagingOrganiser(null)}
          onUpdate={() => {
            // Force re-render by updating a dependency
            setManagingOrganiser(null);
          }}
        />
      )}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xl font-bold text-black">
            Existing Chapters ({chapters.length})
          </h3>
          <div className="max-h-[70vh] overflow-y-auto border-black bg-white md:border-2">
            <ul className="divide-y-2 divide-black">
              {chapters
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((chapter) => {
                  const organizers =
                    chapterOrganizersMap.get(chapter.name) || [];
                  return (
                    <li
                      key={chapter.name}
                      className="p-4 hover:bg-primary-lightest"
                    >
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
                            className="rounded-nonenone p-2 text-neutral-500 hover:bg-black hover:text-white"
                            aria-label="Edit Chapter"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(chapter.name)}
                            className="rounded-nonenone p-2 text-neutral-500 hover:bg-danger hover:text-white"
                            aria-label="Delete Chapter"
                          >
                            <TrashIcon className="size-4" />
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
                              <button
                                key={org.id}
                                onClick={() => setManagingOrganiser(org)}
                                className="rounded-nonenone flex cursor-pointer items-center space-x-2 p-1 pr-2"
                                title={`Click to manage ${org.name}`}
                              >
                                <img
                                  src={org.profilePictureUrl}
                                  alt={org.name}
                                  className="size-5 object-cover"
                                />
                                <span className="text-xs font-semibold text-black hover:text-primary">
                                  {org.name}
                                </span>
                              </button>
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
