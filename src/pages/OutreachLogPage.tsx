import React, { useState, useMemo, useEffect } from 'react';
import { OutreachOutcome } from '@/types';
import OutreachTally from '@/components/outreach/OutreachTally';
import { useCurrentUser } from '@/store/auth.store';
import { useEvents, useOutreachLogs, useAppActions } from '@/store/appStore';
import { toast } from 'sonner';
import { PencilIcon, ChevronDownIcon } from '@/icons';

const OutreachLogPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const allOutreachLogs = useOutreachLogs();
  const allEvents = useEvents();
  const { logOutreach } = useAppActions();

  const [quickLogNotes, setQuickLogNotes] = useState('');
  const [quickLogEventId, setQuickLogEventId] = useState<string>('');
  const [showEventSelector, setShowEventSelector] = useState(false);

  const [advancedSelectedEvent, setAdvancedSelectedEvent] =
    useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<OutreachOutcome>(
    OutreachOutcome.NOT_SURE
  );
  const [advancedNotes, setAdvancedNotes] = useState('');

  if (!currentUser) return null;

  const { userLogs, pastEvents } = useMemo(() => {
    const logs = allOutreachLogs.filter((log) => log.userId === currentUser.id);
    const events = allEvents
      .filter(
        (event) =>
          new Date(event.startDate) < new Date() &&
          event.participants.some((p) => p.user.id === currentUser.id)
      )
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    return {
      userLogs: logs,
      pastEvents: events,
    };
  }, [allOutreachLogs, allEvents, currentUser.id]);

  useEffect(() => {
    if (pastEvents.length > 0 && !quickLogEventId) {
      setQuickLogEventId(pastEvents[0].id);
    }
  }, [pastEvents, quickLogEventId]);

  const selectedQuickLogEvent = useMemo(
    () => pastEvents.find((e) => e.id === quickLogEventId),
    [pastEvents, quickLogEventId]
  );

  const sortedUserLogs = useMemo(() => {
    return [...userLogs].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [userLogs]);

  const handleQuickLog = (outcome: OutreachOutcome) => {
    if (!quickLogEventId) return;
    logOutreach(
      {
        eventId: quickLogEventId,
        outcome,
        notes: quickLogNotes,
      },
      currentUser
    );
    setQuickLogNotes('');
    toast.success(`Logged: "${outcome}"`);
  };

  const handleAdvancedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advancedSelectedEvent) {
      toast.error('Please select an event for the advanced log.');
      return;
    }
    logOutreach(
      {
        eventId: advancedSelectedEvent,
        outcome: selectedOutcome,
        notes: advancedNotes,
      },
      currentUser
    );
    setAdvancedNotes('');
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

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {}
        <div className="space-y-12 lg:col-span-2">
          <section>
            <h2 className="h-section mb-4">Quick Log</h2>
            {pastEvents.length > 0 && selectedQuickLogEvent ? (
              <div className="card-brutal p-6">
                <div className="mb-4">
                  <label className="text-sm font-semibold text-neutral-600">
                    Logging for Event:
                  </label>
                  <div className="relative mt-1">
                    <button
                      onClick={() => setShowEventSelector(!showEventSelector)}
                      className="border-brutal flex w-full items-center justify-between bg-white p-3 text-left font-bold text-black hover:bg-neutral-50"
                    >
                      <span>
                        {selectedQuickLogEvent.location} (
                        {selectedQuickLogEvent.startDate.toLocaleDateString()})
                      </span>
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform ${
                          showEventSelector ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {showEventSelector && (
                      <div className="shadow-brutal absolute z-10 mt-1 w-full border-2 border-black bg-white">
                        {pastEvents.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => {
                              setQuickLogEventId(event.id);
                              setShowEventSelector(false);
                            }}
                            className="block w-full p-3 text-left hover:bg-neutral-100"
                          >
                            {event.location} (
                            {event.startDate.toLocaleDateString()})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {Object.values(OutreachOutcome).map((outcome) => (
                    <button
                      key={outcome}
                      onClick={() => handleQuickLog(outcome)}
                      className="card-brutal-hover p-4 text-center font-bold"
                    >
                      {outcome}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label htmlFor="quick-notes" className="sr-only">
                    Notes (Optional)
                  </label>
                  <div className="relative">
                    <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      id="quick-notes"
                      value={quickLogNotes}
                      onChange={(e) => setQuickLogNotes(e.target.value)}
                      placeholder="Add optional notes before clicking..."
                      className="border-brutal w-full bg-white p-3 pl-10 text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-brutal p-8 text-center">
                <p className="font-bold text-black">
                  Attend an event to start logging conversations!
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  The quick-log tool will appear here after you participate in a
                  cube.
                </p>
              </div>
            )}
          </section>

          <section>
            <h2 className="h-section mb-4">Log History</h2>
            {sortedUserLogs.length > 0 ? (
              <div className="card-brutal max-h-[80vh] overflow-y-auto">
                <div className="divide-y-2 divide-black">
                  {sortedUserLogs.map((log) => {
                    const event = allEvents.find((e) => e.id === log.eventId);
                    return (
                      <div key={log.id} className="p-4 hover:bg-neutral-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-black">
                              {event?.location || 'Unknown Event'}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {log.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <span className="shrink-0 bg-black px-2 py-0.5 text-xs font-bold text-white">
                            {log.outcome}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="mt-2 border-l-4 border-neutral-300 pl-3 text-sm text-neutral-700">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="card-brutal flex h-48 items-center justify-center p-8 text-center">
                <div>
                  <h3 className="text-xl font-bold text-black">No logs yet.</h3>
                  <p className="mt-2 text-neutral-500">
                    Use the quick log tool to add your first outreach outcome.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {}
        <div className="space-y-12 lg:col-span-1">
          <section>
            <OutreachTally logs={userLogs} />
          </section>

          <section>
            <details className="card-brutal group">
              <summary className="h-section cursor-pointer list-none p-4 group-open:border-b-2 group-open:border-black">
                Advanced Log
              </summary>
              <div className="p-4">
                <p className="mb-4 text-sm text-neutral-600">
                  Log a conversation for an older event with more detail.
                </p>
                <form onSubmit={handleAdvancedSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="event-select"
                      className="mb-1 block text-sm font-bold text-black"
                    >
                      Event
                    </label>
                    <select
                      id="event-select"
                      value={advancedSelectedEvent}
                      onChange={(e) => setAdvancedSelectedEvent(e.target.value)}
                      required
                      className="border-brutal block w-full bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>
                        Select a past event
                      </option>
                      {pastEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.location} -{' '}
                          {new Date(event.startDate).toLocaleDateString()}
                        </option>
                      ))}
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
                      className="border-brutal block w-full bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
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
                      htmlFor="advanced-notes"
                      className="mb-1 block text-sm font-bold text-black"
                    >
                      Notes (Optional)
                    </label>
                    <textarea
                      id="advanced-notes"
                      value={advancedNotes}
                      onChange={(e) => setAdvancedNotes(e.target.value)}
                      rows={3}
                      className="border-brutal block w-full bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="border-brutal w-full bg-black px-4 py-3 font-bold text-white hover:bg-neutral-800"
                  >
                    Log Outcome
                  </button>
                </form>
              </div>
            </details>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OutreachLogPage;
