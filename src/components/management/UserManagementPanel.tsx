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
      <div className="space-y-6 border-2 border-black bg-white p-8">
        <div className="border-b border-black pb-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start space-x-3">
              <ChatBubbleLeftRightIcon className="mt-1 h-6 w-6 flex-shrink-0 text-black" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-black">Send Message</h3>
                <p className="text-sm text-red leading-relaxed">
                  Reach out to this member directly via email
                </p>
              </div>
            </div>
            <button 
              onClick={onSendMessage} 
              className="btn-info whitespace-nowrap px-6 py-3 text-sm font-semibold"
            >
              Send Email
            </button>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex items-center space-x-3 mb-3">
            <PencilIcon className="h-6 w-6 flex-shrink-0 text-black" />
            <h3 className="text-xl font-bold text-black">Assign Role</h3>
          </div>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
            className="block w-full border-2 border-black bg-white p-3 text-black text-sm"
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
          className="w-full bg-primary px-6 py-3 font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 text-sm"
        >
          {user.role === Role.CHAPTER_ORGANISER &&
          selectedRole === Role.CHAPTER_ORGANISER
            ? 'Edit Organised Chapters'
            : 'Save Role'}
        </button>

        {canEditChapters && (
          <button
            onClick={onOpenEditChaptersModal}
            className="mt-4 w-full border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black transition-colors"
          >
            Edit Chapter Memberships
          </button>
        )}
        {canAwardBadges && (
          <button
            onClick={onOpenAwardBadgeModal}
            className="mt-4 flex w-full items-center justify-center border-2 border-red bg-white px-6 py-3 font-bold text-black hover:bg-red transition-colors"
          >
            <TrophyIcon className="mr-2 h-6 w-6" />
            Award Recognition
          </button>
        )}
      </div>
    </section>
  );
};

export default UserManagementPanel;
