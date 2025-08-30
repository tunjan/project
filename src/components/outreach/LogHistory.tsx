import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { InputField } from '@/components/ui/Form';
import { CalendarIcon, FunnelIcon, XMarkIcon } from '@/icons';
import { type CubeEvent, type OutreachLog } from '@/types';

import EditLogModal from './EditLogModal';
import LogEntryCard from './LogEntryCard';

interface LogHistoryProps {
  logs: OutreachLog[];
  events: CubeEvent[];
  updateOutreachLog: (logId: string, updates: Partial<OutreachLog>) => void;
  removeOutreachLog: (logId: string) => void;
}

const LogHistory: React.FC<LogHistoryProps> = ({
  logs,
  events,
  updateOutreachLog,
  removeOutreachLog,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingLog, setEditingLog] = useState<OutreachLog | null>(null);
  // Track pending deletions to support Undo without immediate data mutation
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(
    new Set()
  );
  const deleteTimersRef = useRef<Record<string, number>>({});

  const filteredLogs = useMemo(() => {
    if (!startDate && !endDate) return logs;
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;
    return logs.filter((log) => {
      const logDate = new Date(log.createdAt);
      if (start && logDate < start) return false;
      if (end && logDate > end) return false;
      return true;
    });
  }, [logs, startDate, endDate]);

  const sortedLogs = useMemo(
    () =>
      [...filteredLogs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [filteredLogs]
  );

  const handleSaveEdit = (logId: string, updates: Partial<OutreachLog>) => {
    updateOutreachLog(logId, updates);
    toast.success('Log entry updated!');
    setEditingLog(null);
  };

  // Start a pending delete with Undo option. Only call removeOutreachLog if not undone within 5s.
  const startPendingDelete = (log: OutreachLog) => {
    setPendingDeleteIds((prev) => new Set(prev).add(log.id));

    // Set up delayed removal
    const timerId = window.setTimeout(() => {
      removeOutreachLog(log.id);
      // Cleanup timer ref and pending state
      setPendingDeleteIds((prev) => {
        const next = new Set(prev);
        next.delete(log.id);
        return next;
      });
      delete deleteTimersRef.current[log.id];
    }, 5000);

    deleteTimersRef.current[log.id] = timerId;

    toast.warning('Log deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          // Cancel deletion
          const t = deleteTimersRef.current[log.id];
          if (t) {
            clearTimeout(t);
            delete deleteTimersRef.current[log.id];
          }
          setPendingDeleteIds((prev) => {
            const next = new Set(prev);
            next.delete(log.id);
            return next;
          });
          toast.success('Restored');
        },
      },
      duration: 5000,
    });
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(deleteTimersRef.current).forEach((t) => clearTimeout(t));
      deleteTimersRef.current = {};
    };
  }, []);

  const hasActiveFilters = startDate || endDate;

  return (
    <section>
      <h2 className="mb-6 border-b-4 border-primary pb-3 text-2xl font-extrabold tracking-tight text-black">
        Log History
      </h2>

      {editingLog && (
        <EditLogModal
          log={editingLog}
          onClose={() => setEditingLog(null)}
          onSave={handleSaveEdit}
          isOpen={!!editingLog}
        />
      )}

      {/* Enhanced Filter Section */}
      <div className="mb-6 border-2 border-black bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <FunnelIcon className="size-5 text-neutral-600" />
          <h3 className="text-lg font-bold text-black">Filter Logs</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InputField
            label="Start Date"
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <InputField
            label="End Date"
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="btn-outline flex w-full items-center justify-center"
            >
              <XMarkIcon className="mr-2 size-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 bg-neutral-50 p-3">
            <p className="text-sm text-neutral-600">
              <CalendarIcon className="mr-2 inline size-4" />
              Showing {filteredLogs.length} of {logs.length} logs
              {startDate && ` from ${startDate}`}
              {endDate && ` to ${endDate}`}
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Log List */}
      {sortedLogs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-black">
              Recent Conversations ({sortedLogs.length})
            </h3>
            <div className="text-sm text-neutral-600">
              Sorted by most recent
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto border-2 border-black bg-white shadow-brutal">
            <div className="divide-y-2 divide-neutral-200">
              {sortedLogs
                .filter((log) => !pendingDeleteIds.has(log.id))
                .map((log) => {
                  const event = events.find((e) => e.id === log.eventId);
                  return (
                    <LogEntryCard
                      key={log.id}
                      log={log}
                      event={event}
                      onEdit={() => setEditingLog(log)}
                      onDelete={() => startPendingDelete(log)}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-black bg-white p-12 text-center shadow-brutal">
          <div className="mx-auto mb-4 size-16 rounded-full bg-neutral-100 p-4">
            <CalendarIcon className="size-8 text-neutral-400" />
          </div>
          <h3 className="text-xl font-bold text-black">No logs found</h3>
          <p className="mt-2 text-neutral-600">
            {hasActiveFilters
              ? 'Try adjusting your date filters or clear them to see all logs.'
              : 'Use the quick log tool above to start tracking your conversations.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="btn-outline mt-4"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default LogHistory;
