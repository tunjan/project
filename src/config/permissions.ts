import { type User, type CubeEvent, Role, OnboardingStatus, type Chapter } from '@/types';
import { ROLE_HIERARCHY } from '@/utils/auth';

// 1. Define every possible action in the system
export enum Permission {
  // User Management
  VIEW_MEMBER_DIRECTORY,
  VIEW_MANAGEMENT_DASHBOARD,
  EDIT_USER_ROLES,
  EDIT_USER_CHAPTERS,
  DELETE_USER,
  VERIFY_USER,
  VIEW_ORGANIZER_NOTES,
  ADD_ORGANIZER_NOTE,

  // Event Management
  CREATE_EVENT,
  EDIT_EVENT,
  CANCEL_EVENT,
  LOG_EVENT_REPORT,
  MANAGE_EVENT_PARTICIPANTS,

  // Chapter Management
  CREATE_CHAPTER,
  EDIT_CHAPTER,
  DELETE_CHAPTER,
  MANAGE_INVENTORY,

  // Announcement Management
  CREATE_ANNOUNCEMENT,

  // Analytics
  VIEW_ANALYTICS,

  // Misc
  AWARD_BADGE,
}

// 2. Map roles to their permissions
const ROLES_TO_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.GODMODE]: Object.values(Permission).filter(
    (p) => typeof p === 'number'
  ) as Permission[], // Godmode can do everything
  [Role.GLOBAL_ADMIN]: Object.values(Permission).filter(
    (p) => typeof p === 'number'
  ) as Permission[],
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
    Permission.EDIT_USER_ROLES, // But with limitations
    Permission.EDIT_USER_CHAPTERS, // FIX: Added missing permission
    Permission.DELETE_USER, // But with chapter-scoped limitations
    Permission.VERIFY_USER, // But with limitations
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
  ],
  [Role.ACTIVIST]: [],
  [Role.APPLICANT]: [],
};

// 3. Create the central permission checker
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

  // Global Admins and Regional Organisers can assign roles up to their own level, but not Godmode.
  if (userLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) {
    return Object.values(Role).filter(
      (role) => role !== Role.GODMODE && ROLE_HIERARCHY[role] <= userLevel
    );
  }

  // Chapter Organisers can only assign roles below their own.
  if (user.role === Role.CHAPTER_ORGANISER) {
    return Object.values(Role).filter(
      (role) =>
        role !== Role.GODMODE && ROLE_HIERARCHY[role] < userLevel
    );
  }

  return [];
};

export const can = (
  user: User | null | undefined,
  permission: Permission,
  context: PermissionContext = {}
): boolean => {
  if (!user) {
    return false;
  }

  const userPermissions = ROLES_TO_PERMISSIONS[user.role];
  if (!userPermissions || !userPermissions.includes(permission)) {
    return false;
  }

  // Handle fine-grained, context-specific rules
  switch (permission) {
    case Permission.EDIT_USER_ROLES:
    case Permission.DELETE_USER: {
      if (!context.targetUser) return false;

      // Rule 1: A user cannot edit someone with an equal or higher role.
      const hasHigherRole = ROLE_HIERARCHY[user.role] > ROLE_HIERARCHY[context.targetUser.role];
      if (!hasHigherRole) return false;

      // Rule 2: Regional Organisers can only manage users within their country.
      if (user.role === Role.REGIONAL_ORGANISER) {
        if (!user.managedCountry || !context.allChapters) return false;
        const targetUserCountries = new Set(
          context.allChapters
            .filter((c) => context.targetUser!.chapters.includes(c.name))
            .map((c) => c.country)
        );
        return targetUserCountries.has(user.managedCountry);
      }

      // Rule 3: Chapter Organisers can only manage users within their chapters.
      if (user.role === Role.CHAPTER_ORGANISER) {
        const managedChapters = new Set(user.organiserOf || []);
        return context.targetUser.chapters.some(chapter => managedChapters.has(chapter));
      }

      return true; // GODMODE and GLOBAL_ADMIN pass if hierarchy is respected
    }

    case Permission.EDIT_USER_CHAPTERS: {
      if (!context.targetUser) return false;

      // FIX: Apply a consistent and stricter hierarchy check for all roles.
      // A user cannot edit someone with an equal or higher role.
      const hasHigherRole = ROLE_HIERARCHY[user.role] > ROLE_HIERARCHY[context.targetUser.role];
      if (!hasHigherRole) return false;

      // Regional Organisers can only manage users within their country.
      if (user.role === Role.REGIONAL_ORGANISER) {
        if (!user.managedCountry || !context.allChapters) return false;
        const targetUserCountries = new Set(
          context.allChapters
            .filter((c) => context.targetUser!.chapters.includes(c.name))
            .map((c) => c.country)
        );
        return targetUserCountries.has(user.managedCountry);
      }

      // Chapter Organisers can only manage users within their chapters.
      if (user.role === Role.CHAPTER_ORGANISER) {
        const managedChapters = new Set(user.organiserOf || []);
        return context.targetUser.chapters.some(chapter => managedChapters.has(chapter));
      }

      return true; // GODMODE and GLOBAL_ADMIN pass if hierarchy is respected
    }
    case Permission.VERIFY_USER: {
      if (!context.targetUser) return false;
      // New flow: allow verification for any user not yet confirmed
      if (context.targetUser.onboardingStatus === OnboardingStatus.CONFIRMED)
        return false;

      // Regional+ can verify anyone
      if (ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER])
        return true;

      // Chapter Organisers can only verify members of their own chapters
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
      const { event, allChapters } = context;
      if (!event) return false;

      // Rule 1: The event's designated organizer can always manage it.
      if (user.id === event.organizer.id) return true;

      // FIX: Add this rule to allow other chapter organizers to also manage the event.
      // Rule 1.5: Any organizer of the event's chapter can manage it.
      if (user.role === Role.CHAPTER_ORGANISER && (user.organiserOf || []).includes(event.city)) {
        return true;
      }

      // Rule 2: Higher-level organizers can manage events based on their scope.
      const userLevel = ROLE_HIERARCHY[user.role];
      if (userLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) {
        const eventChapter = allChapters?.find((c) => c.name === event.city);
        if (!eventChapter) return false; // Cannot determine event location

        // Regional Organisers can manage events within their country.
        if (user.role === Role.REGIONAL_ORGANISER) {
          return user.managedCountry === eventChapter.country;
        }

        // Global Admins and Godmode have universal access.
        if (userLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN]) {
          return true;
        }
      }

      return false;
    }

    case Permission.MANAGE_EVENT_PARTICIPANTS: {
      const { event, allChapters } = context;
      if (!event) return false;

      const userLevel = ROLE_HIERARCHY[user.role];

      // Event organizer can always manage participants
      if (user.id === event.organizer.id) return true;

      // FIX: Add this rule to allow other chapter organizers to also manage event participants.
      // Any organizer of the event's chapter can manage participants
      if (user.role === Role.CHAPTER_ORGANISER && (user.organiserOf || []).includes(event.city)) {
        return true;
      }

      // Higher-level organizers can manage participants based on their scope
      if (userLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) {
        const eventChapter = allChapters?.find((c) => c.name === event.city);
        if (!eventChapter) return false;

        if (user.role === Role.REGIONAL_ORGANISER) {
          return user.managedCountry === eventChapter.country;
        }
        // Global Admins and Godmode have universal access
        if (userLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN]) {
          return true;
        }
      }

      return false;
    }

    case Permission.AWARD_BADGE: {
      if (!context.targetUser) return false;

      // Rule 1: A user cannot award a badge to themselves.
      if (user.id === context.targetUser.id) return false;

      // FIX: Add hierarchy and scope checks for consistency
      // Rule 2: A user cannot award a badge to someone with an equal or higher role.
      const hasHigherRole = ROLE_HIERARCHY[user.role] > ROLE_HIERARCHY[context.targetUser.role];
      if (!hasHigherRole) return false;

      // Rule 3: Regional Organisers can only manage users within their country.
      if (user.role === Role.REGIONAL_ORGANISER) {
        if (!user.managedCountry || !context.allChapters) return false;
        const targetUserCountries = new Set(
          context.allChapters
            .filter((c) => context.targetUser!.chapters.includes(c.name))
            .map((c) => c.country)
        );
        return targetUserCountries.has(user.managedCountry);
      }

      // Rule 4: Chapter Organisers can only manage users within their chapters.
      if (user.role === Role.CHAPTER_ORGANISER) {
        const managedChapters = new Set(user.organiserOf || []);
        return context.targetUser.chapters.some(chapter => managedChapters.has(chapter));
      }

      return true; // GODMODE and GLOBAL_ADMIN pass if hierarchy is respected
    }
    // Add more context-specific rules as needed...

    default:
      // If no specific rule, permission is granted if it's in their role list
      return true;
  }
};
