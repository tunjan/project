import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@/icons';
import NotificationModal from './NotificationModal';
import { useCurrentUser } from '@/store/auth.store';
import {
  useNotificationsForUser,
  useUnreadNotificationCount,
  useNotificationsActions,
} from '@/store';
import { type Notification } from '@/types';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { markNotificationAsRead, markAllNotificationsAsRead } =
    useNotificationsActions();

  const notifications = useNotificationsForUser(currentUser?.id);
  const unreadCount = useUnreadNotificationCount(currentUser?.id);

  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close modal on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative border-2 p-2 transition-colors ${
          isOpen
            ? 'border-black bg-white'
            : 'border-transparent hover:border-black focus:border-black'
        }`}
        aria-label={`View notifications (${unreadCount} unread)`}
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <div className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-none border-2 border-white bg-primary"></div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 lg:left-0">
          <NotificationModal
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
