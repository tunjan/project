import React, { useState, useMemo } from 'react';
import { type OutreachLog, type CubeEvent, OutreachOutcome } from '@/types';
import LogEntryCard from './LogEntryCard';
import { InputField } from '@/components/ui/Form';
import EditLogModal from './EditLogModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
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
  const [logToDelete, setLogToDelete] = useState<OutreachLog | null>(null);

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

  const confirmDelete = () => {
    if (logToDelete) {
      removeOutreachLog(logToDelete.id);
      toast.error('Log entry deleted.');
      setLogToDelete(null);
    }
  };

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

      <ConfirmationModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Log Entry"
        message="Are you sure you want to delete this log? This action cannot be undone."
        variant="danger"
      />

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
            {sortedLogs.map((log) => {
              const event = events.find((e) => e.id === log.eventId);
              return (
                <LogEntryCard
                  key={log.id}
                  log={log}
                  event={event}
                  onEdit={() => setEditingLog(log)}
                  onDelete={() => setLogToDelete(log)}
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
