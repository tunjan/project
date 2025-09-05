import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCommentsActions, useEventComments } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type EventComment } from '@/types';

interface EventCommentCardProps {
  comment: EventComment;
}

const EventCommentCard: React.FC<EventCommentCardProps> = ({ comment }) => {
  const formattedTime = comment.createdAt.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="flex items-start space-x-3 py-4">
      <Avatar className="size-10">
        <AvatarImage
          src={comment.author.profilePictureUrl}
          alt={comment.author.name}
        />
        <AvatarFallback>
          {comment.author.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline space-x-2">
          <p className="font-bold text-foreground">{comment.author.name}</p>
          <p className="text-xs text-muted-foreground">{formattedTime}</p>
        </div>
        <p className="whitespace-pre-wrap text-sm text-foreground">
          {comment.content}
        </p>
      </div>
    </div>
  );
};

interface EventDiscussionProps {
  eventId: string;
}

const EventDiscussion: React.FC<EventDiscussionProps> = ({ eventId }) => {
  const currentUser = useCurrentUser();
  const { postComment } = useCommentsActions();
  const allEventComments = useEventComments();
  const [newComment, setNewComment] = useState('');

  if (!currentUser) return null;

  const comments = allEventComments.filter((c) => c.eventId === eventId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      postComment(eventId, newComment, currentUser);
      setNewComment('');
    }
  };

  return (
    <div className="bg-background">
      <div className="p-2 md:p-4">
        <h2 className="mb-4 text-xl font-bold text-foreground">
          Event Discussion
        </h2>

        <div className="divide-y-2 divide-border">
          {comments.length > 0 ? (
            comments
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
              .map((comment) => (
                <EventCommentCard key={comment.id} comment={comment} />
              ))
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              No comments yet. Start the conversation!
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex items-start space-x-3"
        >
          <Avatar className="size-10">
            <AvatarImage
              src={currentUser.profilePictureUrl}
              alt={currentUser.name}
            />
            <AvatarFallback>
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the discussion..."
              rows={2}
              required
            />
            <Button type="submit" className="mt-2" size="sm">
              Post Comment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventDiscussion;
