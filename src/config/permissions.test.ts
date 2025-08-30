import { EventStatus, OnboardingStatus, Role, type User } from '@/types';

import { can, Permission } from './permissions';

// Mock user data for tests
const godModeUser: User = {
  id: '1',
  name: 'God',
  email: 'god@example.com',
  role: Role.GODMODE,
  chapters: ['Berlin'],
  onboardingStatus: OnboardingStatus.COMPLETED,
  profilePictureUrl: 'test.jpg',
  stats: {
    totalHours: 0,
    cubesAttended: 0,
    veganConversions: 0,
    totalConversations: 0,
    cities: [],
  },
  badges: [],
  hostingAvailability: false,
  lastLogin: new Date(),
};

const globalAdmin: User = {
  id: '2',
  name: 'Admin',
  email: 'admin@example.com',
  role: Role.GLOBAL_ADMIN,
  chapters: ['Berlin'],
  onboardingStatus: OnboardingStatus.COMPLETED,
  profilePictureUrl: 'test.jpg',
  stats: {
    totalHours: 0,
    cubesAttended: 0,
    veganConversions: 0,
    totalConversations: 0,
    cities: [],
  },
  badges: [],
  hostingAvailability: false,
  lastLogin: new Date(),
};

const regionalOrganiserDE: User = {
  id: '3',
  name: 'Regional DE',
  email: 'regional@example.com',
  role: Role.REGIONAL_ORGANISER,
  managedCountry: 'Germany',
  chapters: ['Berlin'],
  onboardingStatus: OnboardingStatus.COMPLETED,
  profilePictureUrl: 'test.jpg',
  stats: {
    totalHours: 0,
    cubesAttended: 0,
    veganConversions: 0,
    totalConversations: 0,
    cities: [],
  },
  badges: [],
  hostingAvailability: false,
  lastLogin: new Date(),
};

const chapterOrganiserBerlin: User = {
  id: '4',
  name: 'Org Berlin',
  email: 'org@example.com',
  role: Role.CHAPTER_ORGANISER,
  organiserOf: ['Berlin'],
  chapters: ['Berlin'],
  onboardingStatus: OnboardingStatus.COMPLETED,
  profilePictureUrl: 'test.jpg',
  stats: {
    totalHours: 0,
    cubesAttended: 0,
    veganConversions: 0,
    totalConversations: 0,
    cities: [],
  },
  badges: [],
  hostingAvailability: false,
  lastLogin: new Date(),
};

const activistBerlin: User = {
  id: '5',
  name: 'Activist Berlin',
  email: 'activist@example.com',
  role: Role.ACTIVIST,
  chapters: ['Berlin'],
  onboardingStatus: OnboardingStatus.COMPLETED,
  profilePictureUrl: 'test.jpg',
  stats: {
    totalHours: 0,
    cubesAttended: 0,
    veganConversions: 0,
    totalConversations: 0,
    cities: [],
  },
  badges: [],
  hostingAvailability: false,
  lastLogin: new Date(),
};

const activistHamburg: User = {
  id: '6',
  name: 'Activist Hamburg',
  email: 'activist2@example.com',
  role: Role.ACTIVIST,
  chapters: ['Hamburg'],
  onboardingStatus: OnboardingStatus.COMPLETED,
  profilePictureUrl: 'test.jpg',
  stats: {
    totalHours: 0,
    cubesAttended: 0,
    veganConversions: 0,
    totalConversations: 0,
    cities: [],
  },
  badges: [],
  hostingAvailability: false,
  lastLogin: new Date(),
};

// Mock chapter data
const mockChapters = [
  { name: 'Berlin', country: 'Germany', lat: 0, lng: 0 },
  { name: 'Hamburg', country: 'Germany', lat: 0, lng: 0 },
];

// Mock event data
const mockEvent = {
  id: 'event1',
  name: 'Test Event', // FIX: Property 'name' was missing
  city: 'Berlin',
  location: 'Someplace', // FIX: Property 'location' was missing
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-01'),
  status: EventStatus.UPCOMING, // FIX: Use EventStatus enum
  scope: 'Chapter' as const, // FIX: Use const assertion
  participants: [],
  organizer: globalAdmin, // FIX: Use singular organizer instead of organizers array
};

describe('Permissions: can()', () => {
  it('should grant GODMODE all permissions', () => {
    expect(
      can(godModeUser, Permission.DELETE_USER, { targetUser: globalAdmin })
    ).toBe(true);
    expect(can(godModeUser, Permission.CREATE_ANNOUNCEMENT)).toBe(true);
    expect(can(godModeUser, Permission.EDIT_EVENT, { event: mockEvent })).toBe(
      true
    );
  });

  it('should deny permission if user role does not have it', () => {
    expect(can(activistBerlin, Permission.CREATE_ANNOUNCEMENT)).toBe(false);
    expect(
      can(activistBerlin, Permission.EDIT_EVENT, { event: mockEvent })
    ).toBe(false);
  });

  describe('DELETE_USER permission', () => {
    it('should not allow a user to delete someone with an equal or higher role', () => {
      expect(
        can(regionalOrganiserDE, Permission.DELETE_USER, {
          targetUser: globalAdmin,
        })
      ).toBe(false);
      expect(
        can(chapterOrganiserBerlin, Permission.DELETE_USER, {
          targetUser: regionalOrganiserDE,
        })
      ).toBe(false);
    });

    it('should allow a chapter organiser to delete a user in their chapter', () => {
      expect(
        can(chapterOrganiserBerlin, Permission.DELETE_USER, {
          targetUser: activistBerlin,
        })
      ).toBe(true);
    });

    it('should NOT allow a chapter organiser to delete a user outside their chapter', () => {
      expect(
        can(chapterOrganiserBerlin, Permission.DELETE_USER, {
          targetUser: activistHamburg,
        })
      ).toBe(false);
    });
  });

  describe('EDIT_EVENT permission', () => {
    it('should allow chapter organiser to edit events in their chapter', () => {
      expect(
        can(chapterOrganiserBerlin, Permission.EDIT_EVENT, { event: mockEvent })
      ).toBe(true);
    });

    it('should allow regional organiser to edit events in their country', () => {
      expect(
        can(regionalOrganiserDE, Permission.EDIT_EVENT, {
          event: mockEvent,
          allChapters: mockChapters,
        })
      ).toBe(true);
    });

    it('should not allow activist to edit events', () => {
      expect(
        can(activistBerlin, Permission.EDIT_EVENT, { event: mockEvent })
      ).toBe(false);
    });
  });

  describe('MANAGE_EVENT_PARTICIPANTS permission', () => {
    it('should allow chapter organiser to manage participants in their chapter', () => {
      expect(
        can(chapterOrganiserBerlin, Permission.MANAGE_EVENT_PARTICIPANTS, {
          event: mockEvent,
          allChapters: mockChapters,
        })
      ).toBe(true);
    });

    it('should not allow activist to manage participants', () => {
      expect(
        can(activistBerlin, Permission.MANAGE_EVENT_PARTICIPANTS, {
          event: mockEvent,
          allChapters: mockChapters,
        })
      ).toBe(false);
    });
  });

  describe('CREATE_ANNOUNCEMENT permission', () => {
    it('should allow chapter organiser to create announcements', () => {
      expect(can(chapterOrganiserBerlin, Permission.CREATE_ANNOUNCEMENT)).toBe(
        true
      );
    });

    it('should allow regional organiser to create announcements', () => {
      expect(can(regionalOrganiserDE, Permission.CREATE_ANNOUNCEMENT)).toBe(
        true
      );
    });

    it('should not allow activist to create announcements', () => {
      expect(can(activistBerlin, Permission.CREATE_ANNOUNCEMENT)).toBe(false);
    });
  });

  describe('Role hierarchy enforcement', () => {
    it('should respect role hierarchy for all permissions', () => {
      // Higher roles should have access to lower role permissions
      expect(can(globalAdmin, Permission.CREATE_ANNOUNCEMENT)).toBe(true);
      expect(can(regionalOrganiserDE, Permission.CREATE_ANNOUNCEMENT)).toBe(
        true
      );
      expect(can(chapterOrganiserBerlin, Permission.CREATE_ANNOUNCEMENT)).toBe(
        true
      );
    });
  });

  describe('Context-dependent permissions', () => {
    it('should require proper context for context-dependent permissions', () => {
      // These should fail without proper context
      expect(can(chapterOrganiserBerlin, Permission.EDIT_EVENT)).toBe(false);
      expect(can(chapterOrganiserBerlin, Permission.DELETE_USER)).toBe(false);
    });

    it('should work with proper context', () => {
      expect(
        can(chapterOrganiserBerlin, Permission.EDIT_EVENT, { event: mockEvent })
      ).toBe(true);
      expect(
        can(chapterOrganiserBerlin, Permission.DELETE_USER, {
          targetUser: activistBerlin,
        })
      ).toBe(true);
    });
  });
});
