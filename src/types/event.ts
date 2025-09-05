import { User } from './user';

/**
 * Roles for tour duties during events.
 */
export enum TourDutyRole {
  OUTREACH = 'Outreach',
  EQUIPMENT = 'Equipment',
  TRANSPORT = 'Transport',
}

export interface TourDuty {
  date: string; // YYYY-MM-DD
  role: TourDutyRole;
}

export enum ParticipantStatus {
  PENDING = 'Pending',
  ATTENDING = 'Attending',
  DECLINED = 'Declined',
}

export interface EventParticipant {
  user: User;
  status: ParticipantStatus;
  tourDuties?: TourDuty[];
}

export enum EventStatus {
  UPCOMING = 'Upcoming',
  ONGOING = 'Ongoing',
  FINISHED = 'Finished',
  CANCELLED = 'Cancelled',
}

export interface EventReport {
  hours: number;
  attendance: Record<string, 'Attended' | 'Absent'>;
}

export interface CubeEvent {
  id: string;
  name: string;
  city: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  scope: 'Chapter' | 'Regional' | 'Global';
  targetRegion?: string;
  organizer: User;
  participants: EventParticipant[];
  status: EventStatus;
  report?: EventReport;
  cancellationReason?: string;
  /** Optional image URL for the event card */
  imageUrl?: string;
}

export interface EventComment {
  id: string;
  eventId: string;
  author: User;
  content: string;
  createdAt: Date;
  parentId?: string;
}

export interface AccommodationRequest {
  id: string;
  requester: User;
  host: User;
  event: CubeEvent;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  message: string;
  status: 'Pending' | 'Accepted' | 'Denied';
  hostReply?: string;
}
