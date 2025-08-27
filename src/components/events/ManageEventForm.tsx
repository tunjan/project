import React, { useState } from 'react';
import { type CubeEvent, type EventReport, type OutreachLog } from '@/types';
import { ChevronLeftIcon, CheckCircleIcon, XCircleIcon } from '@/icons';
import { toast } from 'sonner';
import { useOutreachLogs } from '@/store';

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
    <div className="animate-fade-in py-8 md:py-12">
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-sm font-semibold text-primary transition hover:text-black"
        >
          <ChevronLeftIcon className="mr-1 h-5 w-5" />
          Back to Event
        </button>
      </div>
      <div className="mx-auto max-w-4xl border border-black bg-white">
        <div className="border-b border-black p-8">
          <h1 className="text-3xl font-extrabold text-black">
            Log Event Report
          </h1>
          <p className="mt-2 text-red">
            Submit the final details for{' '}
            <span className="font-bold">{event.location}</span> in{' '}
            <span className="font-bold">{event.city}</span>. This will update
            stats for all attendees.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {}
          <div className="border-b border-black p-8">
            <h2 className="mb-4 text-xl font-bold text-black">
              Impact Metrics
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="hours"
                  className="mb-1 block text-sm font-bold text-black"
                >
                  Event Duration (Hours)
                </label>
                <input
                  type="number"
                  id="hours"
                  value={hours}
                  onChange={(e) =>
                    setHours(
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  required
                  min="0.1"
                  step="0.1"
                  className="block w-full border border-black bg-white p-2 text-black placeholder:text-white0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
                  placeholder="e.g., 4.5"
                />
              </div>
              <div>{}</div>
            </div>
          </div>

          {}
          <div className="border-b border-black p-8">
            <h2 className="mb-4 text-xl font-bold text-black">
              Outreach Log for This Event
            </h2>
            {eventLogs.length > 0 ? (
              <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
                {eventLogs.map((log: OutreachLog) => (
                  <div
                    key={log.id}
                    className="border-2 border-black bg-white p-3"
                  >
                    <p className="font-semibold">{log.outcome}</p>
                    {log.notes && (
                      <p className="text-sm text-red">{log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white0">
                No outreach outcomes have been logged for this event by
                participants yet.
              </p>
            )}
            <p className="mt-4 text-sm text-red">
              Note: Individual activists log their own outreach outcomes from
              the 'Outreach' page. This is a summary.
            </p>
          </div>

          {}
          <div className="p-8">
            <h2 className="mb-4 text-xl font-bold text-black">Attendance</h2>
            <ul className="divide-y-2 divide-black border-b-2 border-t-2 border-black">
              {event.participants.map(({ user }) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.profilePictureUrl}
                      alt={user.name}
                      className="h-10 w-10 object-cover"
                    />
                    <div>
                      <p className="font-bold text-black">{user.name}</p>
                      <p className="text-sm text-white0">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleAttendanceChange(user.id, 'Attended')
                      }
                      className={`flex w-full items-center justify-center px-3 py-2 text-sm font-semibold transition-colors sm:w-28 ${
                        attendance[user.id] === 'Attended'
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                    >
                      <CheckCircleIcon className="mr-1.5 h-5 w-5" />
                      Attended
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAttendanceChange(user.id, 'Absent')}
                      className={`flex w-full items-center justify-center px-3 py-2 text-sm font-semibold transition-colors sm:w-28 ${
                        attendance[user.id] === 'Absent'
                          ? 'btn-secondary'
                          : 'btn-outline'
                      }`}
                    >
                      <XCircleIcon className="mr-1.5 h-5 w-5" />
                      Absent
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-black p-8">
            <button
              type="submit"
              className="w-full bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
            >
              Submit Final Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageEventForm;
