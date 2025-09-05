import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { CubeEvent } from '@/types';

import EventRoster from './EventRoster';

interface EventRosterWrapperProps {
  event: CubeEvent;
}

const EventRosterWrapper: React.FC<EventRosterWrapperProps> = ({ event }) => {
  if (!event.endDate || event.scope !== 'Regional') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            This event doesn't have a roster.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <EventRoster event={event} />;
};

export default EventRosterWrapper;
