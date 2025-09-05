import { Bell } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  useNotificationsActions,
  useNotificationsForUser,
  useUnreadNotificationCount,
} from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type Notification } from '@/types';

import NotificationModal from './NotificationModal';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { markNotificationAsRead, markAllNotificationsAsRead } =
    useNotificationsActions();

  const notifications = useNotificationsForUser(currentUser?.id);
  const unreadCount = useUnreadNotificationCount(currentUser?.id);

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
    setIsOpen(false);
    navigate(notification.linkTo);
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      markAllNotificationsAsRead(currentUser.id);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
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
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
