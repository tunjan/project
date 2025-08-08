import React from 'react';
import { useEvents } from '@/store/appStore';

interface ParticipationHistoryProps {
  userId: string;
}

const ParticipationHistory: React.FC<ParticipationHistoryProps> = ({
  userId,
}) => {
  const allEvents = useEvents();

  const userHistory = allEvents
    .filter((event) => event.participants.some((p) => p.user.id === userId))
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .slice(0, 10);

  if (userHistory.length === 0) {
    return (
      <div className="card-brutal p-6 text-center">
        <p className="text-neutral-500">
          No participation history found. Attend a Cube to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="card-brutal">
      <ul className="divide-y-2 divide-black">
        {userHistory.map((event) => {
          const participation = event.participants.find(
            (p) => p.user.id === userId
          )!;
          const formattedDate = event.startDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });

          return (
            <li
              key={event.id}
              className="flex items-center justify-between space-x-4 p-4 transition-colors hover:bg-neutral-100"
            >
              <div>
                <p className="font-bold text-black">{event.location}</p>
                <p className="text-sm text-neutral-500">{event.city}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-medium text-black">
                  {formattedDate}
                </p>
                <p className="text-xs font-semibold text-neutral-500">
                  {participation.eventRole}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ParticipationHistory;
