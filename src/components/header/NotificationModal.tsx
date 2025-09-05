import { Bell, X } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type Notification } from '@/types';
import { formatDateSafe } from '@/utils';
import { getNotificationIcon } from '@/utils';

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
      className="w-full rounded-md p-3 text-left transition-colors duration-200 hover:bg-accent"
    >
      <div className="flex items-start space-x-3">
        {!notification.isRead && (
          <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"></div>
        )}
        <div className={`shrink-0 ${iconColorClass}`}>{icon}</div>
        {notification.relatedUser && (
          <Avatar className="size-8 shrink-0">
            <AvatarImage
              src={notification.relatedUser.profilePictureUrl}
              alt={notification.relatedUser.name}
            />
            <AvatarFallback>
              {notification.relatedUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`flex-1 ${
            !notification.isRead ? 'font-semibold' : 'font-normal'
          }`}
        >
          <p className="text-sm leading-tight text-foreground">
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateSafe(
              notification.createdAt,
              (d, o) => d.toLocaleString(undefined, o),
              {
                dateStyle: 'short',
                timeStyle: 'short',
              }
            )}
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-16"
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
      <Card className="flex max-h-[calc(100vh-8rem)] w-full max-w-md flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                onClick={onMarkAllRead}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          {notifications.length > 0 ? (
            <div className="space-y-1 p-3">
              {notifications.slice(0, 5).map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onNotificationClick={onNotificationClick}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm">You have no notifications.</p>
            </div>
          )}
        </CardContent>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3 text-center">
              <Button asChild variant="ghost" size="sm">
                <Link to="/notifications" onClick={onClose} className="text-sm">
                  View All Notifications
                </Link>
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default NotificationModal;
