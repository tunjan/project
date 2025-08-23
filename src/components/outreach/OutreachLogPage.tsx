import React, { useState, useMemo } from 'react';
import { type CubeEvent, type OutreachLog, OutreachOutcome } from '@/types';
import OutreachTally from './OutreachTally';
import { useCurrentUser } from '@/store/auth.store';
import { useEvents, useOutreachLogs, useOutreachActions } from '@/store';
import { toast } from 'sonner';
import { CalendarIcon, FilterIcon } from '@/icons';

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
    <div className="border-2 border-black bg-white p-4">
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
  const { logOutreach } = useOutreachActions();

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
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isQuickMode, setIsQuickMode] = useState<boolean>(false);

  const filteredAndSortedLogs = useMemo(() => {
    let filtered = [...userLogs];

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (dateFilter) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((log) => log.createdAt >= cutoffDate);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [userLogs, dateFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast.error('Please select an event.');
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
    setIsQuickMode(false);
    toast.success('Outreach logged successfully!');
  };

  const handleQuickLog = (outcome: OutreachOutcome) => {
    setSelectedOutcome(outcome);
    setIsQuickMode(true);
    // Scroll to form or highlight it briefly
    const form = document.getElementById('outreach-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        form.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
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

      {/* Quick Log Buttons */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-black">Quick Log</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Object.values(OutreachOutcome).map((outcome) => (
            <button
              key={outcome}
              onClick={() => handleQuickLog(outcome)}
              className="border-2 border-black bg-white p-3 text-center text-sm font-semibold transition-colors duration-200 hover:bg-neutral-50"
              disabled={userEvents.length === 0}
            >
              {outcome}
            </button>
          ))}
        </div>
        {userEvents.length === 0 && (
          <p className="mt-2 text-sm text-neutral-500">
            No past events available for logging. Attend an event first to log
            conversations.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-black">
            Log a Conversation
          </h2>
          {isQuickMode && (
            <div className="bg-primary-light mb-4 rounded border border-primary p-3 text-sm">
              <strong>Quick Mode:</strong> {selectedOutcome} selected. Fill in
              the details below.
            </div>
          )}
          <form
            id="outreach-form"
            onSubmit={handleSubmit}
            className="space-y-4 border-2 border-black bg-white p-6 transition-all duration-200"
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
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="border-b-2 border-primary pb-2 text-xl font-bold text-black sm:border-b-0 sm:pb-0">
              Log History
            </h2>
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-neutral-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded border border-neutral-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
          </div>

          {filteredAndSortedLogs.length > 0 ? (
            <>
              <div className="mb-3 text-sm text-neutral-600">
                Showing {filteredAndSortedLogs.length} of {userLogs.length}{' '}
                total logs
                {dateFilter !== 'all' && ` (${dateFilter})`}
              </div>
              <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
                {filteredAndSortedLogs.map((log) => (
                  <LogHistoryItem
                    key={log.id}
                    log={log}
                    event={allEvents.find((e) => e.id === log.eventId)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col justify-center border-2 border-black bg-white p-8 text-center">
              <h3 className="text-xl font-bold text-black">
                {dateFilter === 'all'
                  ? 'No logs yet.'
                  : `No logs found for ${dateFilter}.`}
              </h3>
              <p className="mt-2 text-neutral-500">
                {dateFilter === 'all'
                  ? 'Use the form to add your first outreach outcome.'
                  : 'Try adjusting the time filter or add more logs.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutreachLogPage;
