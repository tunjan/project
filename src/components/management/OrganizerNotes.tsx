import React, { useState } from 'react';
import { type User } from '@/types';
import { useCurrentUser } from '@/store/auth.store';
import { useUsersActions, useUsersState } from '@/store/users.store';
import { ROLE_HIERARCHY } from '@/utils/auth';
import { toast } from 'sonner';
import { PencilIcon, TrashIcon, PlusIcon } from '@/icons';
import { TextAreaField } from '@/components/ui/Form';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface OrganizerNotesProps {
  user: User;
}

const OrganizerNotes: React.FC<OrganizerNotesProps> = ({ user }) => {
  const currentUser = useCurrentUser();
  const allUsers = useUsersState();
  const { addOrganizerNote, editOrganizerNote, deleteOrganizerNote } =
    useUsersActions();
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleStartEdit = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedContent('');
  };

  const handleSaveEdit = () => {
    if (!editingNoteId) return;
    editOrganizerNote(user.id, editingNoteId, editedContent);
    toast.success('Note updated.');
    handleCancelEdit();
  };

  const handleDeleteNote = (noteId: string) => {
    deleteOrganizerNote(user.id, noteId);
    toast.success('Note deleted.');
  };

  const openDeleteModal = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteModalOpen(true);
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteContent.trim()) {
      addOrganizerNote(user.id, noteContent, currentUser);
      setNoteContent('');
      toast.success('Note added.');
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (noteToDelete) {
            handleDeleteNote(noteToDelete);
          }
        }}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <section>
        <h2 className="h-section">Organizer Notes</h2>
        <div className="card-brutal space-y-4 p-6">
          <div className="max-h-64 space-y-4 overflow-y-auto pr-2">
            {user.organizerNotes && user.organizerNotes.length > 0 ? (
              [...user.organizerNotes]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((note) => {
                  const author = allUsers.find((u) => u.id === note.authorId);
                  const authorLevel = author ? ROLE_HIERARCHY[author.role] : -1;
                  const currentUserLevel = ROLE_HIERARCHY[currentUser.role];

                  const canManageNote =
                    currentUser.id === note.authorId ||
                    (authorLevel !== -1 && currentUserLevel > authorLevel);

                  return (
                    <div key={note.id} className="border-b-2 border-black pb-3">
                      {editingNoteId === note.id ? (
                        <div>
                          <TextAreaField
                            label="Edit note"
                            id={`edit-note-${note.id}`}
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows={3}
                          />
                          <div className="mt-2 flex items-center space-x-2">
                            <button
                              onClick={handleCancelEdit}
                              className="text-red text-xs font-semibold hover:underline"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="bg-primary px-2 py-1 text-xs font-bold text-white"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap text-sm text-black">
                            {note.content}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-neutral-500">
                              - {note.authorName} on{' '}
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                            {canManageNote && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    handleStartEdit(note.id, note.content)
                                  }
                                  className="text-neutral-500 hover:text-black"
                                  aria-label="Edit note"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(note.id)}
                                  className="text-neutral-500 hover:text-primary"
                                  aria-label="Delete note"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-neutral-500">
                No notes for this user yet.
              </p>
            )}
          </div>
          <form
            onSubmit={handleSubmitNote}
            className="border-t-2 border-black pt-4"
          >
            <TextAreaField
              label="Add a new note (visible only to organizers)"
              id="organizer-note"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={3}
            />
            <button
              type="submit"
              className="card-brutal-hover mt-2 flex w-full items-center justify-center bg-black py-2 font-bold text-white"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Note
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default OrganizerNotes;
