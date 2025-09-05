import { Calendar, Filter, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const startPendingDelete = (log: OutreachLog) => {
    setPendingDeleteIds((prev) => new Set(prev).add(log.id));

    const timerId = window.setTimeout(() => {
      removeOutreachLog(log.id);
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

  useEffect(() => {
    return () => {
      Object.values(deleteTimersRef.current).forEach((t) => clearTimeout(t));
      deleteTimersRef.current = {};
    };
  }, []);

  const hasActiveFilters = startDate || endDate;

  return (
    <div className="space-y-4">
      {editingLog && (
        <EditLogModal
          log={editingLog}
          onClose={() => setEditingLog(null)}
          onSave={handleSaveEdit}
          isOpen={!!editingLog}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-5 text-muted-foreground" />
              <CardTitle>
                History ({hasActiveFilters ? filteredLogs.length : logs.length})
              </CardTitle>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="start-date" className="text-sm">
                  From
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-[150px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="end-date" className="text-sm">
                  To
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-[150px]"
                />
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  <X className="mr-2 size-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedLogs.length > 0 ? (
            <div className="space-y-2">
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
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 size-12 rounded-full bg-muted p-3">
                <Calendar className="size-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                No logs found
              </h3>
              <p className="mt-1 text-muted-foreground">
                {hasActiveFilters
                  ? 'Try adjusting your date filters.'
                  : 'Log a conversation to see your history.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogHistory;
