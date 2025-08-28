import React from 'react';
import { User, CubeEvent, EventParticipant, ParticipantStatus } from '@/types';
import { Link } from 'react-router-dom';
import Widget from '@/components/dashboard/Widget';

const MemberCard: React.FC<{ user: User }> = ({ user }) => (
  <Link
    to={`/members/${user.id}`}
    className="flex items-center gap-3 p-2 text-left transition hover:bg-neutral-100"
  >
    <img
      src={user.profilePictureUrl}
      alt={user.name}
      className="h-10 w-10 object-cover"
    />
    <div>
      <p className="font-bold text-black">{user.name}</p>
      <p className="text-sm text-neutral-500">{user.role}</p>
    </div>
  </Link>
);

interface EventSidebarProps {
  event: CubeEvent;
  canManageParticipants: boolean;
  availableHosts: User[];
  onAcceptRsvp: (userId: string) => void;
  onDenyRsvp: (userId: string) => void;
  onRequestStay: (host: User) => void;
}

const EventSidebar: React.FC<EventSidebarProps> = ({
  event,
  canManageParticipants,
  availableHosts,
  onAcceptRsvp,
  onDenyRsvp,
  onRequestStay,
}) => {
  const attending = event.participants.filter(
    (p) => p.status === ParticipantStatus.ATTENDING
  );
  const pending = event.participants.filter(
    (p) => p.status === ParticipantStatus.PENDING
  );

  return (
    <div className="space-y-6">
      <Widget title={`Participants (${attending.length})`}>
        {attending.length > 0 ? (
          <ul className="divide-y divide-neutral-200">
            {attending.map((p) => (
              <li key={p.user.id}>
                <MemberCard user={p.user} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-neutral-500">
            No one has RSVP'd yet.
          </p>
        )}
      </Widget>

      {canManageParticipants && pending.length > 0 && (
        <Widget title={`Pending Requests (${pending.length})`}>
          <ul className="divide-y divide-neutral-200">
            {pending.map((p) => (
              <li key={p.user.id} className="p-2">
                <div className="flex items-center justify-between">
                  <MemberCard user={p.user} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDenyRsvp(p.user.id)}
                      className="btn-secondary btn-sm"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => onAcceptRsvp(p.user.id)}
                      className="btn-primary btn-sm"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Widget>
      )}

      {availableHosts.length > 0 && (
        <Widget title={`Available Hosts (${availableHosts.length})`}>
          <ul className="divide-y divide-neutral-200">
            {availableHosts.map((host) => (
              <li key={host.id} className="p-2">
                <div className="flex items-center justify-between">
                  <MemberCard user={host} />
                  <button
                    onClick={() => onRequestStay(host)}
                    className="btn-primary btn-sm"
                  >
                    Request Stay
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Widget>
      )}
    </div>
  );
};

export default EventSidebar;
