import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { CubeEvent } from '@/types';
import { ChevronDownIcon } from '@/icons';

interface PastEventsModalProps {
  chapterName: string;
  events: CubeEvent[];
  onClose: () => void;
}

const EventItem: React.FC<{ event: CubeEvent }> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedDate = new Date(event.startDate).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div className="border-b border-black last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white"
      >
        <div>
          <p className="font-bold text-black">{event.location}</p>
          <p className="text-sm text-neutral-500">{formattedDate}</p>
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 text-neutral-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isExpanded && (
        <div className="border-t border-black bg-white p-4">
          <h4 className="mb-3 text-sm font-bold">
            Attendees ({event.participants.length})
          </h4>
          <ul className="max-h-48 space-y-3 overflow-y-auto">
            {event.participants.map((p) => (
              <li key={p.user.id} className="flex items-center space-x-3">
                <img
                  src={p.user.profilePictureUrl}
                  alt={p.user.name}
                  className="h-8 w-8 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-black">
                    {p.user.name}
                  </p>
                                    <p className="text-xs text-red">{p.user.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const PastEventsModal: React.FC<PastEventsModalProps> = ({
  chapterName,
  events,
  onClose,
}) => {
  return (
    <Modal
      title="Past Events"
      description={`For ${chapterName} Chapter`}
      onClose={onClose}
    >
      {events.length > 0 ? (
        <div className="-m-6 max-h-[60vh] flex-grow overflow-y-auto bg-white">
          {events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <p className="mb-4 text-neutral-600">
            No past events found for this chapter.
          </p>
          <div className="space-y-2 text-sm text-red">
            <p>This could be because:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>The chapter hasn't held any events yet</li>
              <li>All events are scheduled for the future</li>
              <li>
                There might be a mismatch between chapter names and event cities
              </li>
            </ul>
            <p className="mt-4 text-xs">
              Tip: Check if the chapter name "{chapterName}" matches the city
              field in events.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PastEventsModal;
