import React from 'react';
import { type Notification } from '@/types';
import { BellIcon } from '@/icons';

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
      className="w-full p-3 text-left transition-colors duration-200 hover:bg-neutral-100"
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
            {notification.createdAt.toLocaleString(undefined, {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </p>
        </div>
      </div>
    </button>
  );
};

interface NotificationPopoverProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notifications,
  onNotificationClick,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="animate-fade-in shadow-brutal absolute right-0 top-14 z-30 w-[80vw] max-w-sm border-2 border-black bg-white sm:w-96">
      <div className="flex items-center justify-between border-b-2 border-black p-3">
        <h3 className="font-bold text-black">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 divide-y divide-neutral-200 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onNotificationClick={onNotificationClick}
            />
          ))
        ) : (
          <div className="p-8 text-center text-neutral-500">
            <BellIcon className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-2 text-sm">You have no notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPopover;
