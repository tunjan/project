import { useMemo } from 'react';
import { useCurrentUser } from '@/store/auth.store';
import { hasOrganizerRole } from '@/utils/auth';
import { OnboardingStatus } from '@/types';

export interface NavItem {
    to: string;
    label: string;
    requiresAuth?: boolean;
    requiresConfirmed?: boolean;
    requiresOrganizer?: boolean;
    requiresPending?: boolean;
}

const ALL_NAV_ITEMS: NavItem[] = [
    {
        to: '/dashboard',
        label: 'Dashboard',
        requiresAuth: true,
        requiresConfirmed: true,
    },
    {
        to: '/cubes',
        label: 'Cubes',
        requiresAuth: true,
        requiresConfirmed: true
    },
    {
        to: '/chapters',
        label: 'Chapters',
        requiresAuth: true,
        requiresConfirmed: true,
    },
    {
        to: '/leaderboard',
        label: 'Leaderboard',
        requiresAuth: true,
        requiresConfirmed: true,
    },
    {
        to: '/announcements',
        label: 'Announcements',
        requiresAuth: true
    },
    {
        to: '/resources',
        label: 'Resources',
        requiresAuth: true
    },
    {
        to: '/outreach',
        label: 'Outreach',
        requiresAuth: true,
        requiresConfirmed: true,
    },
    {
        to: '/manage',
        label: 'Management',
        requiresAuth: true,
        requiresOrganizer: true,
        requiresConfirmed: true, // FIX: Added this line
    },
    {
        to: '/analytics',
        label: 'Analytics',
        requiresAuth: true,
        requiresOrganizer: true,
        requiresConfirmed: true, // FIX: Added this line
    },
    {
        to: '/onboarding-status',
        label: 'My Application',
        requiresAuth: true,
        requiresPending: true,
    },
];

export const useNavItems = () => {
    const currentUser = useCurrentUser();

    return useMemo(() => {
        if (!currentUser) {
            // Return only public nav items when not authenticated
            return ALL_NAV_ITEMS.filter(item => !item.requiresAuth);
        }

        const isOrganizer = hasOrganizerRole(currentUser);
        const isConfirmed = currentUser.onboardingStatus === OnboardingStatus.CONFIRMED;
        const isPending =
            currentUser.onboardingStatus === OnboardingStatus.AWAITING_VERIFICATION ||
            currentUser.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW;

        return ALL_NAV_ITEMS.filter(item => {
            // Skip items that require auth when user is not authenticated
            if (item.requiresAuth && !currentUser) return false;

            // Skip items that require confirmed status when user is not confirmed
            if (item.requiresConfirmed && !isConfirmed) return false;

            // Skip items that require organizer role when user is not organizer
            if (item.requiresOrganizer && !isOrganizer) return false;

            // Skip items that require pending status when user is not pending
            if (item.requiresPending && !isPending) return false;

            return true;
        });
    }, [currentUser]);
};

export default useNavItems;
