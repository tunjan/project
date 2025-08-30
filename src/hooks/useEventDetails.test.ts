import { renderHook } from '@testing-library/react';
import { useEventDetails } from './useEventDetails';
import {
  CubeEvent,
  User,
  ParticipantStatus,
  EventStatus,
  OnboardingStatus,
} from '@/types';
import { Role } from '@/types';

// Mock the store hooks
vi.mock('@/store', () => ({
  useChapters: () => [
    { name: 'Berlin', country: 'Germany', lat: 0, lng: 0 },
    { name: 'Hamburg', country: 'Germany', lat: 0, lng: 0 },
  ],
}));

// Mock the permissions
vi.mock('@/config/permissions', () => ({
  can: vi.fn((user, _permission, context) => {
    if (user?.role === Role.GODMODE) return true;
    if (
      user?.role === Role.CHAPTER_ORGANISER &&
      context?.event?.city === 'Berlin'
    )
      return true;
    if (
      user?.role === Role.REGIONAL_ORGANISER &&
      context?.event?.country === 'Germany'
    )
      return true;
    return false;
  }),
  Permission: {
    LOG_EVENT_REPORT: 'LOG_EVENT_REPORT',
    EDIT_EVENT: 'EDIT_EVENT',
    CANCEL_EVENT: 'CANCEL_EVENT',
    MANAGE_EVENT_PARTICIPANTS: 'MANAGE_EVENT_PARTICIPANTS',
  },
}));

const mockEvent: CubeEvent = {
  id: 'event1',
  name: 'Test Event',
  city: 'Berlin',
  location: 'Test Location',
  startDate: new Date('2024-01-01T10:00:00Z'),
  endDate: new Date('2024-01-01T18:00:00Z'),
  scope: 'Chapter',
  organizer: {
    id: 'organizer1',
    name: 'Organizer',
    email: 'organizer@example.com',
    role: Role.CHAPTER_ORGANISER,
    chapters: ['Berlin'],
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
    onboardingStatus: OnboardingStatus.CONFIRMED,
    lastLogin: new Date(),
  },
  participants: [
    {
      user: {
        id: 'user1',
        name: 'Test User',
        email: 'user@example.com',
        role: Role.ACTIVIST,
        chapters: ['Berlin'],
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
        onboardingStatus: OnboardingStatus.CONFIRMED,
        lastLogin: new Date(),
      },
      status: ParticipantStatus.ATTENDING,
    },
  ],
  status: EventStatus.UPCOMING,
};

const mockUser: User = {
  id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  role: Role.CHAPTER_ORGANISER,
  chapters: ['Berlin'],
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
  onboardingStatus: OnboardingStatus.CONFIRMED,
  lastLogin: new Date(),
};

describe('useEventDetails', () => {
  it('should return default values when no user is provided', () => {
    const { result } = renderHook(() => useEventDetails(mockEvent, null));

    expect(result.current).toEqual({
      isAttending: false,
      isPending: false,
      isGuest: true,
      isPastEvent: expect.any(Boolean),
      isCancelled: false,
      canManageEvent: false,
      canEditEvent: false,
      canCancelEvent: false,
      canManageParticipants: false,
      isRegionalEvent: false,
      currentUserParticipant: undefined,
    });
  });

  it('should correctly identify when user is attending', () => {
    const attendingUser: User = {
      ...mockUser,
      id: 'user1',
    };

    const eventWithAttendingUser: CubeEvent = {
      ...mockEvent,
      participants: [
        {
          user: attendingUser,
          status: ParticipantStatus.ATTENDING,
        },
      ],
    };

    const { result } = renderHook(() =>
      useEventDetails(eventWithAttendingUser, attendingUser)
    );

    expect(result.current.isAttending).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isGuest).toBe(false);
  });

  it('should correctly identify when user is pending', () => {
    const pendingUser: User = {
      ...mockUser,
      id: 'user2',
    };

    const eventWithPendingUser: CubeEvent = {
      ...mockEvent,
      participants: [
        {
          user: pendingUser,
          status: ParticipantStatus.PENDING,
        },
      ],
    };

    const { result } = renderHook(() =>
      useEventDetails(eventWithPendingUser, pendingUser)
    );

    expect(result.current.isAttending).toBe(false);
    expect(result.current.isPending).toBe(true);
    expect(result.current.isGuest).toBe(false);
  });

  it('should correctly identify when user is a guest', () => {
    const guestUser: User = {
      ...mockUser,
      chapters: ['Hamburg'], // Different chapter
    };

    const { result } = renderHook(() => useEventDetails(mockEvent, guestUser));

    expect(result.current.isGuest).toBe(true);
  });

  it('should correctly identify past events', () => {
    const pastEvent: CubeEvent = {
      ...mockEvent,
      startDate: new Date('2020-01-01T10:00:00Z'), // Past date
    };

    const { result } = renderHook(() => useEventDetails(pastEvent, mockUser));

    expect(result.current.isPastEvent).toBe(true);
  });

  it('should correctly identify cancelled events', () => {
    const cancelledEvent: CubeEvent = {
      ...mockEvent,
      status: EventStatus.CANCELLED,
    };

    const { result } = renderHook(() =>
      useEventDetails(cancelledEvent, mockUser)
    );

    expect(result.current.isCancelled).toBe(true);
  });

  it('should correctly identify regional events', () => {
    const regionalEvent: CubeEvent = {
      ...mockEvent,
      scope: 'Regional',
      endDate: new Date('2024-01-02T18:00:00Z'),
    };

    const { result } = renderHook(() =>
      useEventDetails(regionalEvent, mockUser)
    );

    expect(result.current.isRegionalEvent).toBe(true);
  });

  it('should not identify local events as regional', () => {
    const localEvent: CubeEvent = {
      ...mockEvent,
      scope: 'Chapter',
    };

    const { result } = renderHook(() => useEventDetails(localEvent, mockUser));

    expect(result.current.isRegionalEvent).toBe(false);
  });

  it('should correctly identify user participant data', () => {
    const { result } = renderHook(() => useEventDetails(mockEvent, mockUser));

    expect(result.current.currentUserParticipant).toBeDefined();
    expect(result.current.currentUserParticipant?.user.id).toBe('user1');
  });

  it('should return undefined for user participant when not found', () => {
    const userNotInEvent: User = {
      ...mockUser,
      id: 'user999',
    };

    const { result } = renderHook(() =>
      useEventDetails(mockEvent, userNotInEvent)
    );

    expect(result.current.currentUserParticipant).toBeUndefined();
    expect(result.current.isAttending).toBe(false);
    expect(result.current.isPending).toBe(false);
  });

  it('should handle events without end dates for regional scope', () => {
    const regionalEventNoEndDate: CubeEvent = {
      ...mockEvent,
      scope: 'Regional',
      endDate: undefined,
    };

    const { result } = renderHook(() =>
      useEventDetails(regionalEventNoEndDate, mockUser)
    );

    expect(result.current.isRegionalEvent).toBe(false);
  });

  it('should memoize results and only recalculate when dependencies change', () => {
    const { result, rerender } = renderHook(() =>
      useEventDetails(mockEvent, mockUser)
    );

    const firstResult = result.current;

    // Rerender with same props
    rerender();
    expect(result.current).toStrictEqual(firstResult);

    // Rerender with different user (different ID to trigger recalculation)
    const differentUser = { ...mockUser, id: 'user999' };
    const { result: result2 } = renderHook(() =>
      useEventDetails(mockEvent, differentUser)
    );
    expect(result2.current).not.toStrictEqual(firstResult);
  });
});
