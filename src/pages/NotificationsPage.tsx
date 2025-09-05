import { Bell } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
} from '@/components/ui';
import { useNotificationsActions, useNotificationsForUser } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type Notification } from '@/types';
import { cn, formatDateSafe, getNotificationIcon } from '@/utils';

const NotificationCard: React.FC<{
  notification: Notification;
  onClick: (notification: Notification) => void;
}> = ({ notification, onClick }) => {
  const icon = getNotificationIcon(notification.type);
  const cardClasses = !notification.isRead ? 'border-primary bg-primary/5' : '';
  const iconColorClass = !notification.isRead ? 'text-primary' : '';

  return (
    <Card
      className={cn('cursor-pointer transition-colors', cardClasses)}
      onClick={() => onClick(notification)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(notification);
      }}
      role="button"
      tabIndex={0}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn('shrink-0', iconColorClass)}>{icon}</div>
          <div className="grow">
            <p className={cn(!notification.isRead && 'font-semibold')}>
              {notification.message}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDateSafe(
                notification.createdAt,
                (d, o) => d.toLocaleString(undefined, o),
                {
                  dateStyle: 'long',
                  timeStyle: 'short',
                }
              )}
            </p>
          </div>
          {notification.relatedUser && (
            <div className="shrink-0">
              <Avatar className="size-12">
                <AvatarImage
                  src={notification.relatedUser.profilePictureUrl}
                  alt={notification.relatedUser.name}
                  className="object-cover"
                />
                <AvatarFallback>
                  {notification.relatedUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Notifications
        </h1>
        <Button onClick={handleMarkAllRead} variant="outline">
          Mark All as Read
        </Button>
      </div>
      {notifications.length > 0 ? (
        <div className="max-h-[calc(100vh-16rem)] space-y-4 overflow-y-auto pr-2">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Bell className="mx-auto size-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No notifications</h2>
          <p className="mt-1 text-muted-foreground">You're all caught up!</p>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
