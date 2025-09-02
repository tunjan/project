import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { SelectField } from '@/components/ui';
import { ArrowUturnLeftIcon, MinusIcon, PencilIcon, PlusIcon } from '@/icons';
import {
  type CubeEvent,
  type OutreachLog,
  OutreachOutcome,
  type User,
} from '@/types';

interface QuickLogFormProps {
  currentUser: User;
  events: CubeEvent[];
  users: User[];
  addOutreachLog: (log: Omit<OutreachLog, 'id'>) => string;
  removeOutreachLog: (logId: string) => void;
  isTeamView: boolean;
}

// Enhanced tab button with better visual feedback
const TabButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 border-b-2 px-6 py-4 text-sm font-bold ${
      isActive
        ? 'border-primary bg-primary text-white shadow-inner'
        : 'border-transparent text-neutral-600 hover:border-neutral-300 hover:text-black active:bg-neutral-100'
    }`}
  >
    {children}
  </button>
);

// Enhanced outcome button with better visual distinction
const OutcomeButton: React.FC<{
  outcome: OutreachOutcome;
  onClick: () => void;
  className?: string;
}> = ({ outcome, onClick, className = '' }) => {
  const getOutcomeColor = (outcome: OutreachOutcome) => {
    switch (outcome) {
      case OutreachOutcome.BECAME_VEGAN_ACTIVIST:
        return 'bg-success text-white border-success hover:bg-success-hover';
      case OutreachOutcome.BECAME_VEGAN:
        return 'bg-primary text-white border-primary hover:bg-primary-hover';
      case OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST:
        return 'bg-info text-white border-info hover:bg-info-hover';
      case OutreachOutcome.MOSTLY_SURE:
        return 'bg-warning text-black border-warning hover:bg-warning-hover';
      case OutreachOutcome.NOT_SURE:
        return 'bg-neutral-600 text-white border-neutral-600 hover:bg-neutral-700';
      case OutreachOutcome.NO_CHANGE:
        return 'bg-neutral-400 text-white border-neutral-400 hover:bg-neutral-500';
      default:
        return 'bg-white text-black border-black hover:bg-black hover:text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`btn-outline h-16 w-full font-bold md:border-2 ${getOutcomeColor(outcome)} ${className}`}
    >
      {outcome}
    </button>
  );
};

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
      icon: <ArrowUturnLeftIcon className="size-5" />,
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
        <h2 className="mb-6 border-b-4 border-primary pb-3 text-2xl font-extrabold tracking-tight text-black">
          Quick Log
        </h2>
        <div className="card-brutal card-padding text-center shadow-brutal hover:shadow-brutal-lg">
          <div className="py-12">
            <div className="mx-auto mb-4 size-16 rounded-full bg-neutral-100 p-4">
              <PencilIcon className="size-8 text-neutral-400" />
            </div>
            <p className="text-lg font-semibold text-neutral-700">
              Attend an event to start logging conversations
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Your first outreach conversation will appear here
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-6 border-b-4 border-primary pb-3 text-2xl font-extrabold tracking-tight text-black">
        Quick Log
      </h2>

      <div className="card-brutal shadow-brutal hover:shadow-brutal-lg">
        {/* Enhanced Form Section with Better Spacing */}
        <div className="space-y-6 p-8">
          <div className="grid grid-cols-1 gap-6">
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
          </div>

          {/* Enhanced Notes Input */}
          <div className="relative">
            <PencilIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add quick notes about your conversation (optional)"
              className="w-full border-black bg-white p-4 pl-12 text-black placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white dark:bg-black dark:text-white dark:placeholder:text-neutral-500 md:border-2"
            />
          </div>
        </div>

        {/* Enhanced Tab Section */}
        <div className="border-t-2 border-black dark:border-white">
          <div className="flex border-b border-neutral-200">
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

          <div className="p-8">
            {mode === 'single' ? (
              // Enhanced Single Log Mode
              <div className="space-y-4">
                <p className="text-sm font-medium text-neutral-600">
                  Select the outcome of your conversation:
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.values(OutreachOutcome).map((outcome) => (
                    <OutcomeButton
                      key={outcome}
                      outcome={outcome}
                      onClick={() => handleLog(outcome)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Enhanced Bulk Log Mode
              <div className="space-y-6">
                <p className="text-sm font-medium text-neutral-600">
                  Count multiple conversations by outcome:
                </p>

                <div className="space-y-4">
                  {Object.entries(bulkCounts).map(([outcome, count]) => (
                    <div
                      key={outcome}
                      className="flex items-center justify-between rounded-none border-neutral-200 bg-neutral-50 p-4 hover:border-neutral-300 hover:bg-white dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700 md:border-2"
                    >
                      <span className="text-sm font-semibold text-neutral-700">
                        {outcome}
                      </span>
                      <div className="flex items-center gap-3">
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
                          className="flex size-10 items-center justify-center rounded-none border-black bg-white text-lg font-bold hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black md:border-2"
                        >
                          <MinusIcon className="size-5" />
                        </button>
                        <span className="w-12 text-center text-xl font-bold text-black">
                          {count}
                        </span>
                        <button
                          onClick={() =>
                            setBulkCounts((p) => ({
                              ...p,
                              [outcome]: p[outcome as OutreachOutcome] + 1,
                            }))
                          }
                          className="flex size-10 items-center justify-center rounded-none border-black bg-white text-lg font-bold hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black md:border-2"
                        >
                          <PlusIcon className="size-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleBulkSubmit}
                  className="btn-primary w-full py-4 text-lg font-bold shadow-brutal hover:shadow-brutal-lg"
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
