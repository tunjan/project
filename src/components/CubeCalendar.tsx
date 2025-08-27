import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import momentPlugin from '@fullcalendar/moment';
import { CubeEvent } from '@/types';
import { type EventClickArg } from '@fullcalendar/core';

interface CubeCalendarProps {
  events: CubeEvent[];
  onSelectEvent: (event: CubeEvent) => void;
}

const CubeCalendar: React.FC<CubeCalendarProps> = ({
  events,
  onSelectEvent,
}) => {
  const calendarEvents = events.map((event) => {
    // Create title with only chapter name
    const title = event.city;

    return {
      id: event.id,
      title: title,
      start: event.startDate,
      end: event.endDate,
      extendedProps: { originalEvent: event },
      backgroundColor: '#6b7280',
      borderColor: '#000000',
      textColor: '#ffffff',
    };
  });

  const handleEventClick = (clickInfo: EventClickArg) => {
    onSelectEvent(clickInfo.event.extendedProps.originalEvent);
  };

  return (
    <div className="card-brutal p-4">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          momentPlugin,
        ]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={calendarEvents}
        eventClick={handleEventClick}
        height="700px"
        eventDisplay="block"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
      />
    </div>
  );
};

export default CubeCalendar;
