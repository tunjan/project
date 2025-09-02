import { OnboardingStatus, Role, type User } from '@/types';

/**
 * Factory function to create mock user data with sensible defaults
 * @param overrides - Partial user object to override defaults
 * @returns Complete User object
 */
export const createUserMock = (overrides: Partial<User> = {}): User => {
  const defaults: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: Role.ACTIVIST,
    chapters: ['Berlin'],
    onboardingStatus: OnboardingStatus.COMPLETED,
    profilePictureUrl: 'test.jpg',
    joinDate: new Date('2023-01-01'),
    lastLogin: new Date(),
    stats: {
      totalHours: 10,
      cubesAttended: 2,
      veganConversions: 1,
      totalConversations: 5,
      cities: ['Berlin'],
    },
    badges: [],
    hostingAvailability: false,
    hostingCapacity: 1,
  };

  return { ...defaults, ...overrides };
};
