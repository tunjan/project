import { ROLE_HIERARCHY } from '@/constants';
import {
  type Chapter,
  type CubeEvent,
  OnboardingStatus,
  Role,
  type User,
} from '@/types';

export enum Permission {
  VIEW_MEMBER_DIRECTORY,
  VIEW_MANAGEMENT_DASHBOARD,
  EDIT_USER_ROLES,
  EDIT_USER_CHAPTERS,
  DELETE_USER,
  VERIFY_USER,
  VIEW_ORGANIZER_NOTES,
  ADD_ORGANIZER_NOTE,

  CREATE_EVENT,
  EDIT_EVENT,
  CANCEL_EVENT,
  LOG_EVENT_REPORT,
  MANAGE_EVENT_PARTICIPANTS,

  CREATE_CHAPTER,
  EDIT_CHAPTER,
  DELETE_CHAPTER,
  MANAGE_INVENTORY,

  CREATE_ANNOUNCEMENT,

  VIEW_ANALYTICS,

  AWARD_BADGE,
}

const ROLES_TO_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.GODMODE]: Object.values(Permission).filter(
    (p): p is Permission => typeof p === 'number'
  ),
  [Role.GLOBAL_ADMIN]: Object.values(Permission).filter(
    (p): p is Permission => typeof p === 'number'
  ),
  [Role.REGIONAL_ORGANISER]: [
    Permission.VIEW_MEMBER_DIRECTORY,
    Permission.VIEW_MANAGEMENT_DASHBOARD,
    Permission.EDIT_USER_ROLES,
    Permission.EDIT_USER_CHAPTERS,
    Permission.DELETE_USER,
    Permission.VERIFY_USER,
    Permission.VIEW_ORGANIZER_NOTES,
    Permission.ADD_ORGANIZER_NOTE,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.CANCEL_EVENT,
    Permission.LOG_EVENT_REPORT,
    Permission.MANAGE_EVENT_PARTICIPANTS,
    Permission.CREATE_CHAPTER,
    Permission.EDIT_CHAPTER,
    Permission.DELETE_CHAPTER,
    Permission.MANAGE_INVENTORY,
    Permission.CREATE_ANNOUNCEMENT,
    Permission.AWARD_BADGE,
    Permission.VIEW_ANALYTICS,
  ],
  [Role.CHAPTER_ORGANISER]: [
    Permission.VIEW_MEMBER_DIRECTORY,
    Permission.VIEW_MANAGEMENT_DASHBOARD,
    Permission.EDIT_USER_ROLES,
    Permission.EDIT_USER_CHAPTERS,
    Permission.DELETE_USER,
    Permission.VERIFY_USER,
    Permission.VIEW_ORGANIZER_NOTES,
    Permission.ADD_ORGANIZER_NOTE,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.CANCEL_EVENT,
    Permission.LOG_EVENT_REPORT,
    Permission.MANAGE_EVENT_PARTICIPANTS,
    Permission.MANAGE_INVENTORY,
    Permission.CREATE_ANNOUNCEMENT,
    Permission.AWARD_BADGE,
    Permission.VIEW_ANALYTICS,
    Permission.EDIT_CHAPTER,
  ],
  [Role.ACTIVIST]: [],
  [Role.APPLICANT]: [],
};

type PermissionContext = {
  targetUser?: User;
  event?: CubeEvent;
  chapterName?: string;
  allChapters?: Chapter[];
};

export const getAssignableRoles = (user: User): Role[] => {
  const userLevel = ROLE_HIERARCHY[user.role];

  if (user.role === Role.GODMODE) {
    return Object.values(Role);
  }

  if (userLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) {
    return Object.values(Role).filter(
      (role) => role !== Role.GODMODE && ROLE_HIERARCHY[role] <= userLevel
    );
  }

  if (user.role === Role.CHAPTER_ORGANISER) {
    return Object.values(Role).filter(
      (role) => role !== Role.GODMODE && ROLE_HIERARCHY[role] < userLevel
    );
  }

  return [];
};

const canManageTargetUser = (
  user: User,
  context: PermissionContext
): boolean => {
  if (!context.targetUser) return false;

  if (ROLE_HIERARCHY[user.role] <= ROLE_HIERARCHY[context.targetUser.role])
    return false;

  if (user.role === Role.REGIONAL_ORGANISER) {
    if (
      !user.managedCountry ||
      !context.allChapters ||
      !context.targetUser?.chapters
    )
      return false;
    const targetUser = context.targetUser;
    const targetUserCountries = new Set(
      context.allChapters
        .filter((c) => targetUser.chapters.includes(c.name))
        .map((c) => c.country)
    );
    return targetUserCountries.has(user.managedCountry);
  }

  if (user.role === Role.CHAPTER_ORGANISER) {
    const managedChapters = new Set(user.organiserOf || []);
    return context.targetUser.chapters.some((chapter) =>
      managedChapters.has(chapter)
    );
  }

  return true;
};

const canManageEvent = (user: User, context: PermissionContext): boolean => {
  const { event, allChapters } = context;
  if (!event) return false;

  if (user.id === event.organizer.id) return true;

  if (
    user.role === Role.CHAPTER_ORGANISER &&
    (user.organiserOf || []).includes(event.city)
  ) {
    return true;
  }

  const userLevel = ROLE_HIERARCHY[user.role];
  if (userLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) {
    const eventChapter = allChapters?.find((c) => c.name === event.city);
    if (!eventChapter) return false;
    if (user.role === Role.REGIONAL_ORGANISER) {
      return user.managedCountry === eventChapter.country;
    }

    if (userLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN]) {
      return true;
    }
  }

  return false;
};

const canManageChapter = (user: User, context: PermissionContext): boolean => {
  if (!context.chapterName || !context.allChapters) return false;

  const targetChapter = context.allChapters.find(
    (c) => c.name === context.chapterName
  );
  if (!targetChapter) return false;

  if (user.role === Role.REGIONAL_ORGANISER) {
    if (!user.managedCountry) return false;
    return targetChapter.country === user.managedCountry;
  }

  if (user.role === Role.CHAPTER_ORGANISER) {
    return (user.organiserOf || []).includes(context.chapterName);
  }

  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN];
};

export const can = (
  user: User | null | undefined,
  permission: Permission,
  context: PermissionContext = {}
): boolean => {
  if (!user) {
    return false;
  }

  if (user.role === Role.GODMODE) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('GODMODE permission granted in production environment');
    }
    return true;
  }

  const userPermissions = ROLES_TO_PERMISSIONS[user.role];
  if (!userPermissions || !userPermissions.includes(permission)) {
    return false;
  }

  switch (permission) {
    case Permission.EDIT_USER_ROLES:
    case Permission.DELETE_USER: {
      return canManageTargetUser(user, context);
    }

    case Permission.EDIT_USER_CHAPTERS: {
      return canManageTargetUser(user, context);
    }

    case Permission.VIEW_ORGANIZER_NOTES:
    case Permission.ADD_ORGANIZER_NOTE: {
      return canManageTargetUser(user, context);
    }

    case Permission.VERIFY_USER: {
      if (!context.targetUser) return false;
      if (context.targetUser.onboardingStatus === OnboardingStatus.CONFIRMED)
        return false;

      if (ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER])
        return true;

      if (user.role === Role.CHAPTER_ORGANISER) {
        const organisedChapters = new Set(user.organiserOf || []);
        return context.targetUser.chapters.some((ch) =>
          organisedChapters.has(ch)
        );
      }
      return false;
    }
    case Permission.EDIT_EVENT:
    case Permission.CANCEL_EVENT:
    case Permission.LOG_EVENT_REPORT: {
      return canManageEvent(user, context);
    }

    case Permission.MANAGE_EVENT_PARTICIPANTS: {
      return canManageEvent(user, context);
    }

    case Permission.AWARD_BADGE: {
      if (!context.targetUser) return false;

      if (user.id === context.targetUser.id) return false;

      return canManageTargetUser(user, context);
    }

    case Permission.VIEW_MEMBER_DIRECTORY:
    case Permission.VIEW_MANAGEMENT_DASHBOARD:
    case Permission.CREATE_EVENT:
    case Permission.CREATE_CHAPTER:
    case Permission.CREATE_ANNOUNCEMENT:
    case Permission.VIEW_ANALYTICS:
      return true;

    case Permission.DELETE_CHAPTER: {
      if (user.role === Role.CHAPTER_ORGANISER) {
        return false;
      }
      return canManageChapter(user, context);
    }

    case Permission.EDIT_CHAPTER: {
      return canManageChapter(user, context);
    }

    case Permission.MANAGE_INVENTORY: {
      return canManageChapter(user, context);
    }

    default:
      return false;
  }
};
