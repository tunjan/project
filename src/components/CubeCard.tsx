import { Avatar } from '@/components/ui';
import { CalendarIcon, ClockIcon, UsersIcon } from '@/icons';
import { type CubeEvent, EventStatus } from '@/types';
import { formatDateSafe, safeParseDate } from '@/utils';

interface CubeCardProps {
  event: CubeEvent;
  onSelect: (event: CubeEvent) => void;
  isUserAffiliated?: boolean;
}

const CubeCard = ({ event, onSelect, isUserAffiliated }: CubeCardProps) => {
  // Ensure dates are valid Date objects
  const startDate = safeParseDate(event.startDate);
  const endDate = safeParseDate(event.endDate);

  const formattedDate = formatDateSafe(
    startDate,
    (d, o) => new Intl.DateTimeFormat(undefined, o).format(d),
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  const formattedTime = formatDateSafe(
    startDate,
    (d, o) => new Intl.DateTimeFormat(undefined, o).format(d),
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const formattedDateRange =
    startDate && endDate
      ? `${formatDateSafe(startDate, (d, o) => new Intl.DateTimeFormat(undefined, o).format(d), { month: 'short', day: 'numeric' })} - ${formatDateSafe(endDate, (d, o) => new Intl.DateTimeFormat(undefined, o).format(d), { month: 'short', day: 'numeric', year: 'numeric' })}`
      : formattedDate;

  const handleSelect = () => {
    onSelect(event);
  };

  const isCancelled = event.status === EventStatus.CANCELLED;

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={`relative w-full cursor-pointer touch-manipulation p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
        isCancelled
          ? 'cursor-not-allowed opacity-60'
          : 'active:bg-gray-50 dark:active:bg-gray-800'
      } sm:card-base sm:flex sm:h-[280px] sm:flex-col sm:overflow-hidden sm:focus:ring-offset-2 ${!isCancelled ? 'sm:card-hover' : ''} `}
      disabled={isCancelled}
    >
      {/* Regional Event Badge - Desktop only */}
      {event.scope === 'Regional' && (
        <div className="absolute left-0 top-0 z-10 hidden bg-black px-3 py-1 text-xs font-bold uppercase tracking-wider text-white sm:block">
          {event.targetRegion} Regional Event
        </div>
      )}

      {/* User Affiliated Indicator */}
      {isUserAffiliated && (
        <div
          className="absolute left-0 top-0 z-10 h-full w-1 bg-primary sm:w-1.5"
          title="This event is in one of your chapters"
        ></div>
      )}

      {/* Mobile Layout: Compact list item */}
      <div className="sm:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {event.city}
              </p>
              {event.scope === 'Regional' && (
                <span className="bg-black px-1.5 py-0.5 text-xs font-bold text-white">
                  REGIONAL
                </span>
              )}
            </div>
            <h3 className="mb-2 line-clamp-2 text-base font-bold leading-tight text-black">
              {event.location}
            </h3>
            <div className="text-grey-800 mb-2 flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <CalendarIcon className="text-red mr-1.5 size-4 shrink-0" />
                <span className="truncate">{formattedDateRange}</span>
              </div>
              {!event.endDate && (
                <div className="flex items-center">
                  <ClockIcon className="text-red mr-1.5 size-4 shrink-0" />
                  <span>{formattedTime}</span>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <Avatar
                src={event.organizer.profilePictureUrl}
                alt={event.organizer.name}
                className="size-6 shrink-0 object-cover"
              />
              <span className="ml-2 truncate text-xs font-semibold text-black">
                {event.organizer.name}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {event.status === EventStatus.FINISHED && (
              <span className="bg-black px-1.5 py-0.5 text-xs font-bold text-white">
                FINISHED
              </span>
            )}
            {isCancelled && (
              <span className="bg-red px-1.5 py-0.5 text-xs font-bold text-white">
                CANCELLED
              </span>
            )}
            <div className="flex items-center bg-black px-2 py-1 text-xs font-semibold text-white">
              <UsersIcon className="mr-1 size-3 shrink-0" />
              <span>{event.participants.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout: Card layout with equal height */}
      <div
        className={`hidden h-full flex-col p-4 sm:flex md:p-2 ${event.scope !== 'Chapter' ? 'pt-10' : ''}`}
      >
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-row items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold uppercase tracking-wide text-primary">
                {event.city}
              </p>
              <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-tight text-black md:text-xl lg:text-2xl">
                {event.location}
              </h3>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {event.status === EventStatus.FINISHED && (
                <span className="whitespace-nowrap bg-black px-2 py-1 text-xs font-bold text-white">
                  FINISHED
                </span>
              )}
              {isCancelled && (
                <span className="bg-red whitespace-nowrap px-2 py-1 text-xs font-bold text-white">
                  CANCELLED
                </span>
              )}
              <div className="flex items-center whitespace-nowrap bg-black px-2.5 py-1 text-xs font-semibold text-white">
                <UsersIcon className="mr-1.5 size-4 shrink-0" />
                <span>{event.participants.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-grey-800 mb-4 flex-1 space-y-2">
          <div className="flex items-center">
            <CalendarIcon className="text-red mr-3 size-5 shrink-0" />
            <span className="truncate text-base">{formattedDateRange}</span>
          </div>
          {!event.endDate && (
            <div className="flex items-center">
              <ClockIcon className="text-red mr-3 size-5 shrink-0" />
              <span className="text-base">{formattedTime}</span>
            </div>
          )}
        </div>

        <div className="flex items-center border-t border-neutral-200 pt-4">
          <Avatar
            src={event.organizer.profilePictureUrl}
            alt={event.organizer.name}
            className="size-10 shrink-0 object-cover"
          />
          <div className="ml-3 min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-black">
              {event.organizer.name}
            </p>
            <p className="text-xs text-neutral-500">Organizer</p>
          </div>
        </div>
      </div>
    </button>
  );
};

export default CubeCard;
