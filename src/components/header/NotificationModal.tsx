import React from 'react';
import { type Notification } from '@/types';
import { BellIcon, XIcon } from '@/icons';
import { Link } from 'react-router-dom';
import { safeFormatLocaleString } from '@/utils/date';

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onNotificationClick,
}) => {
  return (
    <button
      onClick={() => onNotificationClick(notification)}
      className="w-full p-3 text-left transition-colors duration-200 hover:bg-white"
    >
      <div className="flex items-start space-x-3">
        {!notification.isRead && (
          <div className="mt-1.5 h-2 w-2 flex-shrink-0 bg-primary"></div>
        )}
        <div
          className={`flex-1 ${
            !notification.isRead ? 'font-semibold' : 'font-normal'
          }`}
        >
          <p className="text-sm leading-tight text-black">
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {safeFormatLocaleString(notification.createdAt)}
          </p>
        </div>
      </div>
    </button>
  );
};

interface NotificationModalProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onClose,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      tabIndex={-1}
    >
              <div
          className="animate-fade-in animate-scale-in w-full max-w-md border-2 border-black bg-white shadow-brutal"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="document"
        >
        <div className="flex items-center justify-between border-b-2 border-black p-3">
          <h3 className="font-bold text-black">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-white">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-96 divide-y divide-neutral-200 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications
              .slice(0, 5)
              .map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onNotificationClick={onNotificationClick}
                />
              ))
          ) : (
            <div className="p-8 text-center text-neutral-500">
              <BellIcon className="mx-auto h-8 w-8 text-neutral-400" />
              <p className="mt-2 text-sm">You have no notifications.</p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t-2 border-black p-2 text-center">
            <Link
              to="/notifications"
              onClick={onClose}
              className="text-sm font-bold text-primary hover:underline"
            >
              View All Notifications
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
