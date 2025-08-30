import React from 'react';

import { CubeEvent } from '@/types';

import EventRoster from './EventRoster';

interface EventRosterWrapperProps {
  event: CubeEvent;
}

const EventRosterWrapper: React.FC<EventRosterWrapperProps> = ({ event }) => {
  if (!event.endDate || event.scope !== 'Regional') {
    return (
      <div className="card-brutal bg-white p-6 text-center">
        <p className="text-neutral-500">This event doesn't have a roster.</p>
      </div>
    );
  }

  return <EventRoster event={event} />;
};

export default EventRosterWrapper;
