import { create } from 'zustand';
import { type Notification } from '@/types';
import { NOTIFICATIONS } from '@/constants';

interface NotificationState {
    notifications: Notification[];
}

interface NotificationActions {
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: (userId: string) => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>((set) => ({
    notifications: NOTIFICATIONS,
    addNotification: (notificationData) => {
        const newNotification: Notification = {
            id: `notif_${Date.now()}`,
            createdAt: new Date(),
            isRead: false,
            ...notificationData,
        };
        set(state => ({ notifications: [newNotification, ...state.notifications] }));
    },
    markAsRead: (notificationId) => {
        set(state => ({
            notifications: state.notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n),
        }));
    },
    markAllAsRead: (userId) => {
        set(state => ({
            notifications: state.notifications.map(n => (n.userId === userId && !n.isRead) ? { ...n, isRead: true } : n),
        }));
    },
}));

export const useNotificationsForUser = (userId: string) =>
    useNotificationStore(state => state.notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));

export const useUnreadNotificationCount = (userId: string) =>
    useNotificationStore(state => state.notifications.filter(n => n.userId === userId && !n.isRead).length);

export const useNotificationActions = () => useNotificationStore(state => ({
    addNotification: state.addNotification,
    markAsRead: state.markAsRead,
    markAllAsRead: state.markAllAsRead
}));