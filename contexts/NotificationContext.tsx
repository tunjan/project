import React, { createContext, useState, useContext, useCallback } from 'react';
import { type Notification } from '../types';
import { NOTIFICATIONS } from '../constants';

interface NotificationContextType {
    notifications: Notification[];
    getUnreadCount: (userId: string) => number;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: (userId: string) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
    addNotifications: (notifications: Omit<Notification, 'id' | 'createdAt' | 'isRead'>[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);

    const getUnreadCount = useCallback((userId: string) => {
        return notifications.filter(n => n.userId === userId && !n.isRead).length;
    }, [notifications]);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    }, []);
    
    const markAllAsRead = useCallback((userId: string) => {
        setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
    }, []);

    const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
        setNotifications(prev => {
             const newNotification: Notification = {
                id: `notif_${prev.length + Date.now()}`,
                createdAt: new Date(),
                isRead: false,
                ...notificationData,
            };
            return [newNotification, ...prev];
        });
    }, []);
    
    const addNotifications = useCallback((notificationDataList: Omit<Notification, 'id' | 'createdAt' | 'isRead'>[]) => {
       setNotifications(prev => {
            const newNotifications: Notification[] = notificationDataList.map((data, i) => ({
                id: `notif_${prev.length + Date.now() + i}`,
                createdAt: new Date(),
                isRead: false,
                ...data
            }));
            return [...newNotifications, ...prev];
       });
    }, []);

    const value = { notifications, getUnreadCount, markAsRead, markAllAsRead, addNotification, addNotifications };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
