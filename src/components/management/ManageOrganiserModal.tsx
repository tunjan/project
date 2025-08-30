import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import Modal from '@/components/ui/Modal';
import { getAssignableRoles } from '@/config/permissions';
import { PencilIcon, UsersIcon } from '@/icons';
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

    // Regional organisers can manage chapter organisers in their country
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

    // Global admins and godmode can manage anyone
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

      // If changing to chapter organiser, also update chapter assignments
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
    } catch (error) {
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
    } catch (error) {
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
      <Modal
        title="Access Denied"
        onClose={onClose}
        description="You don't have permission to manage this user."
      >
        <div className="my-6 text-center">
          <p className="font-semibold text-danger">
            You don't have permission to manage {organiser.name}.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={`Manage ${organiser.name}`}
      onClose={onClose}
      description="Update role and chapter assignments for this organiser."
    >
      <div className="my-6 space-y-6">
        {/* User Info */}
        <div className="flex items-center space-x-3 border-b border-black pb-4">
          <img
            src={organiser.profilePictureUrl}
            alt={organiser.name}
            className="rounded-nonefull size-12 object-cover"
          />
          <div>
            <h3 className="text-lg font-bold text-black">{organiser.name}</h3>
            <p className="text-sm text-neutral-600">{organiser.email}</p>
            <p className="text-xs text-neutral-500">
              Current role: {organiser.role}
            </p>
          </div>
        </div>

        {/* Role Management */}
        <div>
          <h4 className="mb-3 flex items-center text-sm font-bold text-black">
            <PencilIcon className="mr-2 size-4" />
            Change Role
          </h4>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
            className="w-full border-2 border-black bg-white p-2 text-black"
          >
            {assignableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            onClick={handleRoleChange}
            disabled={selectedRole === organiser.role || isLoading}
            className="hover:bg-red mt-2 w-full bg-black px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </button>
        </div>

        {/* Chapter Assignment Management */}
        {selectedRole === Role.CHAPTER_ORGANISER && (
          <div>
            <h4 className="mb-3 flex items-center text-sm font-bold text-black">
              <UsersIcon className="mr-2 size-4" />
              Manage Chapter Assignments
            </h4>
            <div className="max-h-48 space-y-2 overflow-y-auto border border-black p-4">
              {manageableChapters.map((chapter) => (
                <label
                  key={chapter.name}
                  className="flex cursor-pointer items-center space-x-3 p-2 hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedChapters.includes(chapter.name)}
                    onChange={() => handleChapterCheckboxChange(chapter.name)}
                    className="size-4 accent-primary"
                  />
                  <span className="font-semibold text-black">
                    {chapter.name}
                  </span>
                  <span className="text-sm text-neutral-500">
                    ({chapter.country})
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleChapterAssignmentChange}
              disabled={isLoading}
              className="mt-2 w-full bg-black px-4 py-2 font-bold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Chapter Assignments'}
            </button>
          </div>
        )}

        {/* Current Chapter Assignments Display */}
        {organiser.organiserOf && organiser.organiserOf.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-bold text-black">
              Current Chapter Assignments
            </h4>
            <div className="space-y-1">
              {organiser.organiserOf.map((chapterName) => {
                const chapter = allChapters.find((c) => c.name === chapterName);
                return (
                  <div
                    key={chapterName}
                    className="flex items-center justify-between bg-white p-2"
                  >
                    <span className="font-semibold text-black">
                      {chapterName}
                    </span>
                    {chapter && (
                      <span className="text-xs text-neutral-500">
                        {chapter.country}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ManageOrganiserModal;
