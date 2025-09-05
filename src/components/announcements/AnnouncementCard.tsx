import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { ROLE_HIERARCHY } from '@/constants';
import { useAnnouncementsActions } from '@/store/announcements.store';
import { useCurrentUser } from '@/store/auth.store';
import { type Announcement, AnnouncementScope, Role } from '@/types';
import { formatDateSafe } from '@/utils';

import EditAnnouncementModal from './EditAnnouncementModal';

const ScopeBadge: React.FC<{ scope: AnnouncementScope; target?: string }> = ({
  scope,
  target,
}) => {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let text = scope.toUpperCase();

  switch (scope) {
    case AnnouncementScope.GLOBAL:
      variant = 'default';
      break;
    case AnnouncementScope.REGIONAL:
      variant = 'secondary';
      text = target ? `${target.toUpperCase()} REGION` : text;
      break;
    case AnnouncementScope.CHAPTER:
      variant = 'outline';
      text = target ? `${target.toUpperCase()} CHAPTER` : text;
      break;
  }

  return (
    <Badge variant={variant} className="text-xs font-bold tracking-wider">
      {text}
    </Badge>
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

  const formattedDate = formatDateSafe(
    announcement.createdAt,
    (d, o) => d.toLocaleDateString(undefined, o),
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

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

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <ScopeBadge
              scope={announcement.scope}
              target={announcement.country || announcement.chapter}
            />
            <div className="flex items-center space-x-2">
              <p
                className="text-sm text-muted-foreground"
                title={formattedDate}
              >
                {relative ?? formattedDate}
              </p>
              {canManage && (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Edit announcement"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Delete announcement"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <h3 className="text-2xl font-bold text-foreground">
            {announcement.title}
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-foreground">
            {announcement.content}
          </p>

          {announcement.ctaLink && (
            <div className="mt-6">
              <Button asChild>
                <a
                  href={announcement.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {announcement.ctaText || 'Learn More'}
                  <ChevronRight className="ml-2 size-4" />
                </a>
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t p-6">
          <div className="flex items-center">
            <Avatar className="size-10">
              <AvatarImage
                src={announcement.author.profilePictureUrl}
                alt={announcement.author.name}
                className="object-cover"
              />
              <AvatarFallback>
                {announcement.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-semibold text-foreground">
                {announcement.author.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {announcement.author.role}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default AnnouncementCard;
