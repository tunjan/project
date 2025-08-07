import React, { useState } from "react";
import FocusTrap from "focus-trap-react";
import { type CubeEvent } from "@/types";
import { XIcon, ChevronDownIcon } from "@/icons";

interface PastEventsModalProps {
  chapterName: string;
  events: CubeEvent[];
  onClose: () => void;
}

const EventItem: React.FC<{ event: CubeEvent }> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedDate = new Date(event.dateTime).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border-b border-black last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-neutral-100 transition-colors"
      >
        <div>
          <p className="font-bold text-black">{event.location}</p>
          <p className="text-sm text-neutral-500">{formattedDate}</p>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-neutral-500 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isExpanded && (
        <div className="p-4 bg-neutral-50 border-t border-black">
          <h4 className="text-sm font-bold mb-3">
            Attendees ({event.participants.length})
          </h4>
          <ul className="space-y-3 max-h-48 overflow-y-auto">
            {event.participants.map((p) => (
              <li key={p.user.id} className="flex items-center space-x-3">
                <img
                  src={p.user.profilePictureUrl}
                  alt={p.user.name}
                  className="w-8 h-8 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-black">
                    {p.user.name}
                  </p>
                  <p className="text-xs text-neutral-600">{p.eventRole}</p>
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
    <FocusTrap>
      <div
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="past-events-title"
      >
        <div
          className="bg-white border-4 border-black relative w-full max-w-2xl m-4 flex flex-col"
          style={{ height: "90vh", maxHeight: "700px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-black flex justify-between items-center flex-shrink-0">
            <div>
              <h2
                id="past-events-title"
                className="text-2xl font-extrabold text-black"
              >
                Past Events
              </h2>
              <p className="text-neutral-600">For {chapterName} Chapter</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full"
              aria-label="Close modal"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto bg-white">
            {events.length > 0 ? (
              <div>
                {events.map((event) => (
                  <EventItem key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center h-full flex items-center justify-center">
                <p className="text-neutral-500">
                  No past events found for this chapter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

export default PastEventsModal;
