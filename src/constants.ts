import { type BadgeTemplate, Role } from '@/types';

/**
 * Role hierarchy for permission checking
 * Higher numbers indicate higher privileges
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.APPLICANT]: 0,
  [Role.ACTIVIST]: 1,
  [Role.CHAPTER_ORGANISER]: 2,
  [Role.REGIONAL_ORGANISER]: 3,
  [Role.GLOBAL_ADMIN]: 4,
  [Role.GODMODE]: 5,
};

/**
 * Available badge templates for awarding to users
 */
export const BADGE_TEMPLATES: BadgeTemplate[] = [
  {
    name: 'First Blood',
    description: 'Attended your first cube event',
    icon: 'HeartIcon',
  },
  {
    name: 'Nomad',
    description: 'Attended cubes in 5 or more cities',
    icon: 'MapPinIcon',
  },
  {
    name: 'Voice of Truth',
    description: 'Had 100+ conversations about veganism',
    icon: 'ChatBubbleLeftRightIcon',
  },
  {
    name: 'Centurion',
    description: 'Completed 100+ hours of activism',
    icon: 'ClockIcon',
  },
  {
    name: 'Veteran',
    description: 'Attended 25+ cube events',
    icon: 'TrophyIcon',
  },
  {
    name: 'Chapter Anchor',
    description: 'Dedicated chapter member with 10+ events and 50+ hours',
    icon: 'BuildingOfficeIcon',
  },
  {
    name: 'Guide',
    description: 'Helped others with 50+ conversations and 5+ conversions',
    icon: 'UserGroupIcon',
  },
  {
    name: 'Steel Resolve',
    description: 'High activity level with 15+ events attended',
    icon: 'ShieldCheckIcon',
  },
  {
    name: 'Tactical Mind',
    description:
      'Strategic activist with 75+ conversations and 10+ conversions',
    icon: 'LightBulbIcon',
  },
];
