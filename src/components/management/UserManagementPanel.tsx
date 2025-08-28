import React, { useState } from 'react';
import { User, Role } from '@/types';
import { getAssignableRoles } from '@/config/permissions';
import { toast } from 'sonner';
import { PencilIcon, TrophyIcon, ChatBubbleLeftRightIcon } from '@/icons';

interface UserManagementPanelProps {
  user: User;
  currentUser: User;
  canEditChapters: boolean;
  canAwardBadges: boolean;
  onUpdateRole: (userId: string, role: Role) => void;
  onSetChapterOrganiser: (userId: string, chaptersToOrganise: string[]) => void;
  onOpenPromoteModal: () => void;
  onOpenEditChaptersModal: () => void;
  onOpenAwardBadgeModal: () => void;
  onSendMessage: () => void;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  user,
  currentUser,
  canEditChapters,
  canAwardBadges,
  onUpdateRole,
  onOpenPromoteModal,
  onOpenEditChaptersModal,
  onOpenAwardBadgeModal,
  onSendMessage,
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const assignableRoles = getAssignableRoles(currentUser);

  const handleSaveRole = () => {
    // If the selected role is Chapter Organiser, always open the modal.
    // This handles both promotion and editing chapters for an existing organiser.
    if (selectedRole === Role.CHAPTER_ORGANISER) {
      onOpenPromoteModal();
    } else if (selectedRole !== user.role) {
      // Handle other role changes only if the role is different
      onUpdateRole(user.id, selectedRole);
      toast.success(`${user.name}'s role has been updated to ${selectedRole}.`);
    }
  };

  return (
    <section>
      <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
        Manage User
      </h2>
      <div className="space-y-4 border-2 border-black bg-white p-6">
        <div className="border-b border-black pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="mr-3 h-5 w-5 text-black" />
              <div>
                <h3 className="text-lg font-bold text-black">Send Message</h3>
                <p className="text-sm text-red">
                  Reach out to this member directly
                </p>
              </div>
            </div>
            <button onClick={onSendMessage} className="btn-info">
              Send Email
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <PencilIcon className="mr-3 h-5 w-5 text-black" />
          <h3 className="text-lg font-bold text-black">Assign Role</h3>
        </div>
        <select
          id="role-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role)}
          className="block w-full border-2 border-black bg-white p-2 text-black"
        >
          <option value={user.role} disabled>
            {user.role} (Current)
          </option>
          {assignableRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          onClick={handleSaveRole}
          disabled={
            selectedRole === user.role && user.role !== Role.CHAPTER_ORGANISER
          }
          className="w-full bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {user.role === Role.CHAPTER_ORGANISER &&
          selectedRole === Role.CHAPTER_ORGANISER
            ? 'Edit Organised Chapters'
            : 'Save Role'}
        </button>

        {canEditChapters && (
          <button
            onClick={onOpenEditChaptersModal}
            className="mt-2 w-full border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Edit Chapter Memberships
          </button>
        )}
        {canAwardBadges && (
          <button
            onClick={onOpenAwardBadgeModal}
            className="mt-2 flex w-full items-center justify-center border-2 border-red bg-white px-4 py-2 font-bold text-black hover:bg-red"
          >
            <TrophyIcon className="mr-2 h-5 w-5" />
            Award Recognition
          </button>
        )}
      </div>
    </section>
  );
};

export default UserManagementPanel;
