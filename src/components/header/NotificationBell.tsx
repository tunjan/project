import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BellIcon } from '@/icons';
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
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative border-2 p-2 transition-colors ${
          isOpen
            ? 'border-black bg-white'
            : 'border-transparent hover:border-black focus:border-black'
        }`}
        aria-label={`View notifications (${unreadCount} unread)`}
      >
        <BellIcon className="size-6" />
        {unreadCount > 0 && (
          <div className="rounded-nonenone absolute right-1.5 top-1.5 size-2.5 border-2 border-white bg-primary"></div>
        )}
      </button>

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
