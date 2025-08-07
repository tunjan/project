import React from "react";
import { type Notification } from "@/types";
import { BellIcon } from "@/icons";

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
      className="w-full text-left p-3 hover:bg-neutral-100 transition-colors duration-200"
    >
      <div className="flex items-start space-x-3">
        {!notification.isRead && (
          <div className="w-2 h-2 rounded-full bg-[#d81313] mt-1.5 flex-shrink-0"></div>
        )}
        <div
          className={`flex-1 ${
            !notification.isRead ? "font-semibold" : "font-normal"
          }`}
        >
          <p className="text-sm text-black leading-tight">
            {notification.message}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {notification.createdAt.toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
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
    <div className="absolute top-14 right-0 w-80 sm:w-96 bg-white border border-black shadow-lg z-30 animate-fade-in">
      <div className="p-3 border-b border-black flex justify-between items-center">
        <h3 className="font-bold text-black">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-[#d81313] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-neutral-200">
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
            <BellIcon className="w-8 h-8 mx-auto text-neutral-300" />
            <p className="mt-2 text-sm">You have no notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPopover;
