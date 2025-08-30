import { useMemo } from 'react';
import { useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';
import { can } from '@/config/permissions';
import { Permission } from '@/config/permissions';

export interface NavItem {
  to: string;
  label: string;
  requiresAuth?: boolean;
  requiresCoreAppAccess?: boolean; // For users past initial review
  requiresFullAccess?: boolean; // For fully confirmed activists
  requiresOnboardingInProgress?: boolean; // For users not yet fully confirmed
  permission?: Permission;
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    requiresAuth: true,
    requiresCoreAppAccess: true,
  },
  {
    to: '/cubes',
    label: 'Cubes',
    requiresAuth: true,
    requiresCoreAppAccess: true,
  },
  {
    to: '/chapters',
    label: 'Chapters',
    requiresAuth: true,
    requiresCoreAppAccess: true,
  },
  {
    to: '/leaderboard',
    label: 'Leaderboard',
    requiresAuth: true,
    requiresCoreAppAccess: true,
  },
  {
    to: '/announcements',
    label: 'Announcements',
    requiresAuth: true,
  },
  {
    to: '/resources',
    label: 'Resources',
    requiresAuth: true,
  },
  {
    to: '/outreach',
    label: 'Outreach',
    requiresAuth: true,
    requiresFullAccess: true,
  },
  {
    to: '/manage',
    label: 'Management',
    requiresAuth: true,
    requiresFullAccess: true,
    permission: Permission.VIEW_MANAGEMENT_DASHBOARD,
  },
  {
    to: '/analytics',
    label: 'Analytics',
    requiresAuth: true,
    requiresFullAccess: true,
    permission: Permission.VIEW_ANALYTICS,
  },
  {
    to: '/onboarding-status',
    label: 'My Application',
    requiresAuth: true,
    requiresOnboardingInProgress: true,
  },
];

export const useNavItems = () => {
  const currentUser = useCurrentUser();

  return useMemo(() => {
    if (!currentUser) {
      // Return only public nav items when not authenticated
      return ALL_NAV_ITEMS.filter((item) => !item.requiresAuth);
    }

    const isConfirmed =
      currentUser.onboardingStatus === OnboardingStatus.CONFIRMED;
    const isOnboardingInProgress = !isConfirmed;

    const canAccessCoreApp = ![
      OnboardingStatus.PENDING_APPLICATION_REVIEW,
      OnboardingStatus.DENIED,
      OnboardingStatus.INACTIVE,
    ].includes(currentUser.onboardingStatus);

    return ALL_NAV_ITEMS.filter((item) => {
      if (item.requiresAuth && !currentUser) return false;

      // Handle role-based visibility using the new `can` function
      if (item.permission && !can(currentUser, item.permission)) {
        return false;
      }

      if (item.requiresCoreAppAccess && !canAccessCoreApp) return false;
      if (item.requiresFullAccess && !isConfirmed) return false;
      if (item.requiresOnboardingInProgress && !isOnboardingInProgress)
        return false;

      return true;
    });
  }, [currentUser]);
};

export default useNavItems;
