/** @type {import('tailwindcss').Config} */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Announcement, type User } from '@/types';
import { processedAnnouncements } from './initialData';

export interface AnnouncementsState {
  announcements: Announcement[];
}

export interface AnnouncementsActions {
  createAnnouncement: (
    data: {
      title: string;
      content: string;
      scope: Announcement['scope'];
      target?: string;
      ctaLink?: string;
      ctaText?: string;
    },
    author: User
  ) => void;
  updateAnnouncement: (
    announcementId: string,
    updateData: Partial<
      Pick<Announcement, 'title' | 'content' | 'ctaLink' | 'ctaText'>
    >
  ) => void;
  deleteAnnouncement: (announcementId: string) => void;
}

export const useAnnouncementsStore = create<AnnouncementsState & AnnouncementsActions>()(
  persist(
    (set) => ({
      announcements: processedAnnouncements,
      createAnnouncement: (data, author) => {
        const newAnnouncement: Omit<Announcement, 'chapter' | 'country'> & {
          chapter?: string;
          country?: string;
        } = {
          id: `ann_${Date.now()}`,
          createdAt: new Date(),
          author,
          title: data.title,
          content: data.content,
          scope: data.scope,
          ctaLink: data.ctaLink,
          ctaText: data.ctaText,
        };

        if (data.scope === 'Chapter' && data.target) {
          newAnnouncement.chapter = data.target;
        } else if (data.scope === 'Regional' && data.target) {
          newAnnouncement.country = data.target;
        }

        set((state) => ({
          announcements: [
            newAnnouncement as Announcement,
            ...state.announcements,
          ],
        }));
      },
      updateAnnouncement: (announcementId, updateData) =>
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === announcementId ? { ...a, ...updateData } : a
          ),
        })),
      deleteAnnouncement: (announcementId) =>
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== announcementId),
        })),
    }),
    { name: 'announcements-store' }
  )
);

export const useAnnouncementsState = () =>
  useAnnouncementsStore((s) => s.announcements);
export const useAnnouncementsActions = () =>
  useAnnouncementsStore((s) => ({
    createAnnouncement: s.createAnnouncement,
    updateAnnouncement: s.updateAnnouncement,
    deleteAnnouncement: s.deleteAnnouncement,
  }));


