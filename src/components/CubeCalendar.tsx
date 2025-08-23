import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CubeEvent } from '@/types';

const localizer = momentLocalizer(moment);

interface CubeCalendarProps {
  events: CubeEvent[];
  onSelectEvent: (event: CubeEvent) => void;
}

const CubeCalendar: React.FC<CubeCalendarProps> = ({
  events,
  onSelectEvent,
}) => {
  const calendarEvents = events.map((event) => ({
    ...event,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    title: event.name,
  }));

  const eventStyleGetter = () => {
    const style = {
      backgroundColor: '#FF6B6B',
      borderRadius: '0px',
      opacity: 0.8,
      color: 'black',
      border: '2px solid black',
      display: 'block',
    };
    return {
      style,
    };
  };

  return (
    <div
      className="border-2 border-black bg-white p-4"
      style={{ height: '700px' }}
    >
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
      />
    </div>
  );
};

export default CubeCalendar;
