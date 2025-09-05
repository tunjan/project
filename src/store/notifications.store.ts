import { useMemo } from 'react';
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
export const useNotificationsActions = () => {
  const store = useNotificationsStore();
  return useMemo(
    () => ({
      addNotification: store.addNotification,
      addNotifications: store.addNotifications,
      markNotificationAsRead: store.markNotificationAsRead,
      markAllNotificationsAsRead: store.markAllNotificationsAsRead,
    }),
    [
      store.addNotification,
      store.addNotifications,
      store.markNotificationAsRead,
      store.markAllNotificationsAsRead,
    ]
  );
};

export const useNotificationsForUser = (userId?: string) => {
  const notifications = useNotificationsStore((s) => s.notifications);
  return useMemo(() => {
    if (!userId) return [];
    return notifications.filter((n) => n.userId === userId);
  }, [notifications, userId]);
};

export const useUnreadNotificationCount = (userId?: string) => {
  const notifications = useNotificationsStore((s) => s.notifications);
  return useMemo(() => {
    if (!userId) return 0;
    return notifications.filter((n) => n.userId === userId && !n.isRead).length;
  }, [notifications, userId]);
};
