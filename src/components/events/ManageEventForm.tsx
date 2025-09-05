import { CheckCircle, ChevronLeft, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useOutreachLogs } from '@/store';
import { type CubeEvent, type EventReport, type OutreachLog } from '@/types';

interface ManageEventFormProps {
  event: CubeEvent;
  onLogReport: (eventId: string, report: EventReport) => void;
  onCancel: () => void;
}

type AttendanceStatus = 'Attended' | 'Absent';

const ManageEventForm: React.FC<ManageEventFormProps> = ({
  event,
  onLogReport,
  onCancel,
}) => {
  const [hours, setHours] = useState<number | ''>('');
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >(() => {
    const initialAttendance: Record<string, AttendanceStatus> = {};
    event.participants.forEach((p) => {
      initialAttendance[p.user.id] = 'Attended';
    });
    return initialAttendance;
  });

  const allLogs = useOutreachLogs();
  const eventLogs = allLogs.filter((log) => log.eventId === event.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours === '' || hours <= 0) {
      toast.error('Please enter a valid duration in hours.');
      return;
    }
    const reportData: EventReport = {
      hours: Number(hours),
      attendance,
    };
    onLogReport(event.id, reportData);
  };

  const handleAttendanceChange = (userId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="inline-flex items-center"
          >
            <ChevronLeft className="mr-1 size-5" />
            Back to Event
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Log Event Report
            </CardTitle>
            <CardDescription>
              Submit the final details for{' '}
              <span className="font-semibold">{event.location}</span> in{' '}
              <span className="font-semibold">{event.city}</span>. This will
              update stats for all attendees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Impact Metrics
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="hours"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Event Duration (Hours)
                    </label>
                    <Input
                      type="number"
                      id="hours"
                      value={hours}
                      onChange={(e) =>
                        setHours(
                          e.target.value === ''
                            ? ''
                            : parseFloat(e.target.value)
                        )
                      }
                      required
                      min="0.1"
                      step="0.1"
                      placeholder="e.g., 4.5"
                    />
                  </div>
                </div>
              </div>
              <Separator />

              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Outreach Log for This Event
                </h2>
                {eventLogs.length > 0 ? (
                  <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
                    {eventLogs.map((log: OutreachLog) => (
                      <Card key={log.id}>
                        <CardContent className="p-3">
                          <p className="font-semibold text-foreground">
                            {log.outcome}
                          </p>
                          {log.notes && (
                            <p className="text-sm text-muted-foreground">
                              {log.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No outreach outcomes have been logged for this event by
                    participants yet.
                  </p>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  Note: Individual activists log their own outreach outcomes
                  from the 'Outreach' page. This is a summary.
                </p>
              </div>
              <Separator />

              <div>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Attendance
                </h2>
                <div className="space-y-4">
                  {event.participants.map(({ user }) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={user.profilePictureUrl}
                              alt={user.name}
                              className="size-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold text-foreground">
                                {user.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.role}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                            <Button
                              type="button"
                              onClick={() =>
                                handleAttendanceChange(user.id, 'Attended')
                              }
                              variant={
                                attendance[user.id] === 'Attended'
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              className="sm:w-28"
                            >
                              <CheckCircle className="mr-1.5 size-4" />
                              Attended
                            </Button>
                            <Button
                              type="button"
                              onClick={() =>
                                handleAttendanceChange(user.id, 'Absent')
                              }
                              variant={
                                attendance[user.id] === 'Absent'
                                  ? 'destructive'
                                  : 'outline'
                              }
                              size="sm"
                              className="sm:w-28"
                            >
                              <XCircle className="mr-1.5 size-4" />
                              Absent
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Submit Final Report
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageEventForm;
