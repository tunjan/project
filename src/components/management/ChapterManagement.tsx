import { Pencil, Trash } from 'lucide-react';
import React, { useMemo, useState } from 'react';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { can, Permission } from '@/config';
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
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the {chapterToDelete} chapter?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (chapterToDelete) {
                  handleDelete(chapterToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            setManagingOrganiser(null);
          }}
        />
      )}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Chapters ({chapters.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Organizers</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chapters
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((chapter) => {
                      const organizers =
                        chapterOrganizersMap.get(chapter.name) || [];
                      return (
                        <TableRow key={chapter.name}>
                          <TableCell className="font-medium">
                            {chapter.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {chapter.country}
                          </TableCell>
                          <TableCell>
                            {organizers.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {organizers.map((org) => (
                                  <Button
                                    key={org.id}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setManagingOrganiser(org)}
                                    className="h-auto p-1"
                                    title={`Click to manage ${org.name}`}
                                  >
                                    <Avatar className="size-5">
                                      <AvatarImage
                                        src={org.profilePictureUrl}
                                        alt={org.name}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {org.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="ml-2 text-xs">
                                      {org.name}
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                No organizers assigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {can(currentUser, Permission.EDIT_CHAPTER, {
                                chapterName: chapter.name,
                                allChapters: chapters,
                              }) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingChapter(chapter)}
                                  aria-label="Edit Chapter"
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              )}
                              {can(currentUser, Permission.DELETE_CHAPTER, {
                                chapterName: chapter.name,
                                allChapters: chapters,
                              }) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteModal(chapter.name)}
                                  aria-label="Delete Chapter"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash className="size-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create New Chapter</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateChapterForm
                currentUser={currentUser}
                onCreateChapter={createChapter}
                chapters={chapters}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ChapterManagement;
