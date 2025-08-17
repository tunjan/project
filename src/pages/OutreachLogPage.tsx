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

  const [advancedSelectedEvent] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<OutreachOutcome>(
    OutreachOutcome.NOT_SURE
  );
  const [advancedNotes, setAdvancedNotes] = useState('');

  const { userLogs, pastEvents } = useMemo(() => {
    if (!currentUser) return { userLogs: [], pastEvents: [] };

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
  }, [allOutreachLogs, allEvents, currentUser]);

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
    if (!quickLogEventId || !currentUser) return;
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
    if (!advancedSelectedEvent || !currentUser) {
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

  if (!currentUser) return null;

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

      <div className="grid grid-cols-1 gap-12">
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
                  {Object.values(OutreachOutcome).map((outcome) => {
                    const getOutcomeColor = (outcome: OutreachOutcome) => {
                      switch (outcome) {
                        case OutreachOutcome.BECAME_VEGAN_ACTIVIST:
                          return 'bg-green-600 text-white hover:bg-green-700';
                        case OutreachOutcome.BECAME_VEGAN:
                          return 'bg-green-500 text-white hover:bg-green-600';
                        case OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST:
                          return 'bg-blue-600 text-white hover:bg-blue-700';
                        case OutreachOutcome.MOSTLY_SURE:
                          return 'bg-yellow-500 text-black hover:bg-yellow-600';
                        case OutreachOutcome.NOT_SURE:
                          return 'bg-gray-500 text-white hover:bg-gray-600';
                        case OutreachOutcome.NO_CHANGE:
                          return 'bg-red-600 text-white hover:bg-red-700';
                        default:
                          return 'bg-black text-white hover:bg-gray-800';
                      }
                    };

                    return (
                      <button
                        key={outcome}
                        onClick={() => handleQuickLog(outcome)}
                        className={`border-2 border-black p-4 text-center font-bold transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${getOutcomeColor(outcome)}`}
                      >
                        {outcome}
                      </button>
                    );
                  })}
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

          <div className="space-y-12 lg:col-span-1">
            <section>
              <OutreachTally logs={userLogs} />
            </section>
          </div>

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
                          <span
                            className={`shrink-0 px-2 py-0.5 text-xs font-bold text-white ${
                              log.outcome ===
                              OutreachOutcome.BECAME_VEGAN_ACTIVIST
                                ? 'bg-green-600'
                                : log.outcome === OutreachOutcome.BECAME_VEGAN
                                  ? 'bg-green-500'
                                  : log.outcome ===
                                      OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST
                                    ? 'bg-blue-600'
                                    : log.outcome ===
                                        OutreachOutcome.MOSTLY_SURE
                                      ? 'bg-yellow-500'
                                      : log.outcome === OutreachOutcome.NOT_SURE
                                        ? 'bg-gray-500'
                                        : log.outcome ===
                                            OutreachOutcome.NO_CHANGE
                                          ? 'bg-red-600'
                                          : 'bg-black'
                            }`}
                          >
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
      </div>
    </div>
  );
};

export default OutreachLogPage;
