import React from 'react';

import * as Icons from '@/icons';
import { NotificationType } from '@/types';

export const getNotificationIcon = (
  type: NotificationType
): React.ReactNode => {
  const iconProps = { className: 'h-6 w-6' };
  switch (type) {
    case NotificationType.NEW_APPLICANT:
    case NotificationType.CHAPTER_JOIN_REQUEST:
      return <Icons.UserAddIcon {...iconProps} />;
    case NotificationType.ACCOMMODATION_REQUEST:
      return <Icons.HomeIcon {...iconProps} />;
    case NotificationType.REQUEST_ACCEPTED:
    case NotificationType.RSVP_APPROVED:
    case NotificationType.CHAPTER_JOIN_APPROVED:
    case NotificationType.BADGE_AWARD_ACCEPTED:
      return <Icons.CheckCircleIcon {...iconProps} />;
    case NotificationType.REQUEST_DENIED:
    case NotificationType.RSVP_DENIED:
    case NotificationType.EVENT_CANCELLED:
    case NotificationType.REMOVED_FROM_EVENT:
    case NotificationType.BADGE_AWARD_REJECTED:
      return <Icons.XCircleIcon {...iconProps} />;
    case NotificationType.EVENT_UPDATED:
      return <Icons.PencilIcon {...iconProps} />;
    case NotificationType.NEW_ANNOUNCEMENT:
      return <Icons.MegaphoneIcon {...iconProps} />;
    case NotificationType.INACTIVITY_ALERT:
      return <Icons.ExclamationTriangleIcon {...iconProps} />;
    case NotificationType.BADGE_AWARDED:
      return <Icons.TrophyIcon {...iconProps} />;
    case NotificationType.STATS_UPDATED:
      return <Icons.ChartBarIcon {...iconProps} />;
    case NotificationType.ROLE_UPDATED:
      return <Icons.KeyIcon {...iconProps} />;
    case NotificationType.CHAPTER_MEMBERSHIP_UPDATED:
      return <Icons.BuildingOfficeIcon {...iconProps} />;
    default:
      return <Icons.BellIcon {...iconProps} />;
  }
};
