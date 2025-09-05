import React from 'react';
import { Link } from 'react-router-dom';

import Widget from '@/components/dashboard/Widget';
import { Button } from '@/components/ui/button';
import { CubeEvent, ParticipantStatus, User } from '@/types';

const MemberCard: React.FC<{ user: User }> = ({ user }) => (
  <Button
    variant="ghost"
    asChild
    className="flex w-full items-center justify-start gap-3 p-2 text-left transition hover:bg-accent"
  >
    <Link to={`/members/${user.id}`}>
      <img
        src={user.profilePictureUrl}
        alt={user.name}
        className="size-10 object-cover"
      />
      <div>
        <p className="font-bold text-foreground">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.role}</p>
      </div>
    </Link>
  </Button>
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
          <p className="text-center text-sm text-muted-foreground">
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
                    <Button
                      onClick={() => onDenyRsvp(p.user.id)}
                      variant="outline"
                      size="sm"
                    >
                      Deny
                    </Button>
                    <Button onClick={() => onAcceptRsvp(p.user.id)} size="sm">
                      Approve
                    </Button>
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
                  <Button onClick={() => onRequestStay(host)} size="sm">
                    Request Stay
                  </Button>
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
