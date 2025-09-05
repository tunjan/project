import { Pencil, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ROLE_HIERARCHY } from '@/constants';
import { useCurrentUser } from '@/store/auth.store';
import { useUsersActions, useUsersState } from '@/store/users.store';
import { type User } from '@/types';

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
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  if (noteToDelete) {
                    handleDeleteNote(noteToDelete);
                  }
                }}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Organizer Notes</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <div key={note.id} className="border-b pb-3">
                      {editingNoteId === note.id ? (
                        <div>
                          <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows={3}
                            className="mb-2"
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap text-sm">
                            {note.content}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              - {note.authorName} on{' '}
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                            {canManageNote && (
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleStartEdit(note.id, note.content)
                                  }
                                  aria-label="Edit note"
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-destructive"
                                  onClick={() => openDeleteModal(note.id)}
                                  aria-label="Delete note"
                                >
                                  <Trash className="size-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-muted-foreground">
                No notes for this user yet.
              </p>
            )}
          </div>
          <form onSubmit={handleSubmitNote} className="border-t pt-4">
            <Textarea
              placeholder="Add a new note (visible only to organizers)"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={3}
              className="mb-2"
            />
            <Button type="submit" className="w-full">
              <Plus className="mr-2 size-4" />
              Add Note
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default OrganizerNotes;
