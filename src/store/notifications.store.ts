import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type Notification } from '@/types';

import { processedNotifications } from './initialData';

export interface NotificationsState {
  notifications: Notification[];
}

export interface NotificationsActions {
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ) => void;
  addNotifications: (
    notifications: Omit<Notification, 'id' | 'createdAt' | 'isRead'>[]
  ) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
}

export const useNotificationsStore = create<
  NotificationsState & NotificationsActions
>()(
  persist(
    (set) => ({
      notifications: processedNotifications,
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          id: `notif_${Date.now()}`,
          createdAt: new Date(),
          isRead: false,
          ...notificationData,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },
      addNotifications: (notificationsData) => {
        const newNotifications: Notification[] = notificationsData.map(
          (data, index) => ({
            id: `notif_${Date.now()}_${index}`,
            createdAt: new Date(),
            isRead: false,
            ...data,
          })
        );
        if (newNotifications.length > 0) {
          set((state) => ({
            notifications: [...newNotifications, ...state.notifications],
          }));
        }
      },
      markNotificationAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        })),
      markAllNotificationsAsRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId && !n.isRead ? { ...n, isRead: true } : n
          ),
        })),
    }),
    { name: 'notifications-store' }
  )
);

export const useNotificationsState = () =>
  useNotificationsStore((s) => s.notifications);
export const useNotificationsActions = () =>
  useNotificationsStore((s) => ({
    addNotification: s.addNotification,
    addNotifications: s.addNotifications,
    markNotificationAsRead: s.markNotificationAsRead,
    markAllNotificationsAsRead: s.markAllNotificationsAsRead,
  }));

// Selectors
export const useNotificationsForUser = (userId?: string) =>
  useNotificationsStore((s) => {
    if (!userId) return [];
    return s.notifications
      .filter((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  });

export const useUnreadNotificationCount = (userId?: string) =>
  useNotificationsStore((s) => {
    if (!userId) return 0;
    return s.notifications.filter((n) => n.userId === userId && !n.isRead)
      .length;
  });
