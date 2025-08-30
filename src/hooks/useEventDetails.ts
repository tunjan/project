import { useMemo } from 'react';
import { CubeEvent, User, ParticipantStatus } from '@/types';
import { can, Permission } from '@/config/permissions';
import { useChapters } from '@/store';

export const useEventDetails = (event: CubeEvent, currentUser: User | null) => {
  const allChapters = useChapters();

  const details = useMemo(() => {
    if (!currentUser) {
      return {
        isAttending: false,
        isPending: false,
        isGuest: true,
        isPastEvent: new Date(event.startDate) < new Date(),
        isCancelled: event.status === 'Cancelled',
        canManageEvent: false,
        canEditEvent: false,
        canCancelEvent: false,
        canManageParticipants: false,
        isRegionalEvent: event.scope === 'Regional' && !!event.endDate,
        currentUserParticipant: undefined,
      };
    }

    const currentUserParticipant = event.participants.find(
      (p) => p.user.id === currentUser.id
    );
    const isAttending =
      currentUserParticipant?.status === ParticipantStatus.ATTENDING;
    const isPending =
      currentUserParticipant?.status === ParticipantStatus.PENDING;
    const isGuest = !currentUser.chapters?.includes(event.city);

    return {
      isAttending,
      isPending,
      isGuest,
      isPastEvent: new Date(event.startDate) < new Date(),
      isCancelled: event.status === 'Cancelled',
      canManageEvent: can(currentUser, Permission.LOG_EVENT_REPORT, { event }),
      canEditEvent: can(currentUser, Permission.EDIT_EVENT, { event }),
      canCancelEvent: can(currentUser, Permission.CANCEL_EVENT, { event }),
      canManageParticipants: can(
        currentUser,
        Permission.MANAGE_EVENT_PARTICIPANTS,
        { event, allChapters }
      ),
      isRegionalEvent: event.scope === 'Regional' && !!event.endDate,
      currentUserParticipant,
    };
  }, [event, currentUser, allChapters]);

  return details;
};
