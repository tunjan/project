import { differenceInDays, formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import { toast } from 'sonner';

import Avatar from '@/components/ui/Avatar';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { ChevronRightIcon, PencilIcon, TrashIcon } from '@/icons';
import { useAnnouncementsActions } from '@/store/announcements.store';
import { useCurrentUser } from '@/store/auth.store';
import { type Announcement, AnnouncementScope, Role } from '@/types';
import { ROLE_HIERARCHY } from '@/utils/auth';
import { safeFormatLocaleDate } from '@/utils/date';

import EditAnnouncementModal from './EditAnnouncementModal';

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
      bgColor = 'bg-neutral-300';
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

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
}) => {
  const currentUser = useCurrentUser();
  const { deleteAnnouncement } = useAnnouncementsActions();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formattedDate = safeFormatLocaleDate(announcement.createdAt, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Relative timestamp for recent announcements
  const createdDate = new Date(announcement.createdAt);
  const isRecent = differenceInDays(new Date(), createdDate) < 7;
  const relative = isRecent
    ? formatDistanceToNow(createdDate, { addSuffix: true })
    : null;

  if (!currentUser) return null;

  const canManage =
    currentUser.id === announcement.author.id ||
    ROLE_HIERARCHY[currentUser.role] >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN];

  const handleDelete = () => {
    deleteAnnouncement(announcement.id);
    toast.success('Announcement deleted.');
  };

  return (
    <>
      {isEditing && (
        <EditAnnouncementModal
          announcement={announcement}
          onClose={() => setIsEditing(false)}
          isOpen={isEditing}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <div className="overflow-hidden border-2 border-black bg-white">
        <div className="p-6">
          <div className="mb-4 flex justify-between">
            <ScopeBadge
              scope={announcement.scope}
              target={announcement.country || announcement.chapter}
            />
            <div className="flex items-center space-x-2">
              <p className="text-sm text-neutral-500" title={formattedDate}>
                {relative ?? formattedDate}
              </p>
              {canManage && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-neutral-500 hover:text-black"
                    aria-label="Edit announcement"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-1 text-neutral-500 hover:text-primary"
                    aria-label="Delete announcement"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-black">
            {announcement.title}
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-black">
            {announcement.content}
          </p>

          {announcement.ctaLink && (
            <div className="mt-6">
              <a
                href={announcement.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center"
              >
                {announcement.ctaText || 'Learn More'}
                <ChevronRightIcon className="ml-2 size-4" />
              </a>
            </div>
          )}

          <div className="mt-6 flex items-center border-t border-neutral-200 pt-4">
            <Avatar
              src={announcement.author.profilePictureUrl}
              alt={announcement.author.name}
              className="size-10 object-cover"
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
