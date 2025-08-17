import React, { useState } from 'react';
import { type Announcement, AnnouncementScope, Role } from '@/types';
import { useCurrentUser } from '@/store/auth.store';
import { ROLE_HIERARCHY } from '@/utils/auth';
import { PencilIcon, TrashIcon } from '@/icons';
import EditAnnouncementModal from './EditAnnouncementModal';
import { useAnnouncementsActions } from '@/store/announcements.store';
import { toast } from 'sonner';

interface AnnouncementCardProps {
  announcement: Announcement;
}

const ScopeBadge: React.FC<{ scope: AnnouncementScope; target?: string }> = ({
  scope,
  target,
}) => {
  let bgColor = 'bg-black';
  let textColor = 'text-white';
  let text = scope.toUpperCase();

  switch (scope) {
    case AnnouncementScope.GLOBAL:
      bgColor = 'bg-primary';
      break;
    case AnnouncementScope.REGIONAL:
      bgColor = 'bg-black';
      text = target ? `${target.toUpperCase()} REGION` : text;
      break;
    case AnnouncementScope.CHAPTER:
      bgColor = 'bg-neutral-200';
      textColor = 'text-black';
      text = target ? `${target.toUpperCase()} CHAPTER` : text;
      break;
  }

  return (
    <span
      className={`px-2.5 py-1 text-xs font-bold tracking-wider ${bgColor} ${textColor}`}
    >
      {text}
    </span>
  );
};

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
}) => {
  const currentUser = useCurrentUser();
  const { deleteAnnouncement } = useAnnouncementsActions();
  const [isEditing, setIsEditing] = useState(false);

  const formattedDate = new Date(announcement.createdAt).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  if (!currentUser) return null;

  const canManage =
    currentUser.id === announcement.author.id ||
    ROLE_HIERARCHY[currentUser.role] >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN];

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(announcement.id);
      toast.success('Announcement deleted.');
    }
  };

  return (
    <>
      {isEditing && (
        <EditAnnouncementModal
          announcement={announcement}
          onClose={() => setIsEditing(false)}
        />
      )}
      <div className="overflow-hidden border-2 border-black bg-white">
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <ScopeBadge
              scope={announcement.scope}
              target={announcement.country || announcement.chapter}
            />
            <div className="flex items-center space-x-2">
              <p className="text-sm text-neutral-500">{formattedDate}</p>
              {canManage && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-neutral-500 hover:text-black"
                    aria-label="Edit announcement"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 text-neutral-500 hover:text-primary"
                    aria-label="Delete announcement"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-black">
            {announcement.title}
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-neutral-700">
            {announcement.content}
          </p>

          <div className="mt-6 flex items-center border-t border-neutral-200 pt-4">
            <img
              className="h-10 w-10 object-cover"
              src={announcement.author.profilePictureUrl}
              alt={announcement.author.name}
            />
            <div className="ml-3">
              <p className="text-sm font-semibold text-black">
                {announcement.author.name}
              </p>
              <p className="text-xs text-neutral-500">
                {announcement.author.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementCard;
