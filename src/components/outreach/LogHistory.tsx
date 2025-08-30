import React, { useState, useMemo, useEffect, useRef } from 'react';
import { type OutreachLog, type CubeEvent } from '@/types';
import LogEntryCard from './LogEntryCard';
import { InputField } from '@/components/ui/Form';
import EditLogModal from './EditLogModal';
import { toast } from 'sonner';

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

  return (
    <section>
      <h2 className="h-section">Log History</h2>

      {editingLog && (
        <EditLogModal
          log={editingLog}
          onClose={() => setEditingLog(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* ConfirmationModal removed in favor of toast-based Undo pattern */}

      <div className="card-brutal mb-4 p-4">
        <div className="flex flex-wrap items-end gap-2">
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
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="btn-outline h-[38px]"
          >
            Reset
          </button>
        </div>
      </div>

      {sortedLogs.length > 0 ? (
        <div className="max-h-[80vh] overflow-y-auto border-2 border-black bg-white">
          <div className="divide-y-2 divide-black">
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
      ) : (
        <div className="card-brutal card-padding text-center">
          <h3 className="text-xl font-bold">No logs found.</h3>
          <p className="mt-2 text-neutral-500">
            Use the quick log tool or adjust your filters.
          </p>
        </div>
      )}
    </section>
  );
};

export default LogHistory;
