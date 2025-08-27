import React, { useState, useMemo, useEffect } from 'react';
import { type OutreachLog, OutreachOutcome, type CubeEvent } from '@/types';
import OutreachTally from '@/components/outreach/OutreachTally';
import { useCurrentUser } from '@/store/auth.store';
import { useEvents, useOutreachLogsForUser, useOutreachActions } from '@/store';
import { toast } from 'sonner';
import {
  PencilIcon,
  ChevronDownIcon,
  PlusIcon,
  ArrowUturnLeftIcon,
  XIcon,
} from '@/icons';
import { InputField } from '@/components/ui/Form';

interface LogEntryCardProps {
  log: OutreachLog;
  event?: CubeEvent;
  onEdit: (log: OutreachLog) => void;
  onDelete: (log: OutreachLog) => void;
  onAddNotes: (log: OutreachLog, notes: string) => void;
}

const LogEntryCard: React.FC<LogEntryCardProps> = ({
  log,
  event,
  onEdit,
  onDelete,
  onAddNotes,
}) => {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  const getOutcomeColor = (outcome: OutreachOutcome) => {
    switch (outcome) {
      case OutreachOutcome.BECAME_VEGAN_ACTIVIST:
        return 'bg-success text-white';
      case OutreachOutcome.BECAME_VEGAN:
        return 'bg-primary text-white';
      case OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST:
        return 'bg-black text-white';
      case OutreachOutcome.MOSTLY_SURE:
        return 'bg-black text-white';
      case OutreachOutcome.NOT_SURE:
        return 'bg-black text-white';
      case OutreachOutcome.NO_CHANGE:
        return 'bg-black text-white';
      default:
        return 'bg-black text-white';
    }
  };

  const handleAddNotes = () => {
    if (!newNotes.trim()) return;
    onAddNotes(log, newNotes);
    setNewNotes('');
    setIsNotesModalOpen(false);
  };

  const openNotesModal = () => {
    setNewNotes(log.notes || '');
    setIsNotesModalOpen(true);
  };

  return (
    <>
      <div className="p-4 hover:bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <p className="font-bold text-black">
                {event?.location || 'Unknown Event'}
              </p>
              <span
                className={`tag-status text-white ${getOutcomeColor(log.outcome)}`}
              >
                {log.outcome}
              </span>
            </div>
            <p className="text-white0 mb-2 font-mono text-xs">
              {new Date(log.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openNotesModal}
              className="text-grey-600 flex items-center gap-1 px-2 py-1 text-xs font-bold transition-colors duration-300 hover:bg-primary hover:text-white"
              title={
                log.notes
                  ? 'Edit notes for this log entry'
                  : 'Add notes to this log entry'
              }
            >
              {log.notes ? (
                <PencilIcon className="h-3 w-3" />
              ) : (
                <PlusIcon className="h-3 w-3" />
              )}
              {log.notes ? 'Edit Notes' : 'Add Notes'}
            </button>
            <button
              onClick={() => onEdit(log)}
              className="text-grey-600 flex items-center gap-1 px-2 py-1 text-xs font-bold transition-colors duration-300 hover:bg-black hover:text-white"
              title="Edit this log entry"
            >
              <PencilIcon className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(log)}
              className="text-grey-600 hover:bg-red flex items-center gap-1 px-2 py-1 text-xs font-bold transition-colors duration-300 hover:text-white"
              title="Delete this log entry"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        </div>

        {log.notes && (
          <div className="card-brutal card-padding mt-2 bg-white">
            <p className="text-sm text-black">{log.notes}</p>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md border-2 border-black bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-black">
                {log.notes ? 'Edit Notes' : 'Add Notes'}
              </h3>
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="text-white0 hover:text-black"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Add notes about this conversation..."
                className="w-full resize-none border-2 border-black bg-white p-3 text-sm"
                rows={4}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddNotes}
                className="flex-1 bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover"
                disabled={!newNotes.trim()}
              >
                {log.notes ? 'Update Notes' : 'Add Notes'}
              </button>
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="flex-1 border-2 border-black bg-white px-4 py-2 font-bold text-black hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OutreachLogPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const { addOutreachLog, removeOutreachLog, updateOutreachLog } =
    useOutreachActions();
  const logs = useOutreachLogsForUser(currentUser?.id);
  const events = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<OutreachLog | null>(null);

  const [quickLogNotes, setQuickLogNotes] = useState('');
  const [quickLogEventId, setQuickLogEventId] = useState<string>('');
  const [showEventSelector, setShowEventSelector] = useState(false);

  // NEW: State for date range filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const pastEvents = useMemo(() => {
    if (!currentUser) return [];
    return events
      .filter(
        (event) =>
          new Date(event.startDate) < new Date() &&
          event.participants.some((p) => p.user.id === currentUser.id)
      )
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
  }, [currentUser, events]);

  useEffect(() => {
    if (pastEvents.length > 0 && !quickLogEventId) {
      setQuickLogEventId(pastEvents[0].id);
    }
  }, [pastEvents, quickLogEventId]);

  const selectedQuickLogEvent = useMemo(
    () => pastEvents.find((e) => e.id === quickLogEventId),
    [pastEvents, quickLogEventId]
  );

  // NEW: Memoized log filtering based on the selected date range
  const filteredUserLogs = useMemo(() => {
    if (!startDate && !endDate) {
      return logs;
    }
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    return logs.filter((log) => {
      const logDate = new Date(log.createdAt);
      if (start && logDate < start) return false;
      if (end && logDate > end) return false;
      return true;
    });
  }, [logs, startDate, endDate]);

  const sortedUserLogs = useMemo(() => {
    return [...filteredUserLogs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredUserLogs]);

  const handleQuickLog = (outcome: OutreachOutcome) => {
    if (!currentUser || !selectedQuickLogEvent) return;

    const newLog: Omit<OutreachLog, 'id'> = {
      userId: currentUser.id,
      eventId: selectedQuickLogEvent.id,
      outcome,
      notes: quickLogNotes || undefined,
      createdAt: new Date(),
    };
    const logId = addOutreachLog(newLog);
    setQuickLogNotes('');
    toast.success('Conversation logged!', {
      action: {
        label: 'Undo',
        onClick: () => removeOutreachLog(logId),
      },
      icon: <ArrowUturnLeftIcon className="h-5 w-5" />,
    });
  };

  const handleAddNotes = (log: OutreachLog, notes: string) => {
    updateOutreachLog(log.id, { notes });
    toast.success('Notes added successfully!');
  };

  const handleEdit = (log: OutreachLog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = (log: OutreachLog) => {
    // TODO: confirmation modal
    removeOutreachLog(log.id);
    toast.error('Log entry deleted.');
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-12">
      {isModalOpen && editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="card-brutal w-full max-w-lg p-6">
            <h2 className="h-section mb-4">Edit Log</h2>
            <p>Coming soon...</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* RESTRUCTURED: Switched to a more logical 2-column grid layout */}
      <div className="my-8 grid grid-cols-1 gap-12">
        <div className="space-y-12 py-8 md:py-4">
          <section>
            <div className="mb-8 md:mb-12">
              <h2 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
                Quick Log
              </h2>
              <p className="text-grey-600 mt-3 max-w-2xl text-lg">
                Log a conversation with one click - perfect for busy cubes!
              </p>
            </div>
            {pastEvents.length > 0 && selectedQuickLogEvent ? (
              <div className="card-brutal p-6">
                <div className="mb-4">
                  <label className="text-grey-600 text-sm font-semibold">
                    Logging for Event:
                  </label>
                  <div className="relative mt-1">
                    <button
                      onClick={() => setShowEventSelector(!showEventSelector)}
                      className="border-brutal flex w-full items-center justify-between bg-white p-3 text-left font-bold text-black hover:bg-white"
                    >
                      <span>
                        {selectedQuickLogEvent.location} (
                        {new Date(
                          selectedQuickLogEvent.startDate
                        ).toLocaleDateString()}
                        )
                      </span>
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform ${
                          showEventSelector ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {showEventSelector && (
                      <div className="absolute z-10 mt-1 w-full border-2 border-black bg-white shadow-brutal">
                        {pastEvents.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => {
                              setQuickLogEventId(event.id);
                              setShowEventSelector(false);
                            }}
                            className="block w-full p-3 text-left hover:bg-white"
                          >
                            {event.location} (
                            {new Date(event.startDate).toLocaleDateString()})
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
                          return 'bg-success text-white hover:bg-success-hover';
                        case OutreachOutcome.BECAME_VEGAN:
                          return 'bg-primary text-white hover:bg-primary-hover';
                        case OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST:
                          return 'bg-black text-white hover:bg-black';
                        case OutreachOutcome.MOSTLY_SURE:
                          return 'bg-black text-white hover:bg-black';
                        case OutreachOutcome.NOT_SURE:
                          return 'bg-black text-white hover:bg-black';
                        case OutreachOutcome.NO_CHANGE:
                          return 'bg-black text-white hover:bg-black';
                        default:
                          return 'bg-black text-white hover:bg-black';
                      }
                    };

                    return (
                      <button
                        key={outcome}
                        onClick={() => handleQuickLog(outcome)}
                        className={`card-brutal-hover p-4 text-center text-xs font-bold transition-all duration-150 ${getOutcomeColor(
                          outcome
                        )}`}
                        title={`Log "${outcome}" for ${selectedQuickLogEvent.location}`}
                      >
                        {outcome}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="quick-notes"
                    className="mb-2 block text-sm font-bold text-black"
                  >
                    Quick Notes (Optional)
                  </label>
                  <div className="relative">
                    <PencilIcon className="text-grey-500 pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                    <input
                      type="text"
                      id="quick-notes"
                      value={quickLogNotes}
                      onChange={(e) => setQuickLogNotes(e.target.value)}
                      placeholder="e.g., 'Took leaflet, seemed interested'"
                      className="placeholder:text-white0 w-full border-2 border-black bg-white p-3 pl-10 text-black focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <p className="text-white0 mt-1 text-xs">
                    Notes will be included with whichever outcome you click
                    above
                  </p>
                </div>
              </div>
            ) : (
              <div className="card-brutal p-8 text-center">
                <p className="font-bold text-black">
                  Attend an event to start logging conversations!
                </p>
                <p className="text-white0 mt-1 text-sm">
                  The quick-log tool will appear here after you participate in a
                  cube.
                </p>
              </div>
            )}
          </section>

          <section>
            <div className="card-brutal">
              <div className="border-b-2 border-black p-4">
                <div className="flex flex-col gap-4">
                  <h2 className="h-section mb-0 flex-shrink-0 border-b-0 pb-0">
                    Your Tally
                  </h2>
                  <div className="flex flex-wrap items-end gap-2">
                    <InputField
                      label="Start Date"
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                    <InputField
                      label="End Date"
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="h-[38px] border-2 border-black bg-white px-4 text-sm font-bold text-black hover:bg-black"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <OutreachTally logs={filteredUserLogs} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="h-section mb-4">Log History</h2>
            {sortedUserLogs.length > 0 ? (
              <div className="card-brutal max-h-[80vh] overflow-y-auto">
                <div className="divide-y-2 divide-black">
                  {sortedUserLogs.map((log) => {
                    const event = events.find((e) => e.id === log.eventId);
                    return (
                      <LogEntryCard
                        key={log.id}
                        log={log}
                        event={event}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddNotes={handleAddNotes}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="card-brutal flex h-48 items-center justify-center p-8 text-center">
                <div>
                  <h3 className="text-xl font-bold text-black">No logs yet.</h3>
                  <p className="text-white0 mt-2">
                    Use the quick log tool to add your first outreach outcome.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default OutreachLogPage;
