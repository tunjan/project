import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type EventComment, type User } from '@/types';
import { processedEventComments } from './initialData';

export interface CommentsState {
  eventComments: EventComment[];
}

export interface CommentsActions {
  postComment: (eventId: string, content: string, author: User) => void;
}

export const useCommentsStore = create<CommentsState & CommentsActions>()(
  persist(
    (set) => ({
      eventComments: processedEventComments,
      postComment: (eventId, content, author) => {
        const newComment: EventComment = {
          id: `comment_${Date.now()}`,
          eventId,
          content,
          author,
          createdAt: new Date(),
        };
        set((state) => ({ eventComments: [...state.eventComments, newComment] }));
      },
    }),
    { name: 'comments-store' }
  )
);

export const useEventCommentsState = () => useCommentsStore((s) => s.eventComments);
export const useCommentsActions = () => useCommentsStore((s) => ({ postComment: s.postComment }));


