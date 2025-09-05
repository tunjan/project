import { Loader2, Pencil, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAssignableRoles } from '@/config';
import { useChapters, useUsersActions } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { Role, User } from '@/types';

interface ManageOrganiserModalProps {
  organiser: User;
  onClose: () => void;
  onUpdate: () => void;
}

const ManageOrganiserModal: React.FC<ManageOrganiserModalProps> = ({
  organiser,
  onClose,
  onUpdate,
}) => {
  const currentUser = useCurrentUser();
  const allChapters = useChapters();
  const { updateUserRole, setChapterOrganiser } = useUsersActions();

  const [selectedRole, setSelectedRole] = useState<Role>(organiser.role);
  const [selectedChapters, setSelectedChapters] = useState<string[]>(
    organiser.organiserOf || []
  );
  const [isLoading, setIsLoading] = useState(false);

  const assignableRoles = useMemo(() => {
    if (!currentUser) return [];
    return getAssignableRoles(currentUser);
  }, [currentUser]);

  const manageableChapters = useMemo(() => {
    if (!currentUser) return [];

    if (
      currentUser.role === Role.REGIONAL_ORGANISER &&
      currentUser.managedCountry
    ) {
      return allChapters.filter(
        (c) => c.country === currentUser.managedCountry
      );
    }

    if (
      currentUser.role === Role.GLOBAL_ADMIN ||
      currentUser.role === Role.GODMODE
    ) {
      return allChapters;
    }

    return [];
  }, [currentUser, allChapters]);

  const canManageThisUser = useMemo(() => {
    if (!currentUser) return false;

    if (
      currentUser.role === Role.REGIONAL_ORGANISER &&
      currentUser.managedCountry
    ) {
      return (
        organiser.organiserOf?.some((chapterName) => {
          const chapter = allChapters.find((c) => c.name === chapterName);
          return chapter?.country === currentUser.managedCountry;
        }) || false
      );
    }

    if (
      currentUser.role === Role.GLOBAL_ADMIN ||
      currentUser.role === Role.GODMODE
    ) {
      return true;
    }

    return false;
  }, [currentUser, organiser, allChapters]);

  const handleRoleChange = async () => {
    if (selectedRole === organiser.role) return;

    setIsLoading(true);
    try {
      await updateUserRole(organiser.id, selectedRole);

      if (
        selectedRole === Role.CHAPTER_ORGANISER &&
        selectedChapters.length > 0
      ) {
        await setChapterOrganiser(organiser.id, selectedChapters);
      }

      toast.success(
        `${organiser.name}'s role has been updated to ${selectedRole}`
      );
      onUpdate();
      onClose();
    } catch {
      toast.error('Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterAssignmentChange = async () => {
    if (selectedChapters.length === 0) {
      toast.error('An organiser must be assigned to at least one chapter');
      return;
    }

    setIsLoading(true);
    try {
      await setChapterOrganiser(organiser.id, selectedChapters);
      toast.success(
        `${organiser.name}'s chapter assignments have been updated`
      );
      onUpdate();
      onClose();
    } catch {
      toast.error('Failed to update chapter assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterCheckboxChange = (chapterName: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterName)
        ? prev.filter((c) => c !== chapterName)
        : [...prev, chapterName]
    );
  };

  if (!canManageThisUser) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
            <DialogDescription>
              You don't have permission to manage this user.
            </DialogDescription>
          </DialogHeader>
          <div className="my-6 text-center">
            <p className="font-semibold text-destructive">
              You don't have permission to manage {organiser.name}.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage {organiser.name}</DialogTitle>
          <DialogDescription>
            Update role and chapter assignments for this organiser.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-6">
          {/* User Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Avatar className="size-12">
                  <AvatarImage
                    src={organiser.profilePictureUrl}
                    alt={organiser.name}
                  />
                  <AvatarFallback>{organiser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{organiser.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {organiser.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current role: {organiser.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Pencil className="mr-2 size-4" />
                Change Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-select">Select Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as Role)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleRoleChange}
                disabled={selectedRole === organiser.role || isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isLoading ? 'Updating...' : 'Update Role'}
              </Button>
            </CardContent>
          </Card>

          {/* Chapter Assignment Management */}
          {selectedRole === Role.CHAPTER_ORGANISER && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Users className="mr-2 size-4" />
                  Manage Chapter Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-48 space-y-3 overflow-y-auto">
                  {manageableChapters.map((chapter) => (
                    <div
                      key={chapter.name}
                      className="flex items-center space-x-3 rounded-md border p-3"
                    >
                      <Checkbox
                        id={`chapter-${chapter.name}`}
                        checked={selectedChapters.includes(chapter.name)}
                        onCheckedChange={() =>
                          handleChapterCheckboxChange(chapter.name)
                        }
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
                <Button
                  onClick={handleChapterAssignmentChange}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  {isLoading ? 'Updating...' : 'Update Chapter Assignments'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Chapter Assignments Display */}
          {organiser.organiserOf && organiser.organiserOf.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Current Chapter Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {organiser.organiserOf.map((chapterName) => {
                    const chapter = allChapters.find(
                      (c) => c.name === chapterName
                    );
                    return (
                      <div
                        key={chapterName}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <span className="font-medium">{chapterName}</span>
                        {chapter && (
                          <span className="text-sm text-muted-foreground">
                            {chapter.country}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageOrganiserModal;
