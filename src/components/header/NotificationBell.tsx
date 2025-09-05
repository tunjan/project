import { Bell } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useNotificationsActions, useNotificationsState } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type Notification } from '@/types';

import NotificationModal from './NotificationModal';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allNotifications = useNotificationsState();
  const { markNotificationAsRead, markAllNotificationsAsRead } =
    useNotificationsActions();

  const [isOpen, setIsOpen] = useState(false);

  const { notifications, unreadCount } = useMemo(() => {
    if (!currentUser?.id) {
      return { notifications: [], unreadCount: 0 };
    }

    const userNotifications = allNotifications.filter(
      (n) => n.userId === currentUser.id
    );

    const sortedNotifications = userNotifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const unreadCount = userNotifications.filter((n) => !n.isRead).length;

    return {
      notifications: sortedNotifications,
      unreadCount,
    };
  }, [allNotifications, currentUser?.id]);

  const handleNotificationClick = useMemo(
    () => (notification: Notification) => {
      if (!notification.isRead) {
        markNotificationAsRead(notification.id);
      }
      setIsOpen(false);
      navigate(notification.linkTo);
    },
    [markNotificationAsRead, navigate]
  );

  const handleMarkAllRead = useMemo(
    () => () => {
      if (currentUser) {
        markAllNotificationsAsRead(currentUser.id);
      }
    },
    [markAllNotificationsAsRead, currentUser]
  );

  const handleToggleOpen = useMemo(() => () => setIsOpen((prev) => !prev), []);

  const handleClose = useMemo(() => () => setIsOpen(false), []);

  return (
    <div className="relative">
      <Button
        onClick={handleToggleOpen}
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={`View notifications (${unreadCount} unread)`}
      >
        <Bell className="size-6" />
        {unreadCount > 0 && (
          <div className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-primary"></div>
        )}
      </Button>

      {isOpen && (
        <NotificationModal
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default NotificationBell;
