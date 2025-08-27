import { type CubeEvent, EventStatus } from '@/types';

import { CalendarIcon, ClockIcon, UsersIcon } from '@/icons';
import { safeFormatDate, safeParseDate } from '@/utils/date';

interface CubeCardProps {
  event: CubeEvent;
  onSelect: (event: CubeEvent) => void;
  isUserAffiliated?: boolean;
}

const CubeCard = ({ event, onSelect, isUserAffiliated }: CubeCardProps) => {
  // Ensure dates are valid Date objects
  const startDate = safeParseDate(event.startDate);
  const endDate = safeParseDate(event.endDate);

  const formattedDate = safeFormatDate(startDate, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = safeFormatDate(startDate, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDateRange =
    startDate && endDate
      ? `${safeFormatDate(startDate, { month: 'short', day: 'numeric' })} - ${safeFormatDate(endDate, { month: 'short', day: 'numeric', year: 'numeric' })}`
      : formattedDate;

  const handleSelect = () => {
    onSelect(event);
  };

  const isCancelled = event.status === EventStatus.CANCELLED;

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={`relative w-full transform cursor-pointer overflow-hidden border-2 border-black bg-white text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        isCancelled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-1'
      }`}
      disabled={isCancelled}
    >
      {event.scope === 'Regional' && (
        <div className="absolute left-0 top-0 bg-black px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {event.targetRegion} Regional Event
        </div>
      )}
      {isUserAffiliated && (
        <div
          className="absolute left-0 top-0 h-full w-1.5 bg-primary"
          title="This event is in one of your chapters"
        ></div>
      )}
      <div className={`p-6 ${event.scope !== 'Chapter' ? 'pt-10' : ''}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {event.city}
            </p>
            <h3 className="mt-1 text-2xl font-bold text-black">
              {event.location}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {event.status === EventStatus.FINISHED && (
              <span className="bg-black px-2 py-1 text-xs font-bold text-white">
                FINISHED
              </span>
            )}
            {isCancelled && (
              <span className="bg-red px-2 py-1 text-xs font-bold text-white">
                CANCELLED
              </span>
            )}
            <div className="flex items-center rounded-none bg-black px-2.5 py-1 text-xs font-semibold text-white">
              <UsersIcon className="mr-1.5 h-4 w-4" />
              {event.participants.length}
            </div>
          </div>
        </div>

        <div className="text-grey-800 mt-4 space-y-3">
          <div className="flex items-center">
            <CalendarIcon className="text-red mr-3 h-5 w-5" />
            <span>{formattedDateRange}</span>
          </div>
          {!event.endDate && (
            <div className="flex items-center">
              <ClockIcon className="text-red mr-3 h-5 w-5" />
              <span>{formattedTime}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center border-t border-white pt-4">
          <img
            className="h-10 w-10 object-cover"
            src={event.organizer.profilePictureUrl}
            alt={event.organizer.name}
          />
          <div className="ml-3">
            <p className="text-sm font-semibold text-black">
              {event.organizer.name}
            </p>
            <p className="text-white0 text-xs">Organizer</p>
          </div>
        </div>
      </div>
    </button>
  );
};

export default CubeCard;
