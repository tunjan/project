import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CubeEvent } from '@/types';

interface PastEventsModalProps {
  chapterName: string;
  events: CubeEvent[];
  onClose: () => void;
  isOpen: boolean;
}

const EventItem: React.FC<{ event: CubeEvent }> = ({ event }) => {
  const formattedDate = new Date(event.startDate).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <AccordionItem value={event.id}>
      <AccordionTrigger>
        <div className="text-left">
          <p className="font-bold text-foreground">{event.location}</p>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <h4 className="mb-3 text-sm font-bold text-foreground">
          Attendees ({event.participants.length})
        </h4>
        <ul className="max-h-48 space-y-3 overflow-y-auto">
          {event.participants.map((p) => (
            <li
              key={`${event.id}-${p.user.id}`}
              className="flex items-center space-x-3"
            >
              <Avatar className="size-8">
                <AvatarImage src={p.user.profilePictureUrl} alt={p.user.name} />
                <AvatarFallback className="text-xs">
                  {p.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {p.user.name}
                </p>
                <p className="text-xs text-muted-foreground">{p.user.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

const PastEventsModal: React.FC<PastEventsModalProps> = ({
  chapterName,
  events,
  onClose,
  isOpen,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Past Events</DialogTitle>
          <DialogDescription>For {chapterName} Chapter</DialogDescription>
        </DialogHeader>
        {events.length > 0 ? (
          <div className="max-h-[60vh] grow overflow-y-auto">
            <Accordion type="single" collapsible className="w-full">
              {events.map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <p className="mb-4 text-muted-foreground">
              No past events found for this chapter.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>This could be because:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>The chapter hasn't held any events yet</li>
                <li>All events are scheduled for the future</li>
                <li>
                  There might be a mismatch between chapter names and event
                  cities
                </li>
              </ul>
              <p className="mt-4 text-xs">
                Tip: Check if the chapter name "{chapterName}" matches the city
                field in events.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PastEventsModal;
