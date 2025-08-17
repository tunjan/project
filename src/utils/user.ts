import { User, Role } from '@/types';

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
      case Role.CONFIRMED_ACTIVIST:
        return 'Confirmed Activist';
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