import React, { useMemo, useState } from 'react';
import { MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  useAnnouncementCommentsState,
  useCommentsActions,
} from '@/store/comments.store';
import { useCurrentUser } from '@/store/auth.store';
import { type AnnouncementComment } from '@/types';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface AnnouncementCommentsProps {
  announcementId: string;
}

const AnnouncementComments: React.FC<AnnouncementCommentsProps> = ({
  announcementId,
}) => {
  const currentUser = useCurrentUser();
  const allComments = useAnnouncementCommentsState();
  const { postAnnouncementComment } = useCommentsActions();
  const [isExpanded, setIsExpanded] = useState(false);

  const comments = useMemo(() => {
    return allComments
      .filter(
        (comment: AnnouncementComment) =>
          comment.announcementId === announcementId
      )
      .sort(
        (a: AnnouncementComment, b: AnnouncementComment) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [allComments, announcementId]);

  const handleSubmitComment = (content: string) => {
    if (currentUser) {
      postAnnouncementComment(announcementId, content, currentUser);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="flex h-auto items-center justify-center gap-2 p-0 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <MessageCircle className="size-4" />
          {comments.length === 0
            ? 'Add a comment'
            : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <Separator />

          {/* Comment Form */}
          <CommentForm
            onSubmit={handleSubmitComment}
            currentUser={currentUser}
            placeholder="Share your thoughts on this announcement..."
          />

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-3">
                {comments.map((comment: AnnouncementComment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnnouncementComments;
