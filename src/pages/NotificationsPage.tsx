import React from 'react';
import { useNavigate } from 'react-router-dom';

import Avatar from '@/components/ui/Avatar';
import { BellIcon } from '@/icons';
import { useNotificationsActions, useNotificationsForUser } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type Notification } from '@/types';
import { safeFormatLocaleString } from '@/utils/date';
import { getNotificationIcon } from '@/utils/notificationUtils';

const NotificationCard: React.FC<{
  notification: Notification;
  onClick: (notification: Notification) => void;
}> = ({ notification, onClick }) => {
  const icon = getNotificationIcon(notification.type);
  const cardClasses = notification.isRead
    ? 'bg-white hover:bg-neutral-50'
    : 'bg-primary-lightest border-primary hover:bg-primary-lightest/80';
  const iconColorClass = notification.isRead
    ? 'text-neutral-500'
    : 'text-primary';

  return (
    <div
      className={`card-brutal cursor-pointer p-4 transition-colors ${cardClasses}`}
      onClick={() => onClick(notification)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(notification);
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-4">
        <div className={`shrink-0 ${iconColorClass}`}>{icon}</div>
        <div className="grow">
          <p
            className={`text-black ${!notification.isRead ? 'font-bold' : ''}`}
          >
            {notification.message}
          </p>
          <p className="text-sm text-neutral-600">
            {safeFormatLocaleString(notification.createdAt, {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>
        {notification.relatedUser && (
          <div className="shrink-0">
            <Avatar
              src={notification.relatedUser.profilePictureUrl}
              alt={notification.relatedUser.name}
              className="size-12"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const notifications = useNotificationsForUser(currentUser?.id);
  const { markNotificationAsRead, markAllNotificationsAsRead } =
    useNotificationsActions();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
    navigate(notification.linkTo);
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      markAllNotificationsAsRead(currentUser.id);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Notifications
        </h1>
        <button onClick={handleMarkAllRead} className="btn-secondary">
          Mark All as Read
        </button>
      </div>
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      ) : (
        <div className="card-brutal card-padding text-center">
          <BellIcon className="mx-auto size-12 text-neutral-500" />
          <h2 className="mt-4 text-xl font-bold">No notifications</h2>
          <p className="mt-1 text-neutral-600">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
