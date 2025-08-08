import React, { useState, useMemo } from 'react';
import { type CubeEvent, type OutreachLog, OutreachOutcome } from '@/types';
import OutreachTally from './OutreachTally';
import { useCurrentUser } from '@/store/auth.store';
import { useEvents, useOutreachLogs, useAppActions } from '@/store/appStore';
import { toast } from 'sonner';
interface OutreachLogPageProps {}

const LogHistoryItem: React.FC<{ log: OutreachLog; event?: CubeEvent }> = ({
  log,
  event,
}) => {
  const formattedDate = log.createdAt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const eventName = event
    ? `${event.location}, ${event.city}`
    : 'Unknown Event';

  return (
    <div className="border border-black bg-white p-4">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-bold text-black">{eventName}</p>
          <p className="text-sm text-neutral-500">{formattedDate}</p>
        </div>
        <span className="rounded-none bg-neutral-200 px-2 py-0.5 text-xs font-bold text-black">
          {log.outcome}
        </span>
      </div>
      {log.notes && (
        <p className="border border-neutral-200 bg-neutral-50 p-2 text-sm text-neutral-700">
          {log.notes}
        </p>
      )}
    </div>
  );
};

const OutreachLogPage: React.FC<OutreachLogPageProps> = () => {
  const currentUser = useCurrentUser();
  const allOutreachLogs = useOutreachLogs();
  const allEvents = useEvents();
  const { logOutreach } = useAppActions();

  if (!currentUser) return null;

  const userLogs = allOutreachLogs.filter(
    (log) => log.userId === currentUser.id
  );
  const userEvents = allEvents.filter(
    (event) =>
      new Date(event.startDate) < new Date() &&
      event.participants.some((p) => p.user.id === currentUser.id)
  );

  const [selectedEvent, setSelectedEvent] = useState<string>(
    userEvents[0]?.id || ''
  );
  const [selectedOutcome, setSelectedOutcome] = useState<OutreachOutcome>(
    OutreachOutcome.NOT_SURE
  );
  const [notes, setNotes] = useState('');

  const sortedUserLogs = useMemo(() => {
    return [...userLogs].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [userLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      alert('Please select an event.');
      return;
    }
    logOutreach(
      {
        eventId: selectedEvent,
        outcome: selectedOutcome,
        notes,
      },
      currentUser
    );

    setNotes('');
    setSelectedOutcome(OutreachOutcome.NOT_SURE);
    toast.success('Outreach logged successfully!');
  };

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Outreach Log
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-600">
          Track the outcomes of your conversations to see your personal impact
          grow over time.
        </p>
      </div>

      <div className="mb-12">
        <OutreachTally logs={userLogs} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-black">
            Log a Conversation
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 border border-black bg-white p-6"
          >
            <div>
              <label
                htmlFor="event-select"
                className="mb-1 block text-sm font-bold text-black"
              >
                Event
              </label>
              <select
                id="event-select"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                required
                className="block w-full rounded-none border border-neutral-300 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
                disabled={userEvents.length === 0}
              >
                {userEvents.length > 0 ? (
                  userEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.location} -{' '}
                      {new Date(event.startDate).toLocaleDateString()}
                    </option>
                  ))
                ) : (
                  <option>No past events to log for</option>
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="outcome-select"
                className="mb-1 block text-sm font-bold text-black"
              >
                Outcome
              </label>
              <select
                id="outcome-select"
                value={selectedOutcome}
                onChange={(e) =>
                  setSelectedOutcome(e.target.value as OutreachOutcome)
                }
                required
                className="block w-full rounded-none border border-neutral-300 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
              >
                {Object.values(OutreachOutcome).map((outcome) => (
                  <option key={outcome} value={outcome}>
                    {outcome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1 block text-sm font-bold text-black"
              >
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="e.g., A couple took a card and said they would watch Dominion."
                className="block w-full rounded-none border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={userEvents.length === 0}
              className="w-full bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Log Outcome
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-black">
            Log History
          </h2>
          {sortedUserLogs.length > 0 ? (
            <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
              {sortedUserLogs.map((log) => (
                <LogHistoryItem
                  key={log.id}
                  log={log}
                  event={allEvents.find((e) => e.id === log.eventId)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center border border-black bg-white p-8 text-center">
              <h3 className="text-xl font-bold text-black">No logs yet.</h3>
              <p className="mt-2 text-neutral-500">
                Use the form to add your first outreach outcome.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutreachLogPage;
