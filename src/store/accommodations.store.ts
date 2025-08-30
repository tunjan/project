import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type AccommodationRequest,
  type User,
  NotificationType,
} from '@/types';
import { processedAccommodationRequests } from './initialData';
import { useNotificationsStore } from './notifications.store';

export interface AccommodationsState {
  accommodationRequests: AccommodationRequest[];
}

export interface AccommodationsActions {
  createAccommodationRequest: (
    requestData: Omit<AccommodationRequest, 'id' | 'requester' | 'status'>,
    requester: User
  ) => void;
  respondToAccommodationRequest: (
    requestId: string,
    response: 'Accepted' | 'Denied',
    host: User,
    replyMessage?: string
  ) => void;
}

export const useAccommodationsStore = create<
  AccommodationsState & AccommodationsActions
>()(
  persist(
    (set, get) => ({
      accommodationRequests: processedAccommodationRequests,

      createAccommodationRequest: (requestData, requester) => {
        const newRequest: AccommodationRequest = {
          id: `req_${Date.now()}`,
          requester,
          status: 'Pending',
          ...requestData,
        };
        set((state) => ({
          accommodationRequests: [newRequest, ...state.accommodationRequests],
        }));
        useNotificationsStore.getState().addNotification({
          userId: requestData.host.id,
          type: NotificationType.ACCOMMODATION_REQUEST,
          message: `${requester.name} requested accommodation for the ${requestData.event.location} event.`,
          linkTo: '/dashboard',
          relatedUser: requester,
        });
      },

      respondToAccommodationRequest: (
        requestId,
        response,
        host,
        replyMessage
      ) => {
        set((state) => ({
          accommodationRequests: state.accommodationRequests.map((req) =>
            req.id === requestId
              ? { ...req, status: response, hostReply: replyMessage }
              : req
          ),
        }));
        const request = get().accommodationRequests.find(
          (r) => r.id === requestId
        );
        if (request) {
          const notifType =
            response === 'Accepted'
              ? NotificationType.REQUEST_ACCEPTED
              : NotificationType.REQUEST_DENIED;
          useNotificationsStore.getState().addNotification({
            userId: request.requester.id,
            type: notifType,
            message: `${host.name} ${response.toLowerCase()} your accommodation request for ${request.event.location}.`,
            linkTo: '/dashboard',
            relatedUser: host,
          });
        }
      },
    }),
    { name: 'accommodations-store' }
  )
);

export const useAccommodationsState = () =>
  useAccommodationsStore((s) => s.accommodationRequests);
export const useAccommodationsActions = () =>
  useAccommodationsStore((s) => ({
    createAccommodationRequest: s.createAccommodationRequest,
    respondToAccommodationRequest: s.respondToAccommodationRequest,
  }));
