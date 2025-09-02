import { CubeEvent, OnboardingStatus, Role, User } from '@/types';

// Shared constant for inactivity period
export const INACTIVITY_PERIOD_MONTHS = 3;

/**
 * Generates a clean, human-friendly display string for a user's role and affiliations.
 * Examples:
 *  - "Confirmed Activist · Gonzalezstad Chapter"
 *  - "Chapter Organiser — Berlin, Hamburg"
 *  - "Regional Organiser — Germany"
 */
export const getUserRoleDisplay = (user: User): string => {
  // Map role labels to nicer variants
  const roleLabelMap: Record<Role, string> = {
    [Role.ACTIVIST]: 'Activist',
    [Role.APPLICANT]: 'Applicant',
    [Role.GODMODE]: 'Administrator',
    [Role.CHAPTER_ORGANISER]: 'Chapter Organiser',
    [Role.REGIONAL_ORGANISER]: 'Regional Organiser',
    [Role.GLOBAL_ADMIN]: 'Global Admin',
  };

  const roleLabel = roleLabelMap[user.role] || user.role;

  // Regional organiser emphasises country
  if (user.role === Role.REGIONAL_ORGANISER && user.managedCountry) {
    return `Regional Organiser — ${user.managedCountry}`;
  }

  // Chapter organiser: list chapters they organise; optionally also show member-only chapters
  if (user.role === Role.CHAPTER_ORGANISER) {
    const organiserOf = user.organiserOf || [];
    const organisedLabel = organiserOf.length
      ? `Chapter Organiser of ${organiserOf.join(', ')}`
      : 'Chapter Organiser —';

    const organisedSet = new Set(organiserOf);
    const memberOnly = (user.chapters || []).filter(
      (c) => !organisedSet.has(c)
    );
    if (memberOnly.length === 0) return organisedLabel;
    const memberAffiliation = `Member of ${memberOnly.join(', ')}`;

    return `${organisedLabel} · ${memberAffiliation}`;
  }

  // For Global Admin and Godmode users, don't show chapter affiliations
  if (user.role === Role.GLOBAL_ADMIN || user.role === Role.GODMODE) {
    return roleLabel;
  }

  // Default: show role + primary affiliation if any
  const chapters = user.chapters || [];
  if (chapters.length > 0) {
    const affiliation =
      chapters.length === 1 ? `${chapters[0]} Chapter` : chapters.join(', ');
    return `${roleLabel} · ${affiliation}`;
  }

  return roleLabel;
};

/**
 * Checks if a user is considered inactive.
 * Inactive means they haven't logged in for the defined period AND haven't attended an event in that period.
 * @param user The user to check.
 * @param allEvents The list of all events to check against for attendance.
 * @param userAttendanceMap Optional pre-processed map of user attendance dates for performance optimization.
 * @returns True if the user is inactive, false otherwise.
 */
export const isUserInactive = (
  user: User,
  allEvents: CubeEvent[],
  userAttendanceMap?: Map<string, Date>
): boolean => {
  if (user.onboardingStatus !== OnboardingStatus.CONFIRMED) return false;

  const inactivityCutoff = new Date();
  inactivityCutoff.setMonth(
    inactivityCutoff.getMonth() - INACTIVITY_PERIOD_MONTHS
  );

  const hasRecentLogin =
    user.lastLogin && new Date(user.lastLogin) > inactivityCutoff;

  let hasRecentAttendance = false;

  if (userAttendanceMap) {
    // Use pre-processed attendance data for O(1) lookup
    const lastAttendance = userAttendanceMap.get(user.id);
    hasRecentAttendance = lastAttendance
      ? lastAttendance > inactivityCutoff
      : false;
  } else {
    // Fallback to original O(n) approach
    hasRecentAttendance = allEvents.some(
      (event) =>
        new Date(event.startDate) > inactivityCutoff &&
        event.report?.attendance[user.id] === 'Attended'
    );
  }

  // User is inactive ONLY if both conditions are false
  return !hasRecentLogin && !hasRecentAttendance;
};

/**
 * Pre-processes event data to create a map of user attendance dates for efficient inactivity checks.
 * This should be called once and reused for multiple user inactivity checks.
 * @param allEvents The list of all events.
 * @returns A map of user ID to their last attendance date.
 */
export const createUserAttendanceMap = (
  allEvents: CubeEvent[]
): Map<string, Date> => {
  const userAttendanceMap = new Map<string, Date>();

  for (const event of allEvents) {
    if (event.report) {
      for (const [userId, status] of Object.entries(event.report.attendance)) {
        if (status === 'Attended') {
          const eventDate = new Date(event.startDate);
          const existingDate = userAttendanceMap.get(userId);

          // Keep the most recent attendance date for each user
          if (!existingDate || eventDate > existingDate) {
            userAttendanceMap.set(userId, eventDate);
          }
        }
      }
    }
  }

  return userAttendanceMap;
};

/**
 * Generates a profile picture URL using reliable avatar services
 * @param seed - Unique identifier for the avatar
 * @param size - Size of the avatar (default: 150)
 * @returns Profile picture URL
 */
export function getAvatarUrl(seed: string, size: number = 150): string {
  // Use DiceBear as the primary service - it's reliable and has no CORS issues
  // Encode seed to avoid accidental URL injection.
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
}

/**
 * Generates a random avatar URL for new users
 * @param size - Size of the avatar (default: 150)
 * @returns Random avatar URL
 */
export function generateRandomAvatarUrl(size: number = 150): string {
  const timestamp = Date.now();
  return getAvatarUrl(`user_${timestamp}`, size);
}

/**
 * Filters users to return only those with 'Confirmed' onboarding status
 * @param users - Array of users to filter
 * @returns Array of confirmed users only
 */
export const getConfirmedUsers = (users: User[]): User[] =>
  users.filter((u) => u.onboardingStatus === 'Confirmed');

/**
 * Generate initials from a name (e.g. "Courtney Gusikowski" -> "CG")
 */

/**
 * Generates a consistent avatar URL for a user based on their ID.
 * Uses a placeholder service to generate consistent avatars.
 */
export const generateAvatarUrl = (userId: string): string => {
  // Use a placeholder service that generates consistent avatars based on seed
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};
