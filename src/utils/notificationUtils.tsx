import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CheckCircle,
  Home,
  Key,
  Megaphone,
  Pencil,
  Trophy,
  UserPlus,
  XCircle,
} from 'lucide-react';
import React from 'react';

import { NotificationType } from '@/types';

// Map notification types to their corresponding icons
const notificationIconMap: Record<
  NotificationType,
  React.ComponentType<{ className?: string }>
> = {
  [NotificationType.NEW_APPLICANT]: UserPlus,
  [NotificationType.CHAPTER_JOIN_REQUEST]: UserPlus,
  [NotificationType.ACCOMMODATION_REQUEST]: Home,
  [NotificationType.REQUEST_ACCEPTED]: CheckCircle,
  [NotificationType.RSVP_REQUEST]: Bell,
  [NotificationType.RSVP_APPROVED]: CheckCircle,
  [NotificationType.CHAPTER_JOIN_APPROVED]: CheckCircle,
  [NotificationType.BADGE_AWARD_ACCEPTED]: CheckCircle,
  [NotificationType.REQUEST_DENIED]: XCircle,
  [NotificationType.RSVP_DENIED]: XCircle,
  [NotificationType.EVENT_CANCELLED]: XCircle,
  [NotificationType.REMOVED_FROM_EVENT]: XCircle,
  [NotificationType.BADGE_AWARD_REJECTED]: XCircle,
  [NotificationType.EVENT_UPDATED]: Pencil,
  [NotificationType.NEW_ANNOUNCEMENT]: Megaphone,
  [NotificationType.INACTIVITY_ALERT]: AlertTriangle,
  [NotificationType.BADGE_AWARDED]: Trophy,
  [NotificationType.STATS_UPDATED]: BarChart3,
  [NotificationType.ROLE_UPDATED]: Key,
  [NotificationType.CHAPTER_MEMBERSHIP_UPDATED]: Building2,
};

export const getNotificationIcon = (
  type: NotificationType
): React.ReactNode => {
  const iconProps = { className: 'h-6 w-6' };
  const IconComponent = notificationIconMap[type] || Bell;
  return <IconComponent {...iconProps} />;
};
