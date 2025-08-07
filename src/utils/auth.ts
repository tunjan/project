import { type User, Role, AnnouncementScope } from '@/types';

export const ROLE_HIERARCHY: Record<Role, number> = {
    [Role.ACTIVIST]: 0,
    [Role.CONFIRMED_ACTIVIST]: 1,
    [Role.CHAPTER_ORGANISER]: 2,
    [Role.REGIONAL_ORGANISER]: 3,
    [Role.GLOBAL_ADMIN]: 4,
    [Role.GODMODE]: 5,
};

export const hasOrganizerRole = (user: User): boolean => {
    const organizerRoles = [
        Role.CHAPTER_ORGANISER,
        Role.REGIONAL_ORGANISER,
        Role.GLOBAL_ADMIN,
        Role.GODMODE
    ];
    return organizerRoles.includes(user.role);
};

export const getAssignableRoles = (user: User): Role[] => {
    const userLevel = ROLE_HIERARCHY[user.role];

    if (user.role === Role.GODMODE) {
        return Object.values(Role);
    }


    if (userLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) {
        return Object.values(Role).filter(role =>
            role !== Role.GODMODE && ROLE_HIERARCHY[role] <= userLevel
        );
    }


    if (user.role === Role.CHAPTER_ORGANISER) {
        return Object.values(Role).filter(role => ROLE_HIERARCHY[role] < userLevel);
    }


    return [];
};


export const getPostableScopes = (user: User): AnnouncementScope[] => {
    switch (user.role) {
        case Role.GODMODE:
        case Role.GLOBAL_ADMIN:
            return [AnnouncementScope.GLOBAL, AnnouncementScope.REGIONAL, AnnouncementScope.CHAPTER];
        case Role.REGIONAL_ORGANISER:
            return [AnnouncementScope.REGIONAL, AnnouncementScope.CHAPTER];
        case Role.CHAPTER_ORGANISER:
            return [AnnouncementScope.CHAPTER];
        default:
            return [];
    }
};