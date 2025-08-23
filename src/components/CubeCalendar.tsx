import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import momentPlugin from '@fullcalendar/moment';
import { CubeEvent } from '@/types';

interface CubeCalendarProps {
  events: CubeEvent[];
  onSelectEvent: (event: CubeEvent) => void;
}

const CubeCalendar: React.FC<CubeCalendarProps> = ({
  events,
  onSelectEvent,
}) => {
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.location,
    start: event.startDate,
    end: event.endDate,
    extendedProps: { originalEvent: event },
    backgroundColor: '#b91c1c',
    borderColor: '#000000',
    textColor: '#ffffff',
  }));

  const handleEventClick = (clickInfo: any) => {
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
