import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type AnnouncementComment } from '@/types';
import { formatDateSafe } from '@/utils';

interface CommentItemProps {
  comment: AnnouncementComment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const relative = formatDateSafe(comment.createdAt, (d) =>
    formatDistanceToNow(d, { addSuffix: true })
  );

  const formattedDate = formatDateSafe(comment.createdAt, (d) =>
    d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 flex-shrink-0">
        <AvatarImage
          src={comment.author.profilePictureUrl}
          alt={comment.author.name}
          className="object-cover"
        />
        <AvatarFallback className="text-xs">
          {comment.author.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="rounded-lg bg-muted p-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {comment.author.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {comment.author.role}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {comment.content}
          </p>
        </div>
        <p
          className="ml-3 mt-1 text-xs text-muted-foreground"
          title={formattedDate}
        >
          {relative ?? formattedDate}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
