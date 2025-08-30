import React from 'react';
import { Link } from 'react-router-dom';

import Avatar from '@/components/ui/Avatar';
import { BellIcon, XIcon } from '@/icons';
import { type Notification } from '@/types';
import { safeFormatLocaleString } from '@/utils/date';
import { getNotificationIcon } from '@/utils/notificationUtils';

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onNotificationClick,
}) => {
  const icon = getNotificationIcon(notification.type);
  const iconColorClass = notification.isRead
    ? 'text-neutral-400'
    : 'text-primary';

  return (
    <button
      onClick={() => onNotificationClick(notification)}
      className="w-full p-3 text-left transition-colors duration-200 hover:bg-neutral-100"
    >
      <div className="flex items-start space-x-3">
        {!notification.isRead && (
          <div className="rounded-nonefull mt-1.5 size-2 shrink-0 bg-primary"></div>
        )}
        <div className={`shrink-0 ${iconColorClass}`}>{icon}</div>
        {notification.relatedUser && (
          <Avatar
            src={notification.relatedUser.profilePictureUrl}
            alt={notification.relatedUser.name}
            className="size-8 shrink-0"
          />
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
            {safeFormatLocaleString(notification.createdAt, {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
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
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {/* Backdrop for closing */}
      <button
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        className="animate-fade-in animate-scale-in w-full max-w-md border-2 border-black bg-neutral-50 shadow-brutal"
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
              <XIcon className="size-5" />
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
              <BellIcon className="mx-auto size-8 text-neutral-400" />
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
