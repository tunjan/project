import { CubeEvent, OnboardingStatus, Role, User } from '@/types';

export const INACTIVITY_PERIOD_MONTHS = 3;

export const getUserRoleDisplay = (user: User): string => {
  const roleLabelMap: Record<Role, string> = {
    [Role.ACTIVIST]: 'Activist',
    [Role.APPLICANT]: 'Applicant',
    [Role.GODMODE]: 'Administrator',
    [Role.CHAPTER_ORGANISER]: 'Chapter Organiser',
    [Role.REGIONAL_ORGANISER]: 'Regional Organiser',
    [Role.GLOBAL_ADMIN]: 'Global Admin',
  };

  const roleLabel = roleLabelMap[user.role] || user.role;

  if (user.role === Role.REGIONAL_ORGANISER && user.managedCountry) {
    return `Regional Organiser — ${user.managedCountry}`;
  }

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

  if (user.role === Role.GLOBAL_ADMIN || user.role === Role.GODMODE) {
    return roleLabel;
  }

  const chapters = user.chapters || [];
  if (chapters.length > 0) {
    const affiliation =
      chapters.length === 1 ? `${chapters[0]} Chapter` : chapters.join(', ');
    return `${roleLabel} · ${affiliation}`;
  }

  return roleLabel;
};

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
    const lastAttendance = userAttendanceMap.get(user.id);
    hasRecentAttendance = lastAttendance
      ? lastAttendance > inactivityCutoff
      : false;
  } else {
    hasRecentAttendance = allEvents.some(
      (event) =>
        new Date(event.startDate) > inactivityCutoff &&
        event.report?.attendance[user.id] === 'Attended'
    );
  }

  return !hasRecentLogin && !hasRecentAttendance;
};

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

          if (!existingDate || eventDate > existingDate) {
            userAttendanceMap.set(userId, eventDate);
          }
        }
      }
    }
  }

  return userAttendanceMap;
};

export function getAvatarUrl(seed: string, size: number = 150): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
}

export function generateRandomAvatarUrl(size: number = 150): string {
  const timestamp = Date.now();
  return getAvatarUrl(`user_${timestamp}`, size);
}

export const getConfirmedUsers = (users: User[]): User[] =>
  users.filter((u) => u.onboardingStatus === 'Confirmed');

export const generateAvatarUrl = (userId: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};
