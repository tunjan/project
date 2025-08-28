import { User, Role, OnboardingStatus, CubeEvent } from '@/types';

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
  const roleLabel = (() => {
    switch (user.role) {
      case Role.ACTIVIST:
        return 'Activist';
      case Role.GODMODE:
        return 'Administrator';
      default:
        return user.role; // Already human-readable for other roles
    }
  })();

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
    const memberOnly = (user.chapters || []).filter((c) => !organisedSet.has(c));
    if (memberOnly.length === 0) return organisedLabel;
    const memberAffiliation = `Member of ${memberOnly.join(', ')}`;

    return `${organisedLabel} · ${memberAffiliation}`;
  }

  // Default: show role + primary affiliation if any
  const chapters = user.chapters || [];
  if (chapters.length > 0) {
    const affiliation =
      chapters.length === 1
        ? `${chapters[0]} Chapter`
        : chapters.join(', ');
    return `${roleLabel} · ${affiliation}`;
  }

  return roleLabel;
};

/**
 * Checks if a user is considered inactive.
 * Inactive means they haven't logged in for the defined period AND haven't attended an event in that period.
 * @param user The user to check.
 * @param allEvents The list of all events to check against for attendance.
 * @returns True if the user is inactive, false otherwise.
 */
export const isUserInactive = (user: User, allEvents: CubeEvent[]): boolean => {
  if (user.onboardingStatus !== OnboardingStatus.CONFIRMED) return false;

  const inactivityCutoff = new Date();
  inactivityCutoff.setMonth(inactivityCutoff.getMonth() - INACTIVITY_PERIOD_MONTHS);

  const hasRecentLogin = user.lastLogin && new Date(user.lastLogin) > inactivityCutoff;

  const hasRecentAttendance = allEvents.some(
    (event) =>
      new Date(event.startDate) > inactivityCutoff &&
      event.report?.attendance[user.id] === 'Attended'
  );

  // User is inactive ONLY if both conditions are false
  return !hasRecentLogin && !hasRecentAttendance;
};