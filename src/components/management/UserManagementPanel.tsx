import React from 'react';

import {
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  UserGroupIcon,
} from '@/icons';
import { Role, User } from '@/types';

interface UserManagementPanelProps {
  user: User;
  currentUser: User;
  canEditChapters: boolean;
  canAwardBadges: boolean;
  onUpdateRole: (userId: string, newRole: Role) => void;
  onSetChapterOrganiser: (
    userId: string,
    chapterName: string,
    isOrganiser: boolean
  ) => void;
  onOpenPromoteModal: () => void;
  onOpenEditChaptersModal: () => void;
  onOpenAwardBadgeModal: () => void;
  onSendMessage: (userId: string) => void;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  user,
  canEditChapters,
  canAwardBadges,
  onOpenPromoteModal,
  onOpenEditChaptersModal,
  onOpenAwardBadgeModal,
  onSendMessage,
}) => {
  return (
    <section>
      <h2 className="h-section">User Management</h2>
      <div className="space-y-4">
        {/* Role Management */}
        <div className="border-black bg-white p-4 md:border-2">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-black">
            <UserGroupIcon className="size-5" />
            Role Management
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">
              Current Role: <span className="font-bold">{user.role}</span>
            </p>
            <button
              onClick={onOpenPromoteModal}
              className="w-full bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              Promote to Organiser
            </button>
          </div>
        </div>

        {/* Chapter Management */}
        {canEditChapters && (
          <div className="border-black bg-white p-4 md:border-2">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-black">
              <BuildingOfficeIcon className="size-5" />
              Chapter Management
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-neutral-600">
                Chapters: {user.chapters?.join(', ') || 'None'}
              </p>
              <button
                onClick={onOpenEditChaptersModal}
                className="w-full bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary-hover"
              >
                Edit Chapters
              </button>
            </div>
          </div>
        )}

        {/* Recognition Management */}
        {canAwardBadges && (
          <div className="border-black bg-white p-4 md:border-2">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-black">
              <StarIcon className="size-5" />
              Recognition Management
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-neutral-600">
                Current Recognitions: {user.badges?.length || 0}
              </p>
              <button
                onClick={onOpenAwardBadgeModal}
                className="w-full bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary-hover"
              >
                Award Recognition
              </button>
            </div>
          </div>
        )}

        {/* Communication */}
        <div className="border-black bg-white p-4 md:border-2">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-black">
            <ChatBubbleLeftRightIcon className="size-5" />
            Communication
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onSendMessage(user.id)}
              className="w-full bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserManagementPanel;
