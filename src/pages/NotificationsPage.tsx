import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import { useNotificationsForUser, useNotificationsActions } from '@/store';
import { type Notification } from '@/types';
import { BellIcon } from '@/icons';

const NotificationCard: React.FC<{
  notification: Notification;
  onClick: (notification: Notification) => void;
}> = ({ notification, onClick }) => (
  <div
    className={`card-brutal card-padding cursor-pointer ${
      notification.isRead ? 'bg-white' : 'bg-primary-light'
    }`}
    onClick={() => onClick(notification)}
  >
    <div className="flex items-start gap-4">
      {notification.relatedUser && (
        <img
          src={notification.relatedUser.profilePictureUrl}
          alt={notification.relatedUser.name}
          className="h-10 w-10 rounded-none border-2 border-black object-cover"
        />
      )}
      <div>
        <p className="font-bold text-black">{notification.message}</p>
        <p className="text-sm text-neutral-600">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  </div>
);

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
          <BellIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h2 className="mt-4 text-xl font-bold">No notifications</h2>
          <p className="mt-1 text-neutral-600">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
