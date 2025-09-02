import React from 'react';

import * as Icons from '@/icons';
import { NotificationType } from '@/types';

// Map notification types to their corresponding icons
const notificationIconMap: Record<
  NotificationType,
  React.ComponentType<{ className?: string }>
> = {
  [NotificationType.NEW_APPLICANT]: Icons.UserAddIcon,
  [NotificationType.CHAPTER_JOIN_REQUEST]: Icons.UserAddIcon,
  [NotificationType.ACCOMMODATION_REQUEST]: Icons.HomeIcon,
  [NotificationType.REQUEST_ACCEPTED]: Icons.CheckCircleIcon,
  [NotificationType.RSVP_REQUEST]: Icons.BellIcon,
  [NotificationType.RSVP_APPROVED]: Icons.CheckCircleIcon,
  [NotificationType.CHAPTER_JOIN_APPROVED]: Icons.CheckCircleIcon,
  [NotificationType.BADGE_AWARD_ACCEPTED]: Icons.CheckCircleIcon,
  [NotificationType.REQUEST_DENIED]: Icons.XCircleIcon,
  [NotificationType.RSVP_DENIED]: Icons.XCircleIcon,
  [NotificationType.EVENT_CANCELLED]: Icons.XCircleIcon,
  [NotificationType.REMOVED_FROM_EVENT]: Icons.XCircleIcon,
  [NotificationType.BADGE_AWARD_REJECTED]: Icons.XCircleIcon,
  [NotificationType.EVENT_UPDATED]: Icons.PencilIcon,
  [NotificationType.NEW_ANNOUNCEMENT]: Icons.MegaphoneIcon,
  [NotificationType.INACTIVITY_ALERT]: Icons.ExclamationTriangleIcon,
  [NotificationType.BADGE_AWARDED]: Icons.TrophyIcon,
  [NotificationType.STATS_UPDATED]: Icons.ChartBarIcon,
  [NotificationType.ROLE_UPDATED]: Icons.KeyIcon,
  [NotificationType.CHAPTER_MEMBERSHIP_UPDATED]: Icons.BuildingOfficeIcon,
};

export const getNotificationIcon = (
  type: NotificationType
): React.ReactNode => {
  const iconProps = { className: 'h-6 w-6' };
  const IconComponent = notificationIconMap[type] || Icons.BellIcon;
  return <IconComponent {...iconProps} />;
};
