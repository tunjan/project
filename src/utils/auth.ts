import { ROLE_HIERARCHY } from '@/constants';
import { AnnouncementScope, Role, User } from '@/types';

export const getPostableScopes = (user: User): AnnouncementScope[] => {
  const userRole = user.role;

  if (ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN]) {
    return [
      AnnouncementScope.GLOBAL,
      AnnouncementScope.REGIONAL,
      AnnouncementScope.CHAPTER,
    ];
  }
  if (userRole === Role.REGIONAL_ORGANISER) {
    return [AnnouncementScope.REGIONAL, AnnouncementScope.CHAPTER];
  }
  if (userRole === Role.CHAPTER_ORGANISER) {
    return [AnnouncementScope.CHAPTER];
  }
  return [];
};
