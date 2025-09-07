import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  type AnnouncementComment,
  type EventComment,
  type User,
} from '@/types';

import { processedEventComments } from './initialData';

export interface CommentsState {
  eventComments: EventComment[];
  announcementComments: AnnouncementComment[];
}

export interface CommentsActions {
  postComment: (eventId: string, content: string, author: User) => void;
  postAnnouncementComment: (
    announcementId: string,
    content: string,
    author: User
  ) => void;
}

export const useCommentsStore = create<CommentsState & CommentsActions>()(
  persist(
    (set) => ({
      eventComments: processedEventComments,
      announcementComments: [],
      postComment: (eventId, content, author) => {
        const newComment: EventComment = {
          id: `comment_${Date.now()}`,
          eventId,
          content,
          author,
          createdAt: new Date(),
        };
        set((state) => ({
          eventComments: [...state.eventComments, newComment],
        }));
      },
      postAnnouncementComment: (announcementId, content, author) => {
        const newComment: AnnouncementComment = {
          id: `ann_comment_${Date.now()}`,
          announcementId,
          content,
          author,
          createdAt: new Date(),
        };
        set((state) => ({
          announcementComments: [...state.announcementComments, newComment],
        }));
      },
    }),
    { name: 'comments-store' }
  )
);

export const useEventCommentsState = () =>
  useCommentsStore((s) => s.eventComments);
export const useAnnouncementCommentsState = () =>
  useCommentsStore((s) => s.announcementComments);
export const useCommentsActions = () => {
  const store = useCommentsStore();
  return useMemo(
    () => ({
      postComment: store.postComment,
      postAnnouncementComment: store.postAnnouncementComment,
    }),
    [store.postComment, store.postAnnouncementComment]
  );
};
