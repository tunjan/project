import { Role, User, AnnouncementScope } from '@/types';

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.APPLICANT]: 0,
  [Role.ACTIVIST]: 1,
  [Role.CHAPTER_ORGANISER]: 2,
  [Role.REGIONAL_ORGANISER]: 3,
  [Role.GLOBAL_ADMIN]: 4,
  [Role.GODMODE]: 5,
};

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
