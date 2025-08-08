import React, { useState } from 'react';
import { type EventComment } from '@/types';
import { useCurrentUser } from '@/store/auth.store';
import { useAppActions, useEventComments } from '@/store/appStore';

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
      <img
        src={comment.author.profilePictureUrl}
        alt={comment.author.name}
        className="h-10 w-10 object-cover"
      />
      <div className="flex-1">
        <div className="flex items-baseline space-x-2">
          <p className="font-bold text-black">{comment.author.name}</p>
          <p className="text-xs text-neutral-500">{formattedTime}</p>
        </div>
        <p className="whitespace-pre-wrap text-sm text-neutral-800">
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
  const { postComment } = useAppActions();
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
    <div className="rounded-none border border-black bg-white">
      <div className="p-6 md:p-8">
        <h2 className="mb-4 text-xl font-bold text-black">Event Discussion</h2>

        <div className="divide-y divide-neutral-200">
          {comments.length > 0 ? (
            comments
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
              .map((comment) => (
                <EventCommentCard key={comment.id} comment={comment} />
              ))
          ) : (
            <p className="py-4 text-center text-sm text-neutral-500">
              No comments yet. Start the conversation!
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex items-start space-x-3"
        >
          <img
            src={currentUser.profilePictureUrl}
            alt={currentUser.name}
            className="h-10 w-10 object-cover"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the discussion..."
              rows={2}
              className="block w-full rounded-none border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
              required
            />
            <button
              type="submit"
              className="mt-2 bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Post Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventDiscussion;
