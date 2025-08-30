import React, { useState, useMemo, useEffect } from 'react';
import {
  type CubeEvent,
  type User,
  OutreachOutcome,
  type OutreachLog,
} from '@/types';
import { SelectField } from '@/components/ui/Form';
import { toast } from 'sonner';
import { ArrowUturnLeftIcon, PencilIcon } from '@/icons';

interface QuickLogFormProps {
  currentUser: User;
  events: CubeEvent[];
  users: User[];
  addOutreachLog: (log: Omit<OutreachLog, 'id'>) => string;
  removeOutreachLog: (logId: string) => void;
  isTeamView: boolean;
}

const TabButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`-mb-px w-full border-b-2 px-4 py-2 text-sm font-bold ${
      isActive
        ? 'border-primary text-primary'
        : 'border-transparent text-neutral-500 hover:text-black'
    }`}
  >
    {children}
  </button>
);

const QuickLogForm: React.FC<QuickLogFormProps> = ({
  currentUser,
  events,
  users,
  addOutreachLog,
  removeOutreachLog,
  isTeamView,
}) => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [bulkCounts, setBulkCounts] = useState<Record<OutreachOutcome, number>>(
    () =>
      Object.fromEntries(
        Object.values(OutreachOutcome).map((o) => [o, 0])
      ) as Record<OutreachOutcome, number>
  );

  const pastEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.startDate) <= now)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
  }, [events]);

  useEffect(() => {
    if (pastEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(pastEvents[0].id);
    }
    setSelectedUserId(currentUser.id);
  }, [pastEvents, currentUser, selectedEventId]);

  const handleLog = (outcome: OutreachOutcome) => {
    if (!selectedEventId) {
      toast.error('Please select an event to log against.');
      return;
    }
    const userIdToLog = isTeamView ? selectedUserId : currentUser.id;
    if (!userIdToLog) {
      toast.error('Please select a user to log for.');
      return;
    }
    const newLog = {
      userId: userIdToLog,
      eventId: selectedEventId,
      outcome,
      notes: notes || undefined,
      createdAt: new Date(),
    };
    const logId = addOutreachLog(newLog);
    toast.success('Conversation logged!', {
      action: {
        label: 'Undo',
        onClick: () => removeOutreachLog(logId),
      },
      icon: <ArrowUturnLeftIcon className="h-5 w-5" />,
    });
    setNotes('');
  };

  const handleBulkSubmit = () => {
    const totalLogs = Object.values(bulkCounts).reduce((sum, c) => sum + c, 0);
    if (totalLogs === 0) {
      toast.error('Add at least one conversation to submit.');
      return;
    }
    const userIdToLog = isTeamView ? selectedUserId : currentUser.id;

    Object.entries(bulkCounts).forEach(([outcome, count]) => {
      for (let i = 0; i < count; i++) {
        addOutreachLog({
          userId: userIdToLog,
          eventId: selectedEventId,
          outcome: outcome as OutreachOutcome,
          notes: notes || undefined,
          createdAt: new Date(),
        });
      }
    });

    toast.success(`${totalLogs} conversations logged successfully!`);
    setBulkCounts(
      Object.fromEntries(
        Object.values(OutreachOutcome).map((o) => [o, 0])
      ) as Record<OutreachOutcome, number>
    );
    setNotes('');
  };

  if (pastEvents.length === 0) {
    return (
      <section>
        <h2 className="h-section">Quick Log</h2>
        <div className="card-brutal card-padding text-center">
          <p className="text-sm text-neutral-500">
            Attend an event to start logging conversations.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="h-section">Quick Log</h2>
      <div className="card-brutal">
        <div className="space-y-4 p-6">
          <SelectField
            label="Event"
            id="event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {pastEvents.map((e) => (
              <option key={e.id} value={e.id}>
                {e.location} ({new Date(e.startDate).toLocaleDateString()})
              </option>
            ))}
          </SelectField>

          {isTeamView && (
            <SelectField
              label="Log for Member"
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </SelectField>
          )}

          <div className="relative">
            <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Quick notes (optional)"
              className="w-full border-2 border-black bg-white p-3 pl-10 text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="border-t-2 border-black">
          <div className="flex justify-between border-b border-black">
            <TabButton
              isActive={mode === 'single'}
              onClick={() => setMode('single')}
            >
              Single Log
            </TabButton>
            <TabButton
              isActive={mode === 'bulk'}
              onClick={() => setMode('bulk')}
            >
              Bulk Log
            </TabButton>
          </div>
          <div className="p-6">
            {mode === 'single' ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {Object.values(OutreachOutcome).map((outcome) => (
                  <button
                    key={outcome}
                    onClick={() => handleLog(outcome)}
                    className="btn-outline p-3 text-xs"
                  >
                    {outcome}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {Object.entries(bulkCounts).map(([outcome, count]) => (
                    <div
                      key={outcome}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-semibold">{outcome}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setBulkCounts((p) => ({
                              ...p,
                              [outcome]: Math.max(
                                0,
                                p[outcome as OutreachOutcome] - 1
                              ),
                            }))
                          }
                          className="btn-sm h-7 w-7 border-2 border-black bg-white p-0 text-lg"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">
                          {count}
                        </span>
                        <button
                          onClick={() =>
                            setBulkCounts((p) => ({
                              ...p,
                              [outcome]: p[outcome as OutreachOutcome] + 1,
                            }))
                          }
                          className="btn-sm h-7 w-7 border-2 border-black bg-white p-0 text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleBulkSubmit}
                  className="btn-primary w-full"
                >
                  Submit Bulk Logs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickLogForm;
